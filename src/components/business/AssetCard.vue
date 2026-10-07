<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Asset } from '@/api/types'
import type { PosterScene } from '@/mock/models'
import PostShowcase from './PostShowcase.vue'
import VIcon from '../base/VIcon.vue'
import { formatBytes, formatClock, timeAgo, truncate } from '@/utils/format'

const props = withDefaults(
  defineProps<{ asset: Asset; selected?: boolean; selectable?: boolean; view?: 'grid' | 'list' }>(),
  { selected: false, selectable: false, view: 'grid' },
)
const emit = defineEmits<{
  toggle: [id: string]
  preview: [asset: Asset]
  favorite: [id: string]
  remove: [id: string]
}>()

const hover = ref(false)

const SCENES: PosterScene[] = ['aurora', 'dunes', 'ocean', 'city', 'cosmos', 'forest', 'neon', 'studio']
const hash = computed(() => {
  let h = 7
  for (const ch of props.asset.id) h = (h * 31 + ch.charCodeAt(0)) % 100000
  return h
})
const scene = computed(() => SCENES[hash.value % SCENES.length]!)
const ratio = computed(() => (props.asset.width / props.asset.height > 1.2 ? '16 / 9' : '3 / 4'))
</script>

<template>
  <article
    class="asset card card-hover group relative overflow-hidden"
    :class="[{ 'is-selected': selected }, view === 'list' ? 'flex !flex-row' : '']"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- 素材预览 -->
    <div class="relative shrink-0" :class="view === 'list' ? 'w-40' : ''">
      <PostShowcase
        :scene="scene"
        :seed="hash"
        :playing="hover && asset.type === 'video'"
        :ratio="view === 'list' ? '16 / 9' : ratio"
      />

      <!-- 选择框 -->
      <button
        v-if="selectable"
        class="absolute left-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-md border transition-all"
        :class="
          selected
            ? 'border-brand-500 bg-brand-500 text-white'
            : 'border-white/40 bg-black/40 text-transparent opacity-0 group-hover:opacity-100'
        "
        :aria-label="selected ? '取消选择' : '选择'"
        @click.stop="emit('toggle', asset.id)"
      >
        <VIcon name="check" :size="12" :stroke="2.6" />
      </button>

      <!-- 时长 / 类型角标 -->
      <div
        class="absolute bottom-2.5 right-2.5 rounded bg-black/60 px-1.5 py-[2px] font-mono text-[10.5px] text-ink backdrop-blur-md"
      >
        <template v-if="asset.type === 'video'">{{ formatClock(asset.duration ?? 0) }}</template>
        <template v-else><VIcon name="image" :size="11" /></template>
      </div>

      <div
        v-if="asset.source === 'generated'"
        class="absolute left-2.5 top-2.5 chip !bg-black/55 !text-[10px] backdrop-blur-md"
        :class="{ hidden: selectable }"
      >
        AI 生成
      </div>

      <!-- hover 操作条 -->
      <div
        class="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200"
        :class="hover ? 'opacity-100' : 'pointer-events-none opacity-0'"
      >
        <button class="btn-icon !border-white/15 !text-white hover:!bg-white/15" title="预览" @click.stop="emit('preview', asset)">
          <VIcon name="eye" :size="16" />
        </button>
        <button class="btn-icon !border-white/15 !text-white hover:!bg-white/15" title="下载" @click.stop>
          <VIcon name="download" :size="16" />
        </button>
        <button
          class="btn-icon !border-white/15 hover:!bg-white/15"
          :class="asset.favorite ? '!text-danger' : '!text-white'"
          title="收藏"
          @click.stop="emit('favorite', asset.id)"
        >
          <VIcon name="heart" :size="16" :filled="asset.favorite" />
        </button>
        <button
          class="btn-icon !border-white/15 !text-white hover:!bg-white/15 hover:!text-danger"
          title="删除"
          @click.stop="emit('remove', asset.id)"
        >
          <VIcon name="trash" :size="16" />
        </button>
      </div>
    </div>

    <!-- 信息 -->
    <div class="flex min-w-0 flex-1 flex-col p-3" :class="view === 'list' ? 'justify-center' : ''">
      <p v-if="asset.source === 'generated' && asset.prompt && view === 'grid'" class="line-clamp-2 text-[12.5px] leading-relaxed text-ink-2">
        {{ asset.prompt }}
      </p>
      <p v-else class="truncate text-[12.5px] font-medium text-ink-2">{{ asset.filename }}</p>

      <div class="mt-2 flex items-center gap-2 text-[11px] text-ink-4">
        <span v-if="asset.model" class="chip !py-0 !text-[10px]">{{ asset.model.name }}</span>
        <span class="font-mono">{{ formatBytes(asset.size_bytes) }}</span>
        <span v-if="view === 'list' && asset.prompt" class="hidden truncate md:inline">{{ truncate(asset.prompt, 40) }}</span>
        <span class="ml-auto shrink-0">{{ timeAgo(asset.created_at) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.asset.is-selected {
  border-color: rgba(124, 92, 255, 0.7);
  box-shadow: 0 0 0 1px rgba(124, 92, 255, 0.35);
}
</style>
