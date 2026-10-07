<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { MODELS, TYPE_LABEL, type MockModel } from '@/mock/models'
import VendorMark from '../business/VendorMark.vue'
import VIcon from '../base/VIcon.vue'

const props = defineProps<{ model: MockModel }>()
const emit = defineEmits<{ select: [slug: string] }>()

const open = ref(false)
const keyword = ref('')
const root = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

const list = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  const base = MODELS.filter((m) =>
    kw ? [m.name, m.vendor.name, m.tagline, ...m.tags].join(' ').toLowerCase().includes(kw) : true,
  )
  // 可用优先，其次按推荐权重
  return base.sort((a, b) => {
    const ua = a.status === 'available' ? 0 : 1
    const ub = b.status === 'available' ? 0 : 1
    return ua - ub || b.sort_weight - a.sort_weight
  })
})

async function toggle() {
  open.value = !open.value
  if (open.value) {
    await Promise.resolve()
    searchInput.value?.focus()
  }
}

function pick(m: MockModel) {
  if (m.status !== 'available') return
  emit('select', m.slug)
  open.value = false
  keyword.value = ''
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})

const maxDuration = (m: MockModel) => Math.max(...m.spec.durations)
const typeLabels = (m: MockModel) => m.types.map((t) => TYPE_LABEL[t]).join('/')
</script>

<template>
  <div ref="root" class="relative">
    <!-- 触发按钮 -->
    <button
      class="group flex w-full items-center gap-3 rounded-lg border border-line bg-inset px-3.5 py-3 text-left transition-colors hover:border-line-strong"
      :aria-expanded="open"
      @click="toggle"
    >
      <VendorMark :slug="model.vendor.slug" :size="34" />
      <span class="min-w-0 flex-1">
        <span class="flex items-center gap-2">
          <span class="truncate text-[14px] font-medium text-ink">{{ model.name }}</span>
          <span v-if="model.recommended" class="chip chip-brand !py-0 !text-[10px]">推荐</span>
        </span>
        <span class="mt-0.5 block truncate text-[12px] text-ink-3">
          {{ model.vendor.name }} · {{ model.tagline }}
        </span>
      </span>
      <span class="shrink-0 text-right">
        <span class="block font-mono text-[14px] font-medium text-ink">
          {{ model.pricing.from_credits }}
        </span>
        <span class="block text-[10.5px] text-ink-4">积分/秒起</span>
      </span>
      <VIcon
        name="chevronDown"
        :size="16"
        class="shrink-0 text-ink-4 transition-transform duration-250"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <!-- 下拉面板 -->
    <Transition name="pop">
      <div
        v-if="open"
        class="glass absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl shadow-[0_28px_70px_-20px_rgba(0,0,0,0.95)]"
      >
        <div class="border-b border-line-subtle p-2.5">
          <div class="relative">
            <VIcon
              name="search"
              :size="14"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"
            />
            <input
              ref="searchInput"
              v-model="keyword"
              class="field !py-2 !pl-9 !text-[13px]"
              placeholder="搜索模型或厂商"
            />
          </div>
        </div>

        <ul class="max-h-[380px] overflow-y-auto p-1.5">
          <li v-for="m in list" :key="m.slug">
            <button
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
              :class="[
                m.status === 'available' ? 'hover:bg-hover' : 'cursor-not-allowed opacity-40',
                m.slug === model.slug ? 'bg-brand-500/12' : '',
              ]"
              :disabled="m.status !== 'available'"
              @click="pick(m)"
            >
              <VendorMark :slug="m.vendor.slug" :size="28" />
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="truncate text-[13.5px] font-medium text-ink">{{ m.name }}</span>
                  <span v-if="m.status !== 'available'" class="chip !py-0 !text-[10px]">维护中</span>
                </span>
                <span class="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-4">
                  <span>{{ m.vendor.name }}</span>
                  <span class="text-ink-4/50">·</span>
                  <span>最长 {{ maxDuration(m) }}s</span>
                  <span class="text-ink-4/50">·</span>
                  <span>{{ typeLabels(m) }}</span>
                  <template v-if="m.spec.supports_audio">
                    <span class="text-ink-4/50">·</span>
                    <span>音频</span>
                  </template>
                </span>
              </span>
              <span class="shrink-0 text-right">
                <span class="block font-mono text-[13px] text-ink-2">{{ m.pricing.from_credits }}</span>
                <span class="block text-[10px] text-ink-4">积分/秒</span>
              </span>
              <VIcon
                v-if="m.slug === model.slug"
                name="check"
                :size="15"
                class="shrink-0 text-brand-400"
              />
            </button>
          </li>
          <li v-if="!list.length" class="px-3 py-8 text-center text-[13px] text-ink-4">
            没有匹配的模型
          </li>
        </ul>

        <div class="flex items-center justify-between border-t border-line-subtle px-3.5 py-2.5">
          <span class="text-[11.5px] text-ink-4">共 {{ MODELS.length }} 个模型 · 演示数据</span>
          <RouterLink to="/models" class="text-[12px] text-brand-300 hover:underline" @click="open = false">
            去模型广场对比 →
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.18s var(--ease-swift),
    transform 0.24s var(--ease-out-expo);
  transform-origin: top center;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.985);
}
</style>
