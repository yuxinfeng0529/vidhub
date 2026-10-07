<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { FOOTER_COLUMNS } from '@/constants'
import VIcon from '../base/VIcon.vue'
</script>

<template>
  <footer class="relative mt-24 border-t border-line-subtle">
    <div class="shell py-14">
      <div class="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <VIcon name="play" :size="11" filled />
            </span>
            <span class="text-[14px] font-semibold text-ink">VidHub</span>
          </div>
          <p class="mt-3.5 max-w-xs text-[12.5px] leading-relaxed text-ink-3">
            把可灵、即梦、Sora、Veo、海螺等多家上游统一成一套积分、一套任务系统、一个 API。
            创作者用界面出片，开发者用接口接入。
          </p>
          <div class="mt-5 flex items-center gap-2">
            <span class="chip chip-success">
              <span class="h-1.5 w-1.5 rounded-full bg-success" />
              全部渠道正常
            </span>
            <span class="chip">v0.1.0 · 演示版</span>
          </div>
        </div>

        <div v-for="col in FOOTER_COLUMNS" :key="col.title">
          <h4 class="text-[12px] font-medium uppercase tracking-wider text-ink-4">
            {{ col.title }}
          </h4>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in col.links" :key="link.name">
              <RouterLink
                :to="link.to"
                class="text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                {{ link.name }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-12 flex flex-col gap-3 border-t border-line-subtle pt-6 text-[12px] text-ink-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© 2026 VidHub · 本项目为设计阶段的演示原型，全部数据为占位示例</p>
        <p class="flex items-center gap-4">
          <span>京ICP备 00000000 号</span>
          <span class="hidden sm:inline">示例备案号，上线前需替换</span>
        </p>
      </div>
    </div>
  </footer>
</template>
