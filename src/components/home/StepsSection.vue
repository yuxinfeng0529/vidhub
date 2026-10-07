<script setup lang="ts">
import { STEPS } from '@/mock/data'
</script>

<template>
  <section class="shell py-20">
    <header class="mb-12 max-w-2xl">
      <p class="text-[12px] font-medium uppercase tracking-[0.16em] text-brand-400">工作方式</p>
      <h2 class="mt-3 text-[28px] font-semibold sm:text-[34px]">三步，从想法到成片</h2>
    </header>

    <ol class="relative grid gap-8 md:grid-cols-3">
      <!-- 连接线 -->
      <div
        class="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-brand-500/0 via-brand-500/45 to-brand-500/0 md:block"
      />

      <li v-for="s in STEPS" :key="s.n" class="relative">
        <span
          class="relative z-10 grid h-12 w-12 place-items-center rounded-xl border border-brand-500/35 bg-canvas font-mono text-[15px] font-semibold text-brand-300 shadow-[0_0_24px_-6px_rgba(124,92,255,0.7)]"
        >
          {{ s.n }}
        </span>
        <h3 class="mt-5 text-[16px] font-semibold text-ink">{{ s.title }}</h3>
        <p class="mt-2.5 max-w-xs text-[13px] leading-relaxed text-ink-2">{{ s.desc }}</p>
      </li>
    </ol>
  </section>
</template>
