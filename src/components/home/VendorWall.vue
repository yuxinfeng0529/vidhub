<script setup lang="ts">
import { VENDORS } from '@/mock/models'
</script>

<template>
  <section class="shell py-16">
    <div class="rounded-xl border border-line-subtle bg-surface/60 px-6 py-9 sm:px-10">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-[17px] font-semibold">已接入的上游渠道</h2>
          <p class="mt-1.5 text-[13px] text-ink-3">持续增加中。新增一家厂商 = 新增一个适配器，前端零改动。</p>
        </div>
        <RouterLink to="/models" class="btn-ghost !h-9 !text-[13px]">
          查看全部模型
          <span class="font-mono text-ink-4">{{ VENDORS.length }}</span>
        </RouterLink>
      </div>

      <ul class="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        <li
          v-for="v in VENDORS"
          :key="v.slug"
          class="flex items-center gap-2.5 opacity-70 transition-opacity duration-300 hover:opacity-100"
        >
          <span
            class="grid h-8 w-8 flex-none place-items-center rounded-lg text-[11px] font-bold text-white"
            :style="{ backgroundImage: `linear-gradient(135deg, ${v.from}, ${v.to})` }"
          >
            {{ v.mark }}
          </span>
          <span class="truncate text-[12.5px] text-ink-2">{{ v.name }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
