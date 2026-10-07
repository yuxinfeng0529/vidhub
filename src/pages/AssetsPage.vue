<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Asset } from '@/api/types'
import { useAssetStore } from '@/stores/assets'
import AssetCard from '@/components/business/AssetCard.vue'
import PostShowcase from '@/components/business/PostShowcase.vue'
import VModal from '@/components/base/VModal.vue'
import VEmpty from '@/components/base/VEmpty.vue'
import VProgress from '@/components/base/VProgress.vue'
import VIcon from '@/components/base/VIcon.vue'
import { formatBytes, formatClock, timeAgo } from '@/utils/format'

const store = useAssetStore()

const selectMode = ref(false)
const previewing = ref<Asset | null>(null)

const TABS = [
  { key: 'generated', label: '成片库', icon: 'film' },
  { key: 'upload', label: '素材库', icon: 'image' },
] as const

const visibleIds = computed(() => store.visible.map((a) => a.id))
const selectedCount = computed(() => store.selected.size)
const allSelected = computed(
  () => visibleIds.value.length > 0 && visibleIds.value.every((id) => store.selected.has(id)),
)

function toggleSelectMode() {
  selectMode.value = !selectMode.value
  if (!selectMode.value) store.clearSelection()
}

function confirmRemove(ids: string[]) {
  if (confirm(`确认删除 ${ids.length} 项资产？删除后无法恢复。`)) store.remove(ids)
}
</script>

