import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/**
 * 路由表对齐 docs/02-前端设计文档.md §2。
 * 全部页面用动态 import 做代码分割；首页的视频墙是重组件，单独异步加载。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: 'AI 视频生成工作站' },
  },
  {
    path: '/models',
    name: 'Models',
    component: () => import('@/pages/ModelsPage.vue'),
    meta: { title: '模型广场' },
  },
  {
    path: '/models/:slug',
    name: 'ModelDetail',
    component: () => import('@/pages/ModelDetailPage.vue'),
    props: true,
    meta: { title: '模型详情' },
  },
  {
    path: '/studio',
    name: 'Studio',
    component: () => import('@/pages/StudioPage.vue'),
    meta: { title: '生成工作台' },
  },
  {
    path: '/assets',
    name: 'Assets',
    component: () => import('@/pages/AssetsPage.vue'),
    meta: { title: '资产库' },
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('@/pages/PricingPage.vue'),
    meta: { title: '定价套餐' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? ''
  document.title = title ? `${title} · VidHub` : 'VidHub · AI 视频生成工作站'
})

export default router
