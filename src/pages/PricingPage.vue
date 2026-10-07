<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { CREDIT_EXAMPLES, HOME_FAQ, PLANS } from '@/mock/data'
import { MODELS } from '@/mock/models'
import AuroraBackdrop from '@/components/layout/AuroraBackdrop.vue'
import VendorMark from '@/components/business/VendorMark.vue'
import VIcon from '@/components/base/VIcon.vue'
import { creditsToYuan } from '@/utils/format'

const billingCycle = ref<'month' | 'year'>('month')
const priceKeyword = ref('')
const priceSort = ref<'asc' | 'desc'>('asc')

const priceRows = computed(() => {
  const kw = priceKeyword.value.trim().toLowerCase()
  let rows = MODELS.filter((m) => m.status === 'available')
  if (kw) {
    rows = rows.filter((m) => `${m.name} ${m.vendor.name} ${m.tags.join(' ')}`.toLowerCase().includes(kw))
  }
  rows = [...rows].sort((a, b) =>
    priceSort.value === 'asc'
      ? a.pricing.from_credits - b.pricing.from_credits
      : b.pricing.from_credits - a.pricing.from_credits,
  )
  return rows
})

/** 年付按 10 个月计价（相当于省两个月） */
const yearly = (yuan: number) => Math.round(yuan * 10)

const PRICING_FAQ = [HOME_FAQ[1]!, HOME_FAQ[2]!, HOME_FAQ[4]!, HOME_FAQ[0]!]
const openFaq = ref<number | null>(0)
</script>

