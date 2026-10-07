<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { PLANS } from '@/mock/data'
import VIcon from '../base/VIcon.vue'

const preview = PLANS.filter((p) => p.id !== 'p_free').slice(0, 3)
</script>

<template>
  <section class="shell py-20">
    <header class="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-[12px] font-medium uppercase tracking-[0.16em] text-accent-400">价格透明</p>
        <h2 class="mt-3 text-[28px] font-semibold sm:text-[34px]">按秒计费，用多少算多少</h2>
        <p class="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-2">
          1 元 = 100 积分。所有模型统一用积分结算，方便横向比价。生成失败或超时全额退回。
        </p>
      </div>
      <RouterLink to="/pricing" class="btn-ghost !h-9 !text-[13px]">
        查看完整定价
        <VIcon name="arrowRight" :size="14" />
      </RouterLink>
    </header>

    <div class="grid gap-4 md:grid-cols-3">
      <article
        v-for="p in preview"
        :key="p.id"
        class="card card-hover edge-light relative flex flex-col p-6"
        :class="p.recommended ? '!border-brand-500/45' : ''"
      >
        <div v-if="p.badge" class="absolute right-5 top-5">
          <span class="chip" :class="p.recommended ? 'chip-brand' : 'chip-accent'">{{ p.badge }}</span>
        </div>

        <h3 class="text-[15px] font-semibold text-ink">{{ p.name }}</h3>
        <p class="mt-1 text-[12.5px] text-ink-3">{{ p.tagline }}</p>

        <div class="mt-6 flex items-baseline gap-1.5">
          <span class="font-mono text-[34px] font-semibold leading-none text-ink">
            {{ p.price_yuan || '面议' }}
          </span>
          <span v-if="p.price_yuan" class="text-[13px] text-ink-3">元</span>
        </div>

        <p v-if="p.credits" class="mt-2 font-mono text-[12px] text-ink-4">
          {{ (p.credits + p.bonus_credits).toLocaleString('zh-CN') }} 积分
        </p>

        <ul class="mt-6 flex-1 space-y-2.5">
          <li
            v-for="h in p.highlights.slice(0, 4)"
            :key="h"
            class="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-2"
          >
            <VIcon name="check" :size="13" class="mt-[3px] shrink-0 text-success" />
            {{ h }}
          </li>
        </ul>

        <RouterLink
          to="/pricing"
          class="mt-7"
          :class="p.recommended ? 'btn-primary w-full' : 'btn-ghost w-full'"
        >
          {{ p.recommended ? '立即充值' : '了解详情' }}
        </RouterLink>
      </article>
    </div>

    <p class="mt-6 text-center text-[12px] text-ink-4">
      全部模型单价可在
      <RouterLink to="/models" class="text-brand-300 underline decoration-brand-500/40 underline-offset-4">
        模型广场
      </RouterLink>
      横向对比
    </p>
  </section>
</template>
