<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { NAV_LINKS } from '@/constants'
import { useWalletStore } from '@/stores/wallet'
import { useAuthStore } from '@/stores/auth'
import { formatCredits } from '@/utils/format'
import VIcon from '../base/VIcon.vue'

const route = useRoute()
const wallet = useWalletStore()
const auth = useAuthStore()

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
const balanceText = computed(() => formatCredits(wallet.available, false))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 transition-all duration-300"
    :class="scrolled ? 'glass !border-x-0 !border-t-0 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.9)]' : 'border-b border-transparent'"
  >
    <div class="shell flex h-16 items-center gap-6">
      <!-- Logo -->
      <RouterLink to="/" class="group flex items-center gap-2.5" @click="menuOpen = false">
        <span class="logo">
          <VIcon name="play" :size="13" filled />
        </span>
        <span class="flex flex-col leading-none">
          <span class="text-[15px] font-semibold tracking-tight text-ink">VidHub</span>
          <span class="mt-0.5 text-[10px] tracking-wide text-ink-4">AI 视频工作站</span>
        </span>
      </RouterLink>

      <!-- 主导航 -->
      <nav class="hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          class="relative rounded-lg px-3 py-2 text-[13.5px] transition-colors"
          :class="isActive(link.to) ? 'text-ink' : 'text-ink-2 hover:text-ink'"
        >
          {{ link.name }}
          <span
            v-if="isActive(link.to)"
            class="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent"
          />
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-2.5">
        <!-- 余额 -->
        <RouterLink
          to="/pricing"
          class="hidden items-center gap-2 rounded-lg border border-line bg-elevated/70 px-3 py-1.5 transition-colors hover:border-line-strong sm:flex"
        >
          <VIcon name="wallet" :size="14" class="text-brand-400" />
          <span class="font-mono text-[13px] font-medium text-ink">{{ balanceText }}</span>
          <span class="text-[11px] text-ink-4">积分</span>
          <VIcon name="plus" :size="12" class="text-ink-4" />
        </RouterLink>

        <!-- 用户 -->
        <div class="hidden items-center gap-2 md:flex">
          <span
            class="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[12px] font-semibold text-white"
          >
            {{ auth.user?.avatar_text ?? '创' }}
          </span>
        </div>

        <!-- 移动端菜单 -->
        <button class="btn-icon md:hidden" aria-label="菜单" @click="menuOpen = !menuOpen">
          <VIcon :name="menuOpen ? 'x' : 'menu'" :size="18" />
        </button>
      </div>
    </div>

    <!-- 移动端展开 -->
    <Transition name="drop">
      <nav v-if="menuOpen" class="glass border-x-0 border-b-0 border-t-line-subtle px-6 py-3 md:hidden">
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          class="block rounded-lg px-3 py-2.5 text-[14px]"
          :class="isActive(link.to) ? 'bg-hover text-ink' : 'text-ink-2'"
          @click="menuOpen = false"
        >
          {{ link.name }}
        </RouterLink>
        <div class="mt-2 flex items-center justify-between border-t border-line-subtle px-3 pt-3">
          <span class="text-[12px] text-ink-3">余额</span>
          <span class="font-mono text-[13px] text-ink-2">{{ balanceText }} 积分</span>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.logo {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(135deg, #7c5cff, #22d3ee);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 4px 14px -4px rgba(124, 92, 255, 0.8);
  transition: box-shadow 0.3s;
}
.group:hover .logo {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 6px 22px -4px rgba(124, 92, 255, 1);
}
.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.2s,
    transform 0.24s var(--ease-out-expo);
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
