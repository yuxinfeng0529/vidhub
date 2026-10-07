<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HomeHero from '@/components/home/HomeHero.vue'
import ShowcaseWall from '@/components/home/ShowcaseWall.vue'
import FeatureGrid from '@/components/home/FeatureGrid.vue'
import VendorWall from '@/components/home/VendorWall.vue'
import StepsSection from '@/components/home/StepsSection.vue'
import PricingPreview from '@/components/home/PricingPreview.vue'
import FaqSection from '@/components/home/FaqSection.vue'
import VIcon from '@/components/base/VIcon.vue'
</script>

<template>
  <div>
    <HomeHero />
    <ShowcaseWall />

    <div class="relative">
      <!-- 中段用一条极细的分隔渐变带，替代生硬的 hr -->
      <div class="shell"><div class="h-px bg-gradient-to-r from-transparent via-line to-transparent" /></div>
      <FeatureGrid />
    </div>

    <VendorWall />
    <StepsSection />

    <div class="relative overflow-hidden">
      <div class="shell"><div class="h-px bg-gradient-to-r from-transparent via-line to-transparent" /></div>
      <PricingPreview />
    </div>

    <FaqSection />

    <!-- 收尾 CTA -->
    <section class="shell py-20">
      <div
        class="relative overflow-hidden rounded-2xl border border-brand-500/25 px-8 py-14 text-center sm:px-16"
      >
        <div
          class="pointer-events-none absolute inset-0"
          style="background: radial-gradient(120% 140% at 50% 0%, rgba(124, 92, 255, 0.22), transparent 62%)"
        />
        <div class="grid-bg pointer-events-none absolute inset-0 opacity-40" style="mask-image: radial-gradient(90% 90% at 50% 40%, #000, transparent 70%)" />

        <div class="relative">
          <h2 class="text-[30px] font-semibold sm:text-[38px]">
            先跑一条试试，<span class="text-gradient">不花钱</span>
          </h2>
          <p class="mx-auto mt-4 max-w-lg text-[14px] leading-relaxed text-ink-2">
            注册即送 200 积分，够跑两条 5 秒短片。不需要填信用卡，不合适随时走。
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <RouterLink to="/studio" class="btn-primary !h-11 !px-7 !text-[14.5px]">
              <VIcon name="sparkles" :size="16" />
              免费开始创作
            </RouterLink>
            <RouterLink to="/models" class="btn-ghost !h-11 !px-7 !text-[14.5px]">
              先看看模型
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
