import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CurrentUser } from '@/api/types'
import { userApi } from '@/api'

/**
 * 登录态。
 * 演示版恒为已登录（这样工作台/资产库能直接看到内容），但 initialised 的
 * 异步流程保留着，接后端时把 userApi.me() 换成真实请求即可。
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<CurrentUser | null>(null)
  const initialised = ref(false)

  async function bootstrap() {
    if (initialised.value) return
    user.value = await userApi.me()
    initialised.value = true
  }

  return { user, initialised, bootstrap }
})
