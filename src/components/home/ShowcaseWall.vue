<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { SHOWCASE } from '@/mock/data'
import PostShowcase from '../business/PostShowcase.vue'
import VIcon from '../base/VIcon.vue'

/**
 * 示例视频墙。
 * 真实项目：每张卡是 `<video preload="none" poster>`，进入视口才加载（IntersectionObserver），
 * hover 才 play()（前端文档 §7.1）。这里用程序化预览代替，但懒加载与 hover 播放的
 * 交互逻辑保持同构，接真实视频时只需替换内部实现。
 */
const visible = ref(false)
const root = ref<HTMLElement | null>(null)
const hovered = ref<string | null>(null)

onMounted(() => {
  if (!root.value) return
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        visible.value = true
        io.disconnect()
      }
    },
    { rootMargin: '200px' },
  )
  io.observe(root.value)
})

const ratioOf = (span: string) => (span === 'tall' ? '3 / 4' : span === 'short' ? '16 / 10' : '4 / 3')
</script>

<template>
  <section ref="root" class="shell py-20">
    <header class="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-[12px] font-medium uppercase tracking-[0.16em] text-brand-400">示例作品</p>
        <h2 class="mt-3 text-[28px] font-semibold sm:text-[34px]">这些都是一句话生成的</h2>
        <p class="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-2">
          每张卡片下面标着它用的模型。把鼠标放上去看动态效果——真实站点里这里是自动播放的静音视频。
        </p>
      </div>
      <span class="chip">演示数据 · 非真实生成结果</span>
    </header>

    <div class="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      <figure
        v-for="(item, i) in SHOWCASE"
        :key="item.id"
        class="group relative break-inside-avoid overflow-hidden rounded-lg border border-line-subtle transition-all duration-300 hover:border-line-strong hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
        :style="{
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(24px)',
          transition: `opacity .7s var(--ease-out-expo) ${i * 60}ms, transform .7s var(--ease-out-expo) ${i * 60}ms, border-color .3s, box-shadow .3s`,
        }"
        @mouseenter="hovered = item.id"
        @mouseleave="hovered = null"
      >
        <PostShowcase
          :scene="item.scene"
          :seed="item.seed"
          :ratio="ratioOf(item.span)"
          :playing="hovered === item.id"
        />

        <!-- 顶部：模型 -->
        <div class="absolute left-3 top-3 flex items-center gap-1.5">
          <span class="chip !bg-black/50 backdrop-blur-md">{{ item.modelName }}</span>
        </div>

        <!-- 右上：时长 -->
        <div
          class="absolute right-3 top-3 rounded bg-black/55 px-1.5 py-[2px] font-mono text-[10.5px] text-ink backdrop-blur-md"
        >
          {{ item.duration }}s
        </div>

        <!-- 播放指示 -->
        <div
          class="absolute inset-0 grid place-items-center transition-opacity duration-300"
          :class="hovered === item.id ? 'opacity-0' : 'opacity-100'"
        >
          <span
            class="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/35 text-white/80 backdrop-blur-md"
          >
            <VIcon name="play" :size="15" filled />
          </span>
        </div>

        <!-- 底部：提示词 -->
        <figcaption
          class="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3.5 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <p class="flex items-start gap-2 text-[12px] leading-relaxed text-white/90">
            <VIcon name="wand" :size="13" class="mt-[3px] shrink-0 text-brand-300" />
            {{ item.prompt }}
          </p>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
