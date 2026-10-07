<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useStudioStore } from '@/stores/studio'
import { useTaskStore } from '@/stores/tasks'
import { useWalletStore } from '@/stores/wallet'
import { modelBySlug } from '@/mock/models'
import { formatCredits, creditsToYuan, truncate } from '@/utils/format'
import { ASPECT_CLASS } from '@/constants'
import StudioModelPicker from '@/components/studio/StudioModelPicker.vue'
import StudioParams from '@/components/studio/StudioParams.vue'
import PostShowcase from '@/components/business/PostShowcase.vue'
import TaskCard from '@/components/business/TaskCard.vue'
import VProgress from '@/components/base/VProgress.vue'
import VIcon from '@/components/base/VIcon.vue'

const route = useRoute()
const router = useRouter()
const studio = useStudioStore()
const tasks = useTaskStore()
const wallet = useWalletStore()

const { draft, model, estimated, restored } = storeToRefs(studio)
const { queue } = storeToRefs(tasks)

/* ── 从 URL 带入模型（模型广场点「立即创作」跳过来） ── */
onMounted(() => {
  const slug = route.query.model
  if (typeof slug === 'string' && modelBySlug(slug)) studio.selectModel(slug)
})
watch(
  () => route.query.model,
  (slug) => {
    if (typeof slug === 'string' && modelBySlug(slug)) studio.selectModel(slug)
  },
)

/* ── 参考图 ── */
const refImage = ref<{ name: string; url: string; size: number } | null>(null)
const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function acceptFile(file: File | undefined) {
  if (!file || !file.type.startsWith('image/')) return
  if (refImage.value) URL.revokeObjectURL(refImage.value.url)
  refImage.value = { name: file.name, url: URL.createObjectURL(file), size: file.size }
}

function onDrop(e: DragEvent) {
  dragging.value = false
  acceptFile(e.dataTransfer?.files?.[0])
}

function clearRefImage() {
  if (refImage.value) URL.revokeObjectURL(refImage.value.url)
  refImage.value = null
}

onBeforeUnmount(() => {
  if (refImage.value) URL.revokeObjectURL(refImage.value.url)
})

/* ── 提交 ── */
const submitError = ref('')
const insufficient = computed(() => estimated.value > wallet.available)

async function submit() {
  submitError.value = ''
  if (!studio.canSubmit) return
  if (insufficient.value) {
    router.push('/pricing')
    return
  }
  try {
    await tasks.create({
      model: draft.value.modelSlug,
      type: draft.value.type,
      prompt: draft.value.prompt,
      negative_prompt: draft.value.negativePrompt || undefined,
      params: { ...draft.value.params },
      first_frame_asset_id: refImage.value ? 'a_local_ref' : null,
    })
    // 提交成功后清掉参考图，但保留提示词与参数，方便「同参数再来一条」
    clearRefImage()
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : '提交失败，请重试'
  }
}

/* ── 提示词优化（演示：本地扩写，真实项目走 LLM） ── */
const optimizing = ref(false)
async function optimize() {
  if (!draft.value.prompt.trim()) return
  optimizing.value = true
  await new Promise((r) => setTimeout(r, 900))
  const tail = '，电影质感，浅景深，柔和自然光，画面稳定，细节丰富'
  if (!draft.value.prompt.includes('电影质感')) draft.value.prompt += tail
  optimizing.value = false
}

/* ── 右侧结果区 ── */
const current = computed(() => queue.value[0] ?? null)
const finishedTask = computed(() =>
  queue.value.find((t) => t.status === 'succeeded' && t.assets.length),
)
const previewTask = computed(() => current.value ?? finishedTask.value ?? null)
const aspect = computed(
  () => ASPECT_CLASS[previewTask.value?.params.aspect_ratio ?? '16:9'] ?? '16 / 9',
)