<template>
  <div class="relative">
    <AuroraBackdrop variant="page" />

    <div class="shell relative z-10 py-14">
      <header class="mx-auto max-w-2xl text-center">
        <span class="chip chip-brand">1 元 = 100 积分</span>
        <h1 class="mt-5 text-[32px] font-semibold sm:text-[42px]">按秒计费，用多少算多少</h1>
        <p class="mt-4 text-[14.5px] leading-relaxed text-ink-2">
          所有模型统一用积分结算，方便横向比价。生成失败或超时全额退回，积分有效期 365 天。
        </p>
      </header>

      <!-- 计费周期 -->
      <div class="mt-9 flex items-center justify-center">
        <div class="flex items-center gap-1 rounded-lg border border-line bg-inset p-1">
          <button class="seg-item !px-5" :data-active="billingCycle === 'month'" @click="billingCycle = 'month'">
            按月
          </button>
          <button class="seg-item !px-5" :data-active="billingCycle === 'year'" @click="billingCycle = 'year'">
            按年
            <span class="ml-1.5 chip chip-success !py-0 !text-[10px]">省 2 个月</span>
          </button>
        </div>
      </div>

      <!-- 套餐 -->
      <div class="mt-8 grid gap-4 lg:grid-cols-4">
        <article
          v-for="p in PLANS"
          :key="p.id"
          class="card card-hover edge-light relative flex flex-col p-6"
          :class="p.recommended ? '!border-brand-500/50 shadow-[0_0_48px_-16px_rgba(124,92,255,0.5)]' : ''"
        >
          <div v-if="p.badge" class="absolute right-5 top-5">
            <span class="chip" :class="p.recommended ? 'chip-brand' : 'chip-accent'">{{ p.badge }}</span>
          </div>

          <h2 class="text-[15px] font-semibold text-ink">{{ p.name }}</h2>
          <p class="mt-1 text-[12.5px] text-ink-3">{{ p.tagline }}</p>

          <div class="mt-6 flex items-baseline gap-1.5">
            <template v-if="p.price_yuan">
              <span class="text-[15px] text-ink-3">¥</span>
              <span class="font-mono text-[36px] font-semibold leading-none text-ink">
                {{ billingCycle === 'year' ? yearly(p.price_yuan) : p.price_yuan }}
              </span>
              <span class="text-[12.5px] text-ink-4">/ {{ billingCycle === 'year' ? '年' : '月' }}</span>
            </template>
            <span v-else class="font-mono text-[30px] font-semibold leading-none text-ink">面议</span>
          </div>

          <p v-if="p.credits" class="mt-2.5 font-mono text-[12px] text-ink-4">
            {{ (p.credits + p.bonus_credits).toLocaleString('zh-CN') }} 积分
            <span v-if="p.bonus_credits" class="text-success">
              （含赠送 {{ p.bonus_credits.toLocaleString('zh-CN') }}）
            </span>
          </p>

          <ul class="mt-6 flex-1 space-y-2.5">
            <li
              v-for="h in p.highlights"
              :key="h"
              class="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-2"
            >
              <VIcon name="check" :size="13" class="mt-[3px] shrink-0 text-success" />
              {{ h }}
            </li>
          </ul>

          <button
            class="mt-7"
            :class="p.recommended ? 'btn-primary w-full' : 'btn-ghost w-full'"
          >
            {{ p.id === 'p_enterprise' ? '联系商务' : p.id === 'p_free' ? '免费注册' : '立即充值' }}
          </button>
        </article>
      </div>

      <!-- 积分对照 -->
      <section class="mt-16">
        <h2 class="text-[20px] font-semibold">这些积分到底能做什么</h2>
        <p class="mt-2 text-[13.5px] text-ink-3">
          把数字翻译成大白话。所有换算都基于各模型的每秒基准价，实际按参数浮动。
        </p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="c in CREDIT_EXAMPLES"
            :key="c.credits"
            class="card p-5"
          >
            <p class="font-mono text-[20px] font-semibold text-brand-300">
              {{ c.credits.toLocaleString('zh-CN') }}
            </p>
            <p class="mt-1 text-[11.5px] text-ink-4">积分 ≈ {{ creditsToYuan(c.credits) }}</p>
            <p class="mt-4 text-[13.5px] leading-snug text-ink">{{ c.text }}</p>
            <p class="mt-1.5 text-[11.5px] text-ink-4">{{ c.detail }}</p>
          </div>
        </div>
      </section>

      <!-- 模型单价表 -->
      <section class="mt-16">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-[20px] font-semibold">各模型单价</h2>
            <p class="mt-2 text-[13.5px] text-ink-3">
              表里是「每秒基准价」，分辨率、画幅、音频会在此基础上浮动。
            </p>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="priceKeyword" class="field !w-48 !py-2 !text-[13px]" placeholder="搜索模型或厂商" />
            <button
              class="seg-item !py-2"
              @click="priceSort = priceSort === 'asc' ? 'desc' : 'asc'"
            >
              <VIcon name="filter" :size="13" class="mr-1 inline" />
              {{ priceSort === 'asc' ? '价格升序' : '价格降序' }}
            </button>
          </div>
        </div>

        <div class="mt-5 overflow-hidden rounded-xl border border-line-subtle">
          <table class="w-full text-left">
            <thead class="bg-elevated/70 text-[11.5px] uppercase tracking-wider text-ink-4">
              <tr>
                <th class="px-4 py-3 font-medium">模型</th>
                <th class="hidden px-4 py-3 font-medium sm:table-cell">厂商</th>
                <th class="px-4 py-3 font-medium">能力</th>
                <th class="hidden px-4 py-3 font-medium md:table-cell">最长</th>
                <th class="px-4 py-3 text-right font-medium">单价</th>
                <th class="px-4 py-3 text-right font-medium">10s 1080p 约</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line-subtle">
              <tr
                v-for="m in priceRows"
                :key="m.slug"
                class="transition-colors hover:bg-hover/60"
              >
                <td class="px-4 py-3">
                  <RouterLink :to="`/models/${m.slug}`" class="flex items-center gap-2.5">
                    <VendorMark :slug="m.vendor.slug" :size="24" />
                    <span class="text-[13.5px] font-medium text-ink hover:text-brand-300">{{ m.name }}</span>
                  </RouterLink>
                </td>
                <td class="hidden px-4 py-3 text-[12.5px] text-ink-3 sm:table-cell">{{ m.vendor.name }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="t in m.tags.slice(0, 2)" :key="t" class="chip !py-0 !text-[10.5px]">{{ t }}</span>
                  </div>
                </td>
                <td class="hidden px-4 py-3 font-mono text-[12.5px] text-ink-3 md:table-cell">
                  {{ Math.max(...m.spec.durations) }}s
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="font-mono text-[14px] font-medium text-ink">{{ m.pricing.from_credits }}</span>
                  <span class="ml-1 text-[11px] text-ink-4">积分/秒</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="font-mono text-[12.5px] text-ink-2">
                    {{ m.rules !== undefined ? Math.round(10 * m.pricing.from_credits * 1.5) : '—' }}
                  </span>
                  <span class="ml-1 text-[11px] text-ink-4">积分</span>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-if="!priceRows.length" class="px-4 py-10 text-center text-[13px] text-ink-4">
            没有匹配的模型
          </p>
        </div>

        <p class="mt-3 text-[11.5px] text-ink-4">
          表中数据为演示用占位值，上线前必须按实际签约渠道与官方定价逐条核对。
        </p>
      </section>

      <!-- FAQ -->
      <section class="mt-16">
        <h2 class="text-[20px] font-semibold">计费常见问题</h2>
        <div class="mt-6 divide-y divide-line-subtle border-y border-line-subtle">
          <div v-for="(f, i) in PRICING_FAQ" :key="f.q">
            <button class="flex w-full items-start gap-4 py-5 text-left" @click="openFaq = openFaq === i ? null : i">
              <span class="flex-1 text-[14.5px] font-medium" :class="openFaq === i ? 'text-ink' : 'text-ink-2'">
                {{ f.q }}
              </span>
              <span
                class="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md border border-line text-ink-3 transition-all duration-300"
                :class="openFaq === i ? 'rotate-180 border-brand-500/50 text-brand-300' : ''"
              >
                <VIcon name="chevronDown" :size="14" />
              </span>
            </button>
            <div class="grid transition-all duration-300 ease-out" :style="{ gridTemplateRows: openFaq === i ? '1fr' : '0fr' }">
              <div class="overflow-hidden">
                <p class="max-w-2xl pb-5 pr-10 text-[13.5px] leading-[1.75] text-ink-3">{{ f.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
