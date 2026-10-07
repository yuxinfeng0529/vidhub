<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { GenerateType } from '@/api/types'
import { modelApi, type ModelQuery } from '@/api'
import { VENDORS, TYPE_LABEL, type MockModel } from '@/mock/models'
import ModelCard from '@/components/business/ModelCard.vue'
import AuroraBackdrop from '@/components/layout/AuroraBackdrop.vue'
import VEmpty from '@/components/base/VEmpty.vue'
import VIcon from '@/components/base/VIcon.vue'

/**
 * 模型广场。
 * 筛选条件与 URL query 双向同步（前端文档 §7.2），保证可分享、可刷新、可后退。
 */
const route = useRoute()
const router = useRouter()

const models = ref<MockModel[]>([])
const loading = ref(true)

const SORTS = [
  { key: 'recommend', label: '推荐' },
  { key: 'price_asc', label: '价格从低到高' },
  { key: 'price_desc', label: '价格从高到低' },
  { key: 'newest', label: '最新上线' },
] as const

const DURATION_FILTERS = [
  { key: 0, label: '不限' },
  { key: 10, label: '≥ 10 秒' },
  { key: 15, label: '≥ 15 秒' },
  { key: 30, label: '≥ 30 秒' },
] as const

/** URL → 本地筛选状态 */
function readQuery(): ModelQuery {
  const q = route.query
  const types = String(q.type ?? '')
    .split(',')
    .filter(Boolean) as GenerateType[]
  const vendors = String(q.vendor ?? '')
    .split(',')
    .filter(Boolean)
  return {
    types,
    vendors,
    max_duration_gte: Number(q.min_duration ?? 0) || undefined,
    audio: q.audio === '1',
    price_max: Number(q.price_max ?? 0) || undefined,
    sort: (q.sort as ModelQuery['sort']) ?? 'recommend',
    q: String(q.q ?? ''),
  }
}

const filters = ref<ModelQuery>(readQuery())
const keyword = ref(filters.value.q ?? '')

/** 本地筛选状态 → URL */
function writeQuery(next: ModelQuery) {
  const query: Record<string, string> = {}
  if (next.types?.length) query.type = next.types.join(',')
  if (next.vendors?.length) query.vendor = next.vendors.join(',')
  if (next.max_duration_gte) query.min_duration = String(next.max_duration_gte)
  if (next.audio) query.audio = '1'
  if (next.price_max) query.price_max = String(next.price_max)
  if (next.sort && next.sort !== 'recommend') query.sort = next.sort
  if (next.q) query.q = next.q
  router.replace({ query })
}

async function run() {
  loading.value = true
  try {
    const res = await modelApi.list(filters.value)
    models.value = res.items
  } finally {
    loading.value = false
  }
}

onMounted(run)
watch(filters, (v) => { writeQuery(v); void run() }, { deep: true })

let kwTimer: ReturnType<typeof setTimeout> | undefined
watch(keyword, (kw) => {
  clearTimeout(kwTimer)
  kwTimer = setTimeout(() => { filters.value.q = kw }, 320)
})

function toggleType(t: GenerateType) {
  const list = new Set(filters.value.types ?? [])
  if (list.has(t)) list.delete(t)
  else list.add(t)
  filters.value.types = [...list]
}

function toggleVendor(slug: string) {
  const list = new Set(filters.value.vendors ?? [])
  if (list.has(slug)) list.delete(slug)
  else list.add(slug)
  filters.value.vendors = [...list]
}

const activeCount = computed(
  () =>
    (filters.value.types?.length ?? 0) +
    (filters.value.vendors?.length ?? 0) +
    (filters.value.max_duration_gte ? 1 : 0) +
    (filters.value.audio ? 1 : 0) +
    (filters.value.price_max ? 1 : 0),
)

function resetAll() {
  keyword.value = ''
  filters.value = { types: [], vendors: [], sort: 'recommend', q: '' }
}
</script>

