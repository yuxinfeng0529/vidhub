<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { modelApi } from '@/api'
import { TYPE_LABEL, type MockModel } from '@/mock/models'
import PostShowcase from '@/components/business/PostShowcase.vue'
import VendorMark from '@/components/business/VendorMark.vue'
import VIcon from '@/components/base/VIcon.vue'
import VEmpty from '@/components/base/VEmpty.vue'
import { RESOLUTION_HINT } from '@/constants'

const props = defineProps<{ slug: string }>()

const model = ref<MockModel | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    model.value = await modelApi.detail(props.slug)
  } finally {
    loading.value = false
  }
}
watch(() => props.slug, load, { immediate: true })

const maxDuration = computed(() => (model.value ? Math.max(...model.value.spec.durations) : 0))
const typeLabels = computed(() =>
  model.value ? model.value.types.map((t) => TYPE_LABEL[t]).join(' / ') : '',
)
</script>

<template>
  <div class="shell py-12">
    <div v-if="loading" class="space-y-6">
      <div class="skeleton h-8 w-64 rounded" />
      <div class="skeleton aspect-[21/9] rounded-xl" />
      <div class="skeleton h-32 rounded-xl" />
    </div>

    <VEmpty
      v-else-if="!model"
      icon="search"
      title="模型不存在"
      desc="该模型可能已下架，或者链接有误。"
      action-text="回到模型广场"
    />

    <template v-else>
      <!-- 面包屑 -->
      <nav class="mb-6 flex items-center gap-2 text-[12.5px] text-ink-4">
        <RouterLink to="/models" class="hover:text-ink">模型广场</RouterLink>
        <VIcon name="chevronRight" :size="12" />
        <span class="text-ink-2">{{ model.name }}</span>
      </nav>

      <div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <!-- 预览 -->
          <div class="overflow-hidden rounded-xl ring-1 ring-line">
            <PostShowcase :scene="model.scene" :seed="model.seed" ratio="16 / 9" playing />
          </div>

          <!-- 描述 -->
          <section class="mt-8">
            <h2 class="text-[17px] font-semibold">这个模型适合什么</h2>
            <div class="mt-3 space-y-3">
              <p
                v-for="(para, i) in model.description.split('\n\n')"
                :key="i"
                class="text-[13.5px] leading-[1.85] text-ink-2"
              >
                {{ para }}
              </p>
            </div>
          </section>

          <!-- 示例 -->
          <section v-if="model.examples.length" class="mt-10">
            <h2 class="text-[17px] font-semibold">示例提示词</h2>
            <div class="mt-4 space-y-3">
              <article
                v-for="(ex, i) in model.examples"
                :key="i"
                class="card flex items-start gap-4 p-4"
              >
                <div class="h-16 w-24 shrink-0 overflow-hidden rounded-md ring-1 ring-line-subtle">
                  <PostShowcase :scene="model.scene" :seed="model.seed + i * 3" ratio="16 / 9" />
                </div>
                <div class="min-w-0">
                  <p class="text-[13px] leading-relaxed text-ink">{{ ex.prompt }}</p>
                  <div class="mt-2 flex gap-1.5">
                    <span class="chip !py-0 !text-[10.5px]">{{ ex.params.duration }}s</span>
                    <span class="chip !py-0 !text-[10.5px]">{{ ex.params.resolution }}</span>
                  </div>
                </div>
                <RouterLink
                  :to="{ name: 'Studio', query: { model: model.slug } }"
                  class="btn-icon ml-auto shrink-0"
                  title="用这条提示词创作"
                >
                  <VIcon name="arrowUpRight" :size="15" />
                </RouterLink>
              </article>
            </div>
          </section>
        </div>

        <!-- 右栏 -->
        <aside class="lg:sticky lg:top-20 lg:self-start">
          <div class="card p-5">
            <div class="flex items-center gap-3">
              <VendorMark :slug="model.vendor.slug" :size="40" />
              <div class="min-w-0">
                <h1 class="truncate text-[20px] font-semibold">{{ model.name }}</h1>
                <p class="mt-0.5 text-[12.5px] text-ink-3">{{ model.vendor.name }}</p>
              </div>
            </div>

            <p class="mt-4 text-[13px] leading-relaxed text-ink-2">{{ model.tagline }}</p>

            <div class="mt-5 flex items-end justify-between border-y border-line-subtle py-4">
              <div>
                <p class="text-[11.5px] text-ink-4">每秒起价</p>
                <p class="mt-0.5 flex items-baseline gap-1">
                  <span class="font-mono text-[26px] font-semibold leading-none text-ink">
                    {{ model.pricing.from_credits }}
                  </span>
                  <span class="text-[12px] text-ink-3">积分</span>
                </p>
              </div>
              <div class="text-right">
                <p class="text-[11.5px] text-ink-4">最长时长</p>
                <p class="mt-0.5 font-mono text-[20px] font-semibold leading-none text-ink">
                  {{ maxDuration }}<span class="text-[12px] text-ink-3">s</span>
                </p>
              </div>
            </div>

            <RouterLink
              :to="{ name: 'Studio', query: { model: model.slug } }"
              class="btn-primary mt-5 w-full !h-11"
            >
              <VIcon name="sparkles" :size="15" />
              用它创作
            </RouterLink>

            <!-- 能力矩阵 -->
            <dl class="mt-5 space-y-2.5 text-[12.5px]">
              <div class="flex justify-between gap-4">
                <dt class="text-ink-4">生成模式</dt>
                <dd class="text-right text-ink-2">
                  {{ typeLabels }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-ink-4">可选时长</dt>
                <dd class="text-right font-mono text-ink-2">
                  {{ model.spec.durations.map((d) => `${d}s`).join(' / ') }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-ink-4">分辨率</dt>
                <dd class="text-right font-mono text-ink-2">
                  {{ model.spec.resolutions.join(' / ') }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-ink-4">画幅</dt>
                <dd class="text-right font-mono text-ink-2">
                  {{ model.spec.aspect_ratios.join(' / ') }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-ink-4">音频</dt>
                <dd class="text-right" :class="model.spec.supports_audio ? 'text-success' : 'text-ink-4'">
                  {{ model.spec.supports_audio ? '支持' : '不支持' }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-ink-4">提示词上限</dt>
                <dd class="text-right font-mono text-ink-2">{{ model.spec.max_prompt_length }} 字</dd>
              </div>
            </dl>

            <!-- 价格表 -->
            <div v-if="model.price_table.length" class="mt-6">
              <h3 class="text-[12.5px] font-medium text-ink-2">价格明细</h3>
              <table class="mt-2.5 w-full text-[12px]">
                <thead class="text-ink-4">
                  <tr>
                    <th class="pb-2 text-left font-normal">规格</th>
                    <th class="pb-2 text-right font-normal">积分</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line-subtle">
                  <tr v-for="row in model.price_table" :key="`${row.resolution}-${row.duration}-${row.audio}`">
                    <td class="py-2 text-ink-2">
                      {{ row.resolution }} · {{ row.duration }}s
                      <span v-if="row.audio" class="ml-1 text-accent-400">+音频</span>
                      <span class="block text-[10.5px] text-ink-4">{{ RESOLUTION_HINT[row.resolution] }}</span>
                    </td>
                    <td class="py-2 text-right font-mono text-ink">{{ row.credits }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 限制 -->
            <div v-if="model.limitations.length" class="mt-6 rounded-lg border border-line-subtle bg-inset p-3.5">
              <h3 class="flex items-center gap-1.5 text-[12px] font-medium text-warning">
                <VIcon name="alert" :size="13" />
                已知限制
              </h3>
              <ul class="mt-2 space-y-1.5">
                <li
                  v-for="l in model.limitations"
                  :key="l"
                  class="text-[11.5px] leading-relaxed text-ink-3"
                >
                  · {{ l }}
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>
