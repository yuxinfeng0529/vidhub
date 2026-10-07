<script setup lang="ts">
import { FEATURES } from '@/mock/data'
import VIcon from '../base/VIcon.vue'
</script>

<template>
  <section class="shell py-20">
    <header class="mb-10 max-w-2xl">
      <p class="text-[12px] font-medium uppercase tracking-[0.16em] text-accent-400">为什么是聚合</p>
      <h2 class="mt-3 text-[28px] font-semibold sm:text-[34px]">一家平台解决六件事</h2>
      <p class="mt-3 text-[14px] leading-relaxed text-ink-2">
        我们不训练模型。我们做的是把各家能力收敛成一套稳定的接口、一套账、一份资产，让你少注册六个账号。
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="f in FEATURES"
        :key="f.title"
        class="card card-hover edge-light group relative overflow-hidden p-5"
      >
        <!-- 图标 -->
        <div
          class="grid h-10 w-10 place-items-center rounded-lg border transition-transform duration-300 group-hover:scale-110"
          :style="{
            color: f.accent,
            borderColor: `color-mix(in srgb, ${f.accent} 30%, transparent)`,
            background: `color-mix(in srgb, ${f.accent} 12%, transparent)`,
          }"
        >
          <VIcon :name="f.icon" :size="18" />
        </div>

        <h3 class="mt-5 text-[15px] font-semibold text-ink">{{ f.title }}</h3>
        <p class="mt-2 text-[13px] leading-relaxed text-ink-2">{{ f.desc }}</p>

        <!-- 角落光晕 -->
        <div
          class="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          :style="{ background: `radial-gradient(circle, ${f.accent}55, transparent 70%)` }"
        />
      </article>
    </div>
  </section>
</template>
