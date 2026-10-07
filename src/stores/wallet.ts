import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { walletApi } from '@/api'

/**
 * 钱包。
 *
 * 真实系统的两段式扣费由后端保证（提交冻结 → 成功结算 / 失败解冻），
 * 前端只负责把 balance / frozen 展示出来。这里为了让演示可感知，
 * 在本地模拟了冻结与解冻的数值变化。
 */
export const useWalletStore = defineStore('wallet', () => {
  const balance = ref(3400)
  const frozen = ref(680)
  const loading = ref(false)

  const available = computed(() => balance.value - frozen.value)

  async function refresh() {
    loading.value = true
    try {
      const w = await walletApi.get()
      balance.value = w.balance
      frozen.value = w.frozen
    } finally {
      loading.value = false
    }
  }

  /** 提交任务：冻结 */
  function freeze(credits: number) {
    frozen.value += credits
  }

  /** 任务成功：按实际用量结算 */
  function settle(frozenCredits: number, actualCredits: number) {
    frozen.value = Math.max(0, frozen.value - frozenCredits)
    balance.value = Math.max(0, balance.value - actualCredits)
  }

  /** 任务失败 / 取消：全额解冻 */
  function release(frozenCredits: number) {
    frozen.value = Math.max(0, frozen.value - frozenCredits)
  }

  /** 充值到账 */
  function topUp(credits: number) {
    balance.value += credits
  }

  return { balance, frozen, available, loading, refresh, freeze, settle, release, topUp }
})