<template>
  <div class="relative">
    <AuroraBackdrop variant="page" />

    <div class="shell relative z-10 py-12">
      <header class="mb-10 max-w-2xl">
        <p class="text-[12px] font-medium uppercase tracking-[0.16em] text-brand-400">模型广场</p>
        <h1 class="mt-3 text-[30px] font-semibold sm:text-[38px]">挑一个模型开始</h1>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-2">
          每个模型都标着单价和它最擅长什么。价格是演示用的占位数据，上线前需要按实际签约渠道核对。
        </p>
      </header>

      <!-- ── 筛选条 ── -->
      <div class="glass sticky top-16 z-20 -mx-1 mb-8 rounded-xl px-4 py-4">
        <!-- 第一行：搜索 + 排序 -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative min-w-[220px] flex-1">
            <VIcon
              name="search"
              :size="15"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"
            />
            <input
              v-model="keyword"
              class="field !pl-9"
              placeholder="搜索模型名、厂商或能力，例如「音频」「运镜」"
            />
          </div>

          <div class="flex items-center gap-1 rounded-lg border border-line bg-inset p-1">
            <button
              v-for="s in SORTS"
              :key="s.key"
              class="seg-item !py-1.5 !text-[12.5px]"
              :data-active="filters.sort === s.key"
              @click="filters.sort = s.key"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- 第二行：类型 / 时长 / 音频 / 价格 -->
        <div class="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-3 text-[12.5px]">
          <div class="flex items-center gap-2">
            <span class="text-ink-4">类型</span>
            <button
              v-for="(label, key) in TYPE_LABEL"
              :key="key"
              class="seg-item !py-1 !text-[12.5px]"
              :data-active="filters.types?.includes(key)"
              @click="toggleType(key)"
            >
              {{ label }}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-ink-4">时长</span>
            <button
              v-for="d in DURATION_FILTERS"
              :key="d.key"
              class="seg-item !py-1 !text-[12.5px]"
              :data-active="(filters.max_duration_gte ?? 0) === d.key"
              @click="filters.max_duration_gte = d.key || undefined"
            >
              {{ d.label }}
            </button>
          </div>

          <button
            class="seg-item !py-1 !text-[12.5px]"
            :data-active="filters.audio"
            @click="filters.audio = !filters.audio"
          >
            支持音频
          </button>

          <div class="flex items-center gap-2">
            <span class="text-ink-4">单价上限</span>
            <input
              :value="filters.price_max ?? ''"
              type="number"
              min="0"
              placeholder="不限"
              class="field !w-24 !py-1.5 !text-[12.5px]"
              @input="filters.price_max = Number(($event.target as HTMLInputElement).value) || undefined"
            />
            <span class="text-ink-4">积分/秒</span>
          </div>

          <button
            v-if="activeCount"
            class="ml-auto flex items-center gap-1.5 text-ink-3 transition-colors hover:text-ink"
            @click="resetAll"
          >
            <VIcon name="x" :size="13" />
            清空 {{ activeCount }} 个筛选
          </button>
        </div>

        <!-- 第三行：厂商 -->
        <div class="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-line-subtle pt-3.5">
          <span class="mr-1 text-[12.5px] text-ink-4">厂商</span>
          <button
            v-for="v in VENDORS"
            :key="v.slug"
            class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-all"
            :class="
              filters.vendors?.includes(v.slug)
                ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
                : 'border-line bg-elevated/50 text-ink-2 hover:border-line-strong hover:text-ink'
            "
            @click="toggleVendor(v.slug)"
          >
            <span
              class="h-3.5 w-3.5 rounded-[4px]"
              :style="{ backgroundImage: `linear-gradient(135deg, ${v.from}, ${v.to})` }"
            />
            {{ v.name }}
          </button>
        </div>
      </div>

      <!-- ── 结果 ── -->
      <div class="mb-5 flex items-center justify-between">
        <p class="text-[13px] text-ink-3">
          共 <span class="font-mono text-ink">{{ models.length }}</span> 个模型
        </p>
        <p class="hidden text-[12px] text-ink-4 sm:block">价格为「每秒基准价」，实际按参数浮动</p>
      </div>

      <!-- 骨架屏：数量与当前筛选匹配 -->
      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="i in 8" :key="i" class="card overflow-hidden">
          <div class="skeleton aspect-video" />
          <div class="space-y-2.5 p-4">
            <div class="skeleton h-4 w-2/3 rounded" />
            <div class="skeleton h-3 w-full rounded" />
            <div class="skeleton h-3 w-1/3 rounded" />
          </div>
        </div>
      </div>

      <div v-else-if="!models.length">
        <VEmpty
          icon="filter"
          title="没有匹配的模型"
          desc="试试放宽筛选条件，或者清空全部筛选重新开始。"
          action-text="清空筛选"
          @action="resetAll"
        />
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ModelCard v-for="m in models" :key="m.slug" :model="m" />
      </div>
    </div>
  </div>
</template>
