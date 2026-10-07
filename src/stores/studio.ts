import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { GenerateType, TaskParams } from '@/api/types'
import { MODELS, modelBySlug } from '@/mock/models'
import { clampParams, estimateCredits, paramSupported } from '@/utils/pricing'

const DRAFT_KEY = 'vidhub.studio.draft'

interface Draft {
  modelSlug: string
  type: GenerateType
  prompt: string
  negativePrompt: string
  params: TaskParams
  seedInput: string
}

const defaultDraft = (): Draft => ({
  modelSlug: 'kling-v3',
  type: 't2v',
  prompt: '',
  negativePrompt: '',
  params: { duration: 5, resolution: '1080p', aspect_ratio: '16:9', audio: false, seed: -1 },
  seedInput: '',
})

function loadDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return defaultDraft()
    const parsed = JSON.parse(raw) as Partial<Draft>
    return { ...defaultDraft(), ...parsed, params: { ...defaultDraft().params, ...parsed.params } }
  } catch {
    return defaultDraft()
  }
}

/**
 * 工作台草稿。
 *
 * 前端文档 §7.3：监听参数变化，debounce 500ms 写入 sessionStorage；
 * 用 sessionStorage 而非 localStorage，避免跨会话残留过期参数。
 */
export const useStudioStore = defineStore('studio', () => {
  const draft = ref<Draft>(loadDraft())
  const restored = ref(sessionStorage.getItem(DRAFT_KEY) !== null)

  const model = computed(() => modelBySlug(draft.value.modelSlug) ?? MODELS[0]!)
  const estimated = computed(() => estimateCredits(model.value.rules, draft.value.params))

  let timer: ReturnType<typeof setTimeout> | undefined
  watch(
    draft,
    (d) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d))
      }, 500)
    },
    { deep: true },
  )

  function selectModel(slug: string) {
    draft.value.modelSlug = slug
    draft.value.params = clampParams(model.value, draft.value.params)
    // 图生视频模型不支持文生视频时自动切回去
    if (!model.value.types.includes(draft.value.type)) {
      draft.value.type = model.value.types[0] ?? 't2v'
    }
  }

  function setParam<K extends keyof TaskParams>(key: K, value: TaskParams[K]) {
    draft.value.params[key] = value
  }

  function randomizeSeed() {
    const seed = Math.floor(Math.random() * 1_000_000)
    draft.value.params.seed = seed
    draft.value.seedInput = String(seed)
  }

  function applySeedInput() {
    const n = Number.parseInt(draft.value.seedInput, 10)
    draft.value.params.seed = Number.isFinite(n) ? n : -1
  }

  function reset() {
    draft.value = defaultDraft()
    sessionStorage.removeItem(DRAFT_KEY)
    restored.value = false
  }

  const canSubmit = computed(() => draft.value.prompt.trim().length > 0)
  const promptRatio = computed(
    () => draft.value.prompt.length / model.value.spec.max_prompt_length,
  )

  return {
    draft,
    model,
    estimated,
    restored,
    canSubmit,
    promptRatio,
    selectModel,
    setParam,
    randomizeSeed,
    applySeedInput,
    reset,
    paramSupported: (key: Parameters<typeof paramSupported>[1], value: number | string | boolean) =>
      paramSupported(model.value, key, value),
  }
})
