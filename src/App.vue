<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { useWalletStore } from './stores/wallet'
import { useAssetStore } from './stores/assets'
import { useAuthStore } from './stores/auth'

const route = useRoute()
/** 工作台是全屏应用型页面，不展示页脚 */
const showFooter = computed(() => route.name !== 'Studio' && route.name !== 'NotFound')

onMounted(() => {
  // 应用启动时并行拉一次用户 / 钱包 / 资产，各处页面直接读 store
  void useAuthStore().bootstrap()
  void useWalletStore().refresh()
  void useAssetStore().fetch()
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />

    <main class="flex-1 pt-16">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="r.path" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter v-if="showFooter" />
  </div>
</template>

<style scoped>
.page-enter-active {
  transition:
    opacity 0.3s var(--ease-swift),
    transform 0.36s var(--ease-out-expo);
}
.page-leave-active {
  transition:
    opacity 0.16s var(--ease-swift),
    transform 0.16s var(--ease-swift);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
