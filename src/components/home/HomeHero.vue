<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AuroraBackdrop from '../layout/AuroraBackdrop.vue'
import PostShowcase from '../business/PostShowcase.vue'
import VProgress from '../base/VProgress.vue'
import VIcon from '../base/VIcon.vue'
import { STATS } from '@/mock/data'

const ROTATING = ['可灵 3.0', '即梦 3.0', 'Sora 2', 'Veo 3.1', '海螺 02', 'Vidu Q2']
const idx = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    idx.value = (idx.value + 1) % ROTATING.length
  }, 2400)
})
onUnmounted(() => clearInterval(timer))

/** Hero 右侧那张「正在生成」的模拟卡片 */
const progress = ref(34)
let tick: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  tick = setInterval(() => {
    progress.value = progress.value >= 100 ? 12 : progress.value + 1
  }, 900)
})
onUnmounted(() => clearInterval(tick))
</script>

<template>
  <section class="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
    <AuroraBackdrop variant="hero" />

    <div class="shell relative z-10">
      <div class="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <!-- ── 左：文案 ── -->
        <div class="reveal-in">
          <div class="chip chip-brand !py-1 !text-[12px]">
            <span class="h-1.5 w-1.5 rounded-full bg-brand-400" />
            13 家上游渠道 · 一套积分 · 一个 API
          </div>

          <h1 class="mt-6 text-[38px] font-semibold leading-[1.12] tracking-tight sm:text-[52px]">
            让每一家 AI 视频模型
            <br />
            都在<span class="text-gradient">同一个工作台</span>里
          </h1>

          <p class="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-2">
            可灵、即梦、Sora、Veo、海螺、Vidu…… 不用在六个后台之间来回搬提示词。
            选模型、写提示词、出片、归档，全部在一页完成。开发者走同一套 API，共享同一份余额。
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <RouterLink to="/studio" class="btn-primary !h-11 !px-6 !text-[14.5px]">
              <VIcon name="sparkles" :size="16" />
              免费开始创作
            </RouterLink>
            <RouterLink to="/models" class="btn-ghost !h-11 !px-6 !text-[14.5px]">
              浏览模型广场
              <VIcon name="arrowRight" :size="15" />
            </RouterLink>
          </div>

          <p class="mt-4 flex items-center gap-1.5 text-[12.5px] text-ink-4">
            <VIcon name="shield" :size="13" />
            注册即送 200 积分 · 生成失败全额退款 · 不需要信用卡
          </p>

          <!-- 数据条 -->
          <dl class="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line-subtle pt-8 sm:grid-cols-4">
            <div v-for="s in STATS" :key="s.label">
              <dt class="flex items-baseline gap-0.5">
                <span class="font-mono text-[26px] font-semibold leading-none text-ink">
                  {{ s.value }}
                </span>
                <span class="text-[13px] text-ink-3">{{ s.suffix }}</span>
              </dt>
              <dd class="mt-2 text-[12px] leading-snug text-ink-4">{{ s.label }}</dd>
            </div>
          </dl>
        </div>

        <!-- ── 右：工作台缩略 ── -->
        <div class="relative anim-float">
          <!-- 背后光晕 -->
          <div
            class="pointer-events-none absolute -inset-8 rounded-[40px] opacity-70 blur-3xl"
            style="background: radial-gradient(circle at 60% 40%, rgba(124, 92, 255, 0.35), transparent 65%)"
          />

          <div class="glass relative overflow-hidden rounded-xl shadow-[0_32px_80px_-28px_rgba(0,0,0,0.95)]">
            <!-- 窗口条 -->
            <div class="flex items-center gap-2 border-b border-line-subtle px-4 py-2.5">
              <span class="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              <span class="ml-3 flex items-center gap-1.5 text-[11.5px] text-ink-4">
                <VIcon name="film" :size="12" />
                生成工作台
              </span>
              <span class="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-ink-4">
                <span class="h-1.5 w-1.5 rounded-full bg-success" />
                已连接
              </span>
            </div>

            <div class="p-4">
              <!-- 预览 -->
              <div class="relative overflow-hidden rounded-lg ring-1 ring-line">
                <PostShowcase scene="ocean" :seed="53" ratio="16 / 9" :playing="true" />
                <div class="absolute left-3 top-3 chip !bg-black/50 backdrop-blur-md">
                  Sora 2 · 10s · 1080p
                </div>
                <div class="absolute bottom-3 left-3 right-3">
                  <div class="mb-2 flex items-center justify-between text-[11px]">
                    <span class="flex items-center gap-1.5 text-white/90">
                      <span class="h-1.5 w-1.5 rounded-full bg-accent-400 anim-pulse-ring" />
                      生成中 · {{ progress }}%
                    </span>
                    <span class="font-mono text-white/70">预计还需 38 秒</span>
                  </div>
                  <VProgress :value="progress" tone="accent" :height="4" animated />
                </div>
              </div>

              <!-- 提示词 -->
              <div class="mt-3 rounded-lg border border-line-subtle bg-inset p-3">
                <p class="text-[12.5px] leading-relaxed text-ink-2">
                  海浪拍打礁石，水花在逆光中飞散，高速摄影，慢动作，电影质感
                </p>
              </div>

              <!-- 参数 + 计价 -->
              <div class="mt-3 flex items-center gap-2">
                <span class="chip">10s</span>
                <span class="chip">1080p</span>
                <span class="chip">16:9</span>
                <span class="chip chip-accent">音频</span>
                <span class="ml-auto font-mono text-[13px] font-medium text-ink">437</span>
                <span class="text-[11px] text-ink-4">积分</span>
              </div>

              <button class="btn-primary mt-3 w-full !h-10" tabindex="-1">立即生成</button>
            </div>
          </div>

          <!-- 浮动小卡：任务完成通知 -->
          <div
            class="glass absolute -bottom-6 -left-4 hidden items-center gap-2.5 rounded-lg px-3.5 py-2.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.9)] sm:flex"
            style="animation: float-y 7s ease-in-out infinite 1.2s"
          >
            <span class="grid h-7 w-7 place-items-center rounded-full bg-success/15 text-success">
              <VIcon name="check" :size="14" :stroke="2.4" />
            </span>
            <div class="leading-tight">
              <p class="text-[12px] font-medium text-ink">可灵 3.0 已完成</p>
              <p class="mt-0.5 font-mono text-[10.5px] text-ink-4">已存入资产库 · 243 积分</p>
            </div>
          </div>

          <!-- 浮动小卡：当前轮换的模型 -->
          <div
            class="glass absolute -right-3 -top-5 hidden rounded-lg px-3.5 py-2.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.9)] md:block"
          >
            <p class="text-[10.5px] tracking-wide text-ink-4">正在调用</p>
            <Transition name="swap" mode="out-in">
              <p :key="idx" class="mt-0.5 font-mono text-[13px] font-medium text-brand-300">
                {{ ROTATING[idx] }}
              </p>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.24s,
    transform 0.28s var(--ease-out-expo);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
