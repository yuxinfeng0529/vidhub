import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Asset, Task } from '@/api/types'
import { assetApi } from '@/api'

export type AssetTab = 'generated' | 'upload'
export type AssetView = 'grid' | 'list'

export const useAssetStore = defineStore('assets', () => {
  const items = ref<Asset[]>([])
  const loading = ref(false)
  const tab = ref<AssetTab>('generated')
  const view = ref<AssetView>('grid')
  const selected = ref<Set<string>>(new Set())
  const onlyFavorite = ref(false)
  const quotaBytes = ref(10 * 1024 * 1024 * 1024)

  async function fetch() {
    loading.value = true
    try {
      const res = await assetApi.list()
      items.value = res.items
      quotaBytes.value = res.quota_bytes
    } finally {
      loading.value = false
    }
  }

  /** 任务成功后自动归档——「生成即入资产库」这句宣传语的实际实现 */
  function addFromTask(task: Task) {
    if (!task.assets.length) return
    const additions: Asset[] = task.assets.map((a) => ({
      id: a.id,
      type: a.type,
      url: a.url,
      poster_url: a.poster_url,
      filename: `${task.model.slug}_${task.id}.mp4`,
      source: 'generated',
      model: { ...task.model },
      prompt: task.prompt,
      duration: a.duration,
      width: a.width,
      height: a.height,
      size_bytes: a.size_bytes,
      favorite: false,
      created_at: new Date().toISOString(),
      task_id: task.id,
    }))
    items.value = [...additions, ...items.value]
  }

  function toggleFavorite(id: string) {
    const a = items.value.find((x) => x.id === id)
    if (a) a.favorite = !a.favorite
  }

  function toggleSelect(id: string) {
    const next = new Set(selected.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selected.value = next
  }

  function selectAll(ids: string[]) {
    selected.value = new Set(ids)
  }

  function clearSelection() {
    selected.value = new Set()
  }

  function remove(ids: string[]) {
    const set = new Set(ids)
    items.value = items.value.filter((a) => !set.has(a.id))
    clearSelection()
  }

  /** 按 Tab / 收藏 / 关键词过滤后的列表 */
  const visible = computed(() => {
    let list = items.value.filter((a) => a.source === tab.value)
    if (onlyFavorite.value) list = list.filter((a) => a.favorite)
    return list
  })

  const usedBytes = computed(() => items.value.reduce((s, a) => s + a.size_bytes, 0))
  const quotaRatio = computed(() => Math.min(1, usedBytes.value / quotaBytes.value))

  return {
    items,
    loading,
    tab,
    view,
    selected,
    onlyFavorite,
    quotaBytes,
    visible,
    usedBytes,
    quotaRatio,
    fetch,
    addFromTask,
    toggleFavorite,
    toggleSelect,
    selectAll,
    clearSelection,
    remove,
  }
})