function reusePrompt(prompt: string) {
  draft.value.prompt = prompt
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="relative min-h-[calc(100vh-64px)]">
    <div class="shell grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
      <!-- ═══════════ 左：创作区 ═══════════ -->
      <section class="min-w-0">
        <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-[24px] font-semibold">生成工作台</h1>
            <p class="mt-1.5 text-[13px] text-ink-3">
              选模型 → 写提示词 → 调参数。价格随参数实时变化，提交前就能看到要花多少。
            </p>
          </div>
          <button class="btn-ghost !h-8 !text-[12px]" @click="studio.reset()">
            <VIcon name="refresh" :size="13" />
            清空重来
          </button>
        </header>

        <p
          v-if="restored && draft.prompt"
          class="mb-4 flex items-center gap-2 rounded-lg border border-brand-500/30 bg-brand-500/8 px-3.5 py-2.5 text-[12.5px] text-brand-300"
        >
          <VIcon name="clock" :size="14" />
          已恢复上次编辑的内容
          <button class="ml-auto text-ink-4 hover:text-ink" @click="studio.reset()">丢弃</button>
        </p>

        <div class="card p-5">
          <!-- 模型选择 -->
          <label class="mb-2 block text-[12.5px] font-medium text-ink-2">模型</label>
          <StudioModelPicker :model="model" @select="studio.selectModel" />

          <!-- 提示词 -->
          <div class="mt-5">
            <div class="mb-2 flex items-baseline justify-between">
              <label class="text-[12.5px] font-medium text-ink-2">提示词</label>
              <div class="flex items-center gap-3">
                <span
                  class="font-mono text-[11px]"
                  :class="studio.promptRatio > 0.9 ? 'text-warning' : 'text-ink-4'"
                >
                  {{ draft.prompt.length }} / {{ model.spec.max_prompt_length }}
                </span>
                <button
                  class="flex items-center gap-1 text-[11.5px] text-brand-300 transition-opacity hover:opacity-80 disabled:opacity-40"
                  :disabled="!draft.prompt.trim() || optimizing"
                  @click="optimize"
                >
                  <VIcon name="wand" :size="12" />
                  {{ optimizing ? '优化中…' : '优化提示词' }}
                </button>
              </div>
            </div>
            <textarea
              v-model="draft.prompt"
              rows="4"
              :maxlength="model.spec.max_prompt_length"
              class="field resize-none !leading-relaxed"
              placeholder="描述你想要的画面。比如：一只柯基在草地上奔跑，阳光明媚，电影质感，浅景深"
            />
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="sample in ['电影质感，浅景深', '慢动作，高速摄影', '环绕运镜，镜头推近', '柔和自然光']"
                :key="sample"
                class="chip transition-colors hover:border-brand-500/50 hover:text-brand-300"
                @click="draft.prompt = draft.prompt ? `${draft.prompt}，${sample}` : sample"
              >
                <VIcon name="plus" :size="10" />
                {{ sample }}
              </button>
            </div>
          </div>

          <!-- 参考图（图生视频才显示） -->
          <Transition name="fold">
            <div v-if="draft.type === 'i2v'" class="mt-5">
              <label class="mb-2 block text-[12.5px] font-medium text-ink-2">
                参考图
                <span class="ml-1 font-normal text-ink-4">作为第一帧</span>
              </label>

              <div
                v-if="!refImage"
                class="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed py-8 transition-colors"
                :class="dragging ? 'border-brand-500/70 bg-brand-500/8' : 'border-line hover:border-line-strong'"
                @click="fileInput?.click()"
                @dragover.prevent="dragging = true"
                @dragleave.prevent="dragging = false"
                @drop.prevent="onDrop"
              >
                <VIcon name="upload" :size="20" class="text-ink-3" />
                <p class="mt-2.5 text-[13px] text-ink-2">拖拽图片到这里，或点击选择</p>
                <p class="mt-1 text-[11px] text-ink-4">支持 JPG / PNG / WebP，单张不超过 10 MB</p>
              </div>

              <div v-else class="flex items-center gap-3 rounded-lg border border-line bg-inset p-3">
                <img :src="refImage.url" alt="" class="h-14 w-14 rounded-md object-cover" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[12.5px] text-ink">{{ refImage.name }}</p>
                  <p class="mt-0.5 font-mono text-[11px] text-ink-4">
                    {{ (refImage.size / 1024 / 1024).toFixed(2) }} MB
                  </p>
                </div>
                <button class="btn-icon" title="移除" @click="clearRefImage">
                  <VIcon name="x" :size="15" />
                </button>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="acceptFile(($event.target as HTMLInputElement).files?.[0])"
              />
            </div>
          </Transition>

          <!-- 参数 -->
          <div class="mt-6 border-t border-line-subtle pt-5">
            <StudioParams
              :model="model"
              :params="draft.params"
              :type="draft.type"
              :seed-input="draft.seedInput"
              :negative-prompt="draft.negativePrompt"
              @update:params="(p) => Object.assign(draft.params, p)"
              @update:type="draft.type = $event"
              @update:seed-input="draft.seedInput = $event"
              @update:negative-prompt="draft.negativePrompt = $event"
              @randomize-seed="studio.randomizeSeed"
              @apply-seed="studio.applySeedInput"
            />
          </div>
        </div>

        <!-- ═══ 计价条 ═══ -->
        <div class="glass sticky bottom-4 z-10 mt-4 rounded-xl px-5 py-4">
          <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p class="text-[11.5px] text-ink-4">本次预计消耗</p>
              <p class="mt-0.5 flex items-baseline gap-1.5">
                <span class="font-mono text-[24px] font-semibold leading-none text-ink">
                  {{ estimated }}
                </span>
                <span class="text-[12px] text-ink-3">积分</span>
                <span class="ml-1 font-mono text-[12px] text-ink-4">
                  ≈ {{ creditsToYuan(estimated) }}
                </span>
              </p>
            </div>

            <div class="h-8 w-px bg-line-subtle" />

            <div>
              <p class="text-[11.5px] text-ink-4">余额</p>
              <p class="mt-0.5 font-mono text-[15px] font-medium" :class="insufficient ? 'text-danger' : 'text-ink'">
                {{ formatCredits(wallet.available, false) }}
                <span v-if="wallet.frozen" class="ml-1 text-[11px] text-ink-4">
                  （冻结 {{ wallet.frozen }}）
                </span>
              </p>
            </div>

            <div class="ml-auto flex items-center gap-3">
              <p v-if="submitError" class="text-[12px] text-danger">{{ submitError }}</p>
              <button
                class="btn-primary !h-11 min-w-[150px] !text-[14.5px]"
                :disabled="!studio.canSubmit || tasks.submitting"
                @click="submit"
              >
                <template v-if="tasks.submitting">
                  <span class="spin h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white" />
                  提交中…
                </template>
                <template v-else-if="insufficient">
                  余额不足，去充值
                </template>
                <template v-else>
                  <VIcon name="sparkles" :size="15" />
                  立即生成
                </template>
              </button>
            </div>
          </div>

          <p class="mt-3 border-t border-line-subtle pt-2.5 text-[11px] text-ink-4">
            提交时按最高可能消耗冻结积分，成功后按实际用量结算并解冻差额，失败或超时全额退回。
          </p>
        </div>
      </section>

      <!-- ═══════════ 右：结果区 ═══════════ -->
      <aside class="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <!-- 结果预览 -->
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between border-b border-line-subtle px-4 py-3">
            <h2 class="text-[13.5px] font-semibold">生成结果</h2>
            <span v-if="previewTask" class="font-mono text-[11px] text-ink-4">
              {{ previewTask.id }}
            </span>
          </div>

          <div v-if="!previewTask" class="px-5 py-12 text-center">
            <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-line bg-elevated text-ink-3">
              <VIcon name="film" :size="22" />
            </div>
            <p class="mt-4 text-[13.5px] text-ink-2">还没有生成记录</p>
            <p class="mt-1.5 text-[12px] leading-relaxed text-ink-4">
              写好提示词点「立即生成」，这里会实时显示进度
            </p>
          </div>

          <div v-else class="p-4">
            <div class="relative overflow-hidden rounded-lg ring-1 ring-line">
              <PostShowcase
                :scene="model.scene"
                :seed="model.seed"
                :ratio="aspect"
                :playing="previewTask.status === 'running' || previewTask.status === 'succeeded'"
              />

              <!-- 进行中遮罩 -->
              <div
                v-if="previewTask.status !== 'succeeded' && previewTask.status !== 'failed'"
                class="absolute inset-0 flex flex-col justify-end bg-black/45 p-4 backdrop-blur-[2px]"
              >
                <div class="mb-auto" />
                <div v-if="previewTask.status === 'running'" class="mb-auto grid place-items-center pt-10">
                  <span class="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md">
                    <span class="spin h-5 w-5 rounded-full border-2 border-white/25 border-t-accent-400" />
                  </span>
                </div>
                <p class="mb-2 text-[12px] text-white/90">
                  <template v-if="previewTask.status === 'created'">正在创建任务…</template>
                  <template v-else-if="previewTask.status === 'queued'">
                    排队中{{ previewTask.queue_ahead ? ` · 前方还有 ${previewTask.queue_ahead} 个任务` : '' }}
                  </template>
                  <template v-else>生成中 · {{ previewTask.progress }}%</template>
                </p>
                <VProgress
                  :value="previewTask.status === 'running' ? previewTask.progress : 6"
                  tone="accent"
                  :height="4"
                  :animated="previewTask.status !== 'created'"
                />
              </div>

              <!-- 失败遮罩 -->
              <div
                v-if="previewTask.status === 'failed'"
                class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/65 p-6 text-center backdrop-blur-[2px]"
              >
                <span class="grid h-11 w-11 place-items-center rounded-full bg-danger/15 text-danger">
                  <VIcon name="alert" :size="20" />
                </span>
                <p class="text-[13px] font-medium text-ink">生成失败</p>
                <p class="max-w-[220px] text-[11.5px] leading-relaxed text-ink-3">
                  {{ previewTask.error?.message }}
                </p>
                <button class="btn-ghost mt-1 !h-8 !text-[12px]" @click="tasks.retry(previewTask.id)">
                  <VIcon name="refresh" :size="13" />
                  重试
                </button>
              </div>
            </div>

            <!-- 参数回显 -->
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span class="chip">{{ previewTask.model.name }}</span>
              <span class="chip">{{ previewTask.params.duration }}s</span>
              <span class="chip">{{ previewTask.params.resolution }}</span>
              <span class="chip">{{ previewTask.params.aspect_ratio }}</span>
              <span v-if="previewTask.params.audio" class="chip chip-accent">音频</span>
            </div>

            <p class="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-ink-3">
              {{ truncate(previewTask.prompt, 70) }}
            </p>

            <!-- 操作 -->
            <div v-if="previewTask.status === 'succeeded'" class="mt-3.5 grid grid-cols-3 gap-2">
              <button class="btn-ghost !h-9 !px-0 !text-[12.5px]">
                <VIcon name="download" :size="14" />
                下载
              </button>
              <RouterLink to="/assets" class="btn-ghost !h-9 !px-0 !text-[12.5px]">
                <VIcon name="archive" :size="14" />
                资产库
              </RouterLink>
              <button class="btn-ghost !h-9 !px-0 !text-[12.5px]" @click="reusePrompt(previewTask.prompt)">
                <VIcon name="refresh" :size="14" />
                再来一条
              </button>
            </div>
          </div>
        </div>

        <!-- 队列 -->
        <div class="mt-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-[13.5px] font-semibold">
              本次队列
              <span v-if="tasks.activeCount" class="chip chip-accent !py-0 !text-[10.5px]">
                {{ tasks.activeCount }} 进行中
              </span>
            </h2>
            <button
              v-if="queue.length > tasks.activeCount"
              class="text-[11.5px] text-ink-4 transition-colors hover:text-ink"
              @click="tasks.clearFinished()"
            >
              清除已完成
            </button>
          </div>

          <div v-if="!queue.length" class="rounded-lg border border-dashed border-line px-4 py-8 text-center">
            <p class="text-[12.5px] text-ink-4">队列为空</p>
            <p class="mt-1 text-[11.5px] text-ink-4/70">提交任务后会出现在这里</p>
          </div>

          <div v-else class="no-scrollbar max-h-[420px] space-y-2.5 overflow-y-auto pr-0.5">
            <TaskCard
              v-for="t in queue"
              :key="t.id"
              :task="t"
              dense
              @cancel="tasks.cancel"
              @retry="tasks.retry"
            />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.spin {
  display: inline-block;
  animation: spin-c 0.8s linear infinite;
}
@keyframes spin-c {
  to {
    transform: rotate(360deg);
  }
}
.fold-enter-active,
.fold-leave-active {
  transition:
    opacity 0.2s,
    transform 0.24s var(--ease-out-expo);
}
.fold-enter-from,
.fold-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