<template>
  <div class="shell py-12">
    <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[28px] font-semibold sm:text-[34px]">资产库</h1>
        <p class="mt-2.5 text-[13.5px] text-ink-3">
          生成成功的视频会自动归档到这里，和你上传的素材放在一起。
        </p>
      </div>

      <!-- 存储配额 -->
      <div class="min-w-[240px] rounded-lg border border-line-subtle bg-surface px-4 py-3">
        <div class="flex items-baseline justify-between">
          <span class="text-[11.5px] text-ink-4">存储用量</span>
          <span class="font-mono text-[11.5px] text-ink-2">
            {{ formatBytes(store.usedBytes) }} / {{ formatBytes(store.quotaBytes) }}
          </span>
        </div>
        <div class="mt-2">
          <VProgress
            :value="store.quotaRatio * 100"
            :height="5"
            :tone="store.quotaRatio > 0.85 ? 'warning' : 'brand'"
          />
        </div>
      </div>
    </header>

    <!-- 工具条 -->
    <div class="glass mb-6 flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5">
      <div class="flex items-center gap-1 rounded-lg border border-line bg-inset p-1">
        <button
          v-for="t in TABS"
          :key="t.key"
          class="seg-item flex items-center gap-1.5 !py-1.5 !text-[12.5px]"
          :data-active="store.tab === t.key"
          @click="store.tab = t.key; store.clearSelection()"
        >
          <VIcon :name="t.icon" :size="13" />
          {{ t.label }}
          <span class="font-mono text-[11px] opacity-60">
            {{ store.items.filter((a) => a.source === t.key).length }}
          </span>
        </button>
      </div>

      <button
        class="seg-item flex items-center gap-1.5 !py-1.5 !text-[12.5px]"
        :data-active="store.onlyFavorite"
        @click="store.onlyFavorite = !store.onlyFavorite"
      >
        <VIcon name="heart" :size="13" :filled="store.onlyFavorite" />
        仅收藏
      </button>

      <div class="ml-auto flex items-center gap-2">
        <button
          class="seg-item flex items-center gap-1.5 !py-1.5 !text-[12.5px]"
          :data-active="selectMode"
          @click="toggleSelectMode"
        >
          <VIcon name="check" :size="13" />
          多选
        </button>

        <div class="flex items-center gap-1 rounded-lg border border-line bg-inset p-1">
          <button
            class="btn-icon !h-7 !w-7"
            :class="store.view === 'grid' ? '!bg-hover !text-ink' : ''"
            title="网格视图"
            @click="store.view = 'grid'"
          >
            <VIcon name="grid" :size="14" />
          </button>
          <button
            class="btn-icon !h-7 !w-7"
            :class="store.view === 'list' ? '!bg-hover !text-ink' : ''"
            title="列表视图"
            @click="store.view = 'list'"
          >
            <VIcon name="list" :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- 多选操作条 -->
    <Transition name="fold">
      <div
        v-if="selectMode && selectedCount"
        class="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-brand-500/35 bg-brand-500/10 px-4 py-3"
      >
        <span class="text-[13px] text-ink">
          已选 <span class="font-mono font-medium">{{ selectedCount }}</span> 项
        </span>
        <button class="text-[12.5px] text-ink-3 hover:text-ink" @click="allSelected ? store.clearSelection() : store.selectAll(visibleIds)">
          {{ allSelected ? '取消全选' : '全选本页' }}
        </button>
        <div class="ml-auto flex items-center gap-2">
          <button class="btn-ghost !h-8 !text-[12.5px]">
            <VIcon name="download" :size="13" />
            批量下载（打包 zip）
          </button>
          <button
            class="btn-ghost !h-8 !text-[12.5px] hover:!border-danger/60 hover:!text-danger"
            @click="confirmRemove([...store.selected])"
          >
            <VIcon name="trash" :size="13" />
            删除
          </button>
          <button class="btn-icon !h-8 !w-8" title="退出多选" @click="toggleSelectMode">
            <VIcon name="x" :size="15" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- 列表 -->
    <div
      v-if="store.visible.length"
      :class="
        store.view === 'grid'
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'space-y-3'
      "
    >
      <AssetCard
        v-for="a in store.visible"
        :key="a.id"
        :asset="a"
        :view="store.view"
        :selectable="selectMode"
        :selected="store.selected.has(a.id)"
        @toggle="store.toggleSelect"
        @favorite="store.toggleFavorite"
        @preview="previewing = $event"
        @remove="confirmRemove([$event])"
      />
    </div>

    <VEmpty
      v-else
      :icon="store.tab === 'generated' ? 'film' : 'image'"
      :title="store.tab === 'generated' ? '还没有生成过成片' : '还没有上传过素材'"
      :desc="
        store.tab === 'generated'
          ? '去工作台写一条提示词，生成成功的视频会自动出现在这里。'
          : '上传参考图或视频素材后，可以在这里管理、下载和再次创作。'
      "
      :action-text="store.tab === 'generated' ? '去工作台创作' : '上传素材'"
    />

    <!-- 预览弹窗 -->
    <VModal :open="!!previewing" width="960px" @close="previewing = null">
      <template #header>
        <div class="min-w-0">
          <h3 class="truncate text-[14px] font-semibold">
            {{ previewing?.filename }}
          </h3>
          <p class="mt-0.5 font-mono text-[11px] text-ink-4">
            {{ previewing?.width }} × {{ previewing?.height }} ·
            {{ previewing ? formatBytes(previewing.size_bytes) : '' }} ·
            {{ previewing ? timeAgo(previewing.created_at) : '' }}
          </p>
        </div>
      </template>

      <div v-if="previewing" class="p-5">
        <div class="overflow-hidden rounded-lg ring-1 ring-line">
          <PostShowcase
            :scene="previewing.source === 'generated' ? 'ocean' : 'studio'"
            :seed="previewing.id.length * 7"
            :ratio="previewing.width / previewing.height > 1.2 ? '16 / 9' : '3 / 4'"
            playing
          />
        </div>

        <div v-if="previewing.prompt" class="mt-4 rounded-lg border border-line-subtle bg-inset p-4">
          <p class="text-[11.5px] text-ink-4">提示词</p>
          <p class="mt-1.5 text-[13px] leading-relaxed text-ink-2">{{ previewing.prompt }}</p>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <span v-if="previewing.model" class="chip chip-brand">{{ previewing.model.name }}</span>
          <span v-if="previewing.duration" class="chip">{{ formatClock(previewing.duration) }}</span>
          <span class="chip">{{ previewing.source === 'generated' ? 'AI 生成' : '用户上传' }}</span>
          <div class="ml-auto flex gap-2">
            <button class="btn-ghost !h-9 !text-[12.5px]">
              <VIcon name="download" :size="14" />
              下载
            </button>
            <RouterLink to="/studio" class="btn-primary !h-9 !text-[12.5px]">
              <VIcon name="sparkles" :size="14" />
              再次创作
            </RouterLink>
          </div>
        </div>
      </div>
    </VModal>
  </div>
</template>

<style scoped>
.fold-enter-active,
.fold-leave-active {
  transition:
    opacity 0.2s,
    transform 0.24s var(--ease-out-expo);
}
.fold-enter-from,
.fold-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
