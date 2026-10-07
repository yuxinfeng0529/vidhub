<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AuroraBackdrop from '@/components/layout/AuroraBackdrop.vue'
import VIcon from '@/components/base/VIcon.vue'
</script>

<template>
  <div class="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-6">
    <AuroraBackdrop variant="page" />

    <div class="relative z-10 text-center">
      <p class="font-mono text-[80px] font-semibold leading-none text-gradient sm:text-[110px]">404</p>
      <h1 class="mt-4 text-[22px] font-semibold">这个页面不存在</h1>
      <p class="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-3">
        链接可能已经失效，或者你输错了地址。要不先去工作台写一条提示词？
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <RouterLink to="/studio" class="btn-primary !h-10">
          <VIcon name="sparkles" :size="15" />
          去工作台
        </RouterLink>
        <RouterLink to="/" class="btn-ghost !h-10">回到首页</RouterLink>
      </div>
    </div>
  </div>
</template>
