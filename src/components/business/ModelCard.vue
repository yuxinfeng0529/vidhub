<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { MockModel } from '@/mock/models'
import { TYPE_LABEL } from '@/mock/models'
import PostShowcase from './PostShowcase.vue'
import VendorMark from './VendorMark.vue'
import VIcon from '../base/VIcon.vue'

const props = defineProps<{ model: MockModel }>()

const router = useRouter()
const hover = ref(false)

const unavailable = computed(() => props.model.status !== 'available')
const maxDuration = computed(() => Math.max(...props.model.spec.durations))

function create() {
  if (unavailable.value) return
  router.push({ name: 'Studio', query: { model: props.model.slug } })
}
</script>

<template>
  <article
    class="card card-hover edge-light group relative flex flex-col overflow-hidden"
    :class="{ 'opacity-60': unavailable }"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- 预览区 -->
    <div class="relative">
      <PostShowcase
        :scene="model.scene"
        :seed="model.seed"
        :playing="hover && !unavailable"
        ratio="16 / 9"
      />

      <!-- 左上：厂商 + 推荐标 -->
      <div class="absolute left-3 top-3 flex items-center gap-2">
        <VendorMark :slug="model.vendor.slug" :size="26" />
        <span
          class="rounded-md bg-black/45 px-2 py-[3px] text-[11px] font-medium text-ink backdrop-blur-md"
        >
          {{ model.vendor.name }}
        </span>
      </div>

      <div v-if="model.recommended && !unavailable" class="absolute right-3 top-3">
        <span class="chip chip-brand !bg-black/45 backdrop-blur-md">推荐</span>
      </div>

      <div v-if="unavailable" class="absolute right-3 top-3">
        <span class="chip !bg-black/55 backdrop-blur-md">维护中</span>
      </div>

      <!-- 右下：时长角标 -->
      <div
        class="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-[3px] font-mono text-[11px] text-ink backdrop-blur-md"
      >
        最长 {{ maxDuration }}s
      </div>

      <!-- hover 浮出的行动按钮 -->
      <div
        class="absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 transition-all duration-300"
        :class="hover && !unavailable ? 'opacity-100' : 'opacity-0'"
      >
        <button
          class="btn-primary !h-9 !text-[13px]"
          :disabled="unavailable"
          @click.stop="create"
        >
          <VIcon name="sparkles" :size="14" />
          立即创作
        </button>
      </div>
    </div>

    <!-- 信息区 -->
    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="truncate text-[15px] font-semibold text-ink">{{ model.name }}</h3>
          <p class="mt-0.5 truncate text-[12.5px] text-ink-3">{{ model.tagline }}</p>
        </div>
        <div class="shrink-0 text-right">
          <div class="font-mono text-[17px] font-semibold leading-tight text-ink">
            {{ model.pricing.from_credits }}
          </div>
          <div class="text-[10.5px] text-ink-4">积分 / 秒起</div>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <span v-for="t in model.tags.slice(0, 3)" :key="t" class="chip">{{ t }}</span>
      </div>

      <div class="mt-auto flex items-center gap-3 pt-4 text-[11px] text-ink-4">
        <span v-for="t in model.types" :key="t" class="flex items-center gap-1">
          <VIcon :name="t === 'i2v' ? 'image' : t === 'v2v' ? 'film' : 'sparkles'" :size="12" />
          {{ TYPE_LABEL[t] }}
        </span>
        <span v-if="model.spec.supports_audio" class="ml-auto flex items-center gap-1 text-ink-3">
          <VIcon name="video" :size="12" />
          音频
        </span>
      </div>
    </div>
  </article>
</template>
