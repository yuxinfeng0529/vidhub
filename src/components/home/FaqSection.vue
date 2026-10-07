<script setup lang="ts">
import { ref } from 'vue'
import { HOME_FAQ } from '@/mock/data'
import VIcon from '../base/VIcon.vue'

const open = ref<number | null>(0)
const toggle = (i: number) => (open.value = open.value === i ? null : i)
</script>

<template>
  <section class="shell py-20">
    <div class="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
      <header>
        <p class="text-[12px] font-medium uppercase tracking-[0.16em] text-brand-400">常见问题</p>
        <h2 class="mt-3 text-[28px] font-semibold sm:text-[34px]">你可能想问的</h2>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-2">
          没找到答案？在企业微信或邮件里问我们，工作时间内通常一小时内回复。
        </p>
      </header>

      <div class="divide-y divide-line-subtle border-y border-line-subtle">
        <div v-for="(f, i) in HOME_FAQ" :key="f.q">
          <button
            class="flex w-full items-start gap-4 py-5 text-left transition-colors"
            @click="toggle(i)"
          >
            <span
              class="flex-1 text-[14.5px] font-medium transition-colors"
              :class="open === i ? 'text-ink' : 'text-ink-2'"
            >
              {{ f.q }}
            </span>
            <span
              class="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md border border-line text-ink-3 transition-all duration-300"
              :class="open === i ? 'rotate-180 border-brand-500/50 text-brand-300' : ''"
            >
              <VIcon name="chevronDown" :size="14" />
            </span>
          </button>
          <div
            class="grid transition-all duration-300 ease-out"
            :style="{ gridTemplateRows: open === i ? '1fr' : '0fr' }"
          >
            <div class="overflow-hidden">
              <p class="max-w-2xl pb-5 pr-10 text-[13.5px] leading-[1.75] text-ink-3">
                {{ f.a }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
