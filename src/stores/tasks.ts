import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Task } from '@/api/types'
import { taskApi, type CreateTaskPayload } from '@/api'
import { MOCK_TASKS } from '@/mock/tasks'
import { useWalletStore } from './wallet'
import { useAssetStore } from './assets'
import { isLiveStatus } from '@/constants'

/**
 * 任务状态机 + 实时进度。
 *
 * 真实系统里进度来自 SSE（`/tasks/stream`），降级为 3 秒轮询（前端文档 §5）。
 * 这里用一个本地定时器模拟同一条事件流，把状态机的每个跃迁都真实地走一遍：
 *
 *   created → queued(前方 N 个) → running(progress 0→100) → succeeded | failed
 *
 * 接后端时，把 `startSimulation()` 换成 `useTaskStream().connect([task.id])`，
 * 其余（队列渲染、钱包联动、资产归档）全部不用改。
 */
export const useTaskStore = defineStore('tasks', () => {
  const history = ref<Task[]>([...MOCK_TASKS])
  const queue = ref<Task[]>([])
  const submitting = ref(false)

  /** task.id → 定时器句柄，用于取消与卸载 */
  const timers = new Map<string, ReturnType<typeof setInterval>>()

  const activeCount = computed(
    () => queue.value.filter((t) => isLiveStatus(t.status)).length,
  )

  async function create(payload: CreateTaskPayload): Promise<Task> {
    submitting.value = true
    try {
      const task = await taskApi.create(payload)
      queue.value = [task, ...queue.value]
      history.value = [task, ...history.value]
      useWalletStore().freeze(task.billing.frozen_credits)
      startSimulation(task)
      return task
    } finally {
      submitting.value = false
    }
  }

  function patch(id: string, patchFn: (t: Task) => Task) {
    const apply = (list: Task[]) => list.map((t) => (t.id === id ? patchFn(t) : t))
    queue.value = apply(queue.value)
    history.value = apply(history.value)
  }

  function startSimulation(task: Task) {
    const target = 1 + Math.floor(Math.random() * 4)
    const willFail = Math.random() < 0.12
    const failAt = 35 + Math.floor(Math.random() * 35)
    let phase: 'created' | 'queued' | 'running' = 'created'
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += 400

      if (phase === 'created' && elapsed >= 800) {
        phase = 'queued'
        patch(task.id, (t) => ({
          ...t,
          status: 'queued',
          queue_ahead: target,
          submitted_at: new Date().toISOString(),
        }))
        return
      }

      if (phase === 'queued') {
        const remain = Math.max(0, target - Math.floor((elapsed - 800) / 2200))
        patch(task.id, (t) => ({ ...t, queue_ahead: remain }))
        if (remain === 0) {
          phase = 'running'
          patch(task.id, (t) => ({ ...t, status: 'running', queue_ahead: null }))
        }
        return
      }

      // running：进度按非线性推进（前期快、后期慢），更接近真实观感
      const current = queue.value.find((t) => t.id === task.id)?.progress ?? 0
      const step = current < 30 ? 7 : current < 75 ? 4 : 2
      const next = Math.min(100, current + step + Math.random() * 2)

      if (willFail && next >= failAt) {
        stop(task.id)
        patch(task.id, (t) => ({
          ...t,
          status: 'failed',
          progress: Math.round(next),
          finished_at: new Date().toISOString(),
          error: {
            code: 'PROVIDER_CONTENT_FLAGGED',
            message: '上游内容安全策略拒绝了本次生成，积分已全额退回。',
          },
          billing: {
            ...t.billing,
            frozen_credits: 0,
            refunded_credits: t.billing.estimated_credits,
          },
        }))
        useWalletStore().release(task.billing.frozen_credits)
        return
      }

      if (next >= 100) {
        stop(task.id)
        const finished = {
          ...queue.value.find((t) => t.id === task.id)!,
          status: 'succeeded' as const,
          progress: 100,
          finished_at: new Date().toISOString(),
        }
        const { duration, resolution, aspect_ratio } = finished.params
        const width = resolution === '4K' ? 3840 : resolution === '1080p' ? 1920 : 1280
        const heightBase = aspect_ratio === '9:16' ? Math.round(width * 1.7778) : Math.round(width * 0.5625)
        const asset = {
          id: `a_${task.id.slice(2)}`,
          type: 'video' as const,
          url: '',
          poster_url: '',
          duration,
          width,
          height: aspect_ratio === '1:1' ? width : heightBase,
          size_bytes: Math.round(duration * 1_500_000),
        }
        patch(task.id, (t) => ({
          ...t,
          status: 'succeeded',
          progress: 100,
          finished_at: new Date().toISOString(),
          assets: [asset],
          billing: { ...t.billing, frozen_credits: 0, actual_credits: t.billing.estimated_credits },
        }))
        useWalletStore().settle(task.billing.frozen_credits, task.billing.estimated_credits)
        useAssetStore().addFromTask({ ...finished, assets: [asset] })
        return
      }

      patch(task.id, (t) => ({ ...t, progress: Math.round(next) }))
    }, 400)

    timers.set(task.id, timer)
  }

  function stop(id: string) {
    const t = timers.get(id)
    if (t) {
      clearInterval(t)
      timers.delete(id)
    }
  }

  function cancel(id: string) {
    const task = queue.value.find((t) => t.id === id)
    if (!task || (task.status !== 'created' && task.status !== 'queued')) return
    stop(id)
    patch(id, (t) => ({
      ...t,
      status: 'canceled',
      finished_at: new Date().toISOString(),
      billing: {
        ...t.billing,
        frozen_credits: 0,
        refunded_credits: t.billing.estimated_credits,
      },
    }))
    useWalletStore().release(task.billing.frozen_credits)
  }

  async function retry(id: string) {
    const origin = history.value.find((t) => t.id === id)
    if (!origin) return
    await create({
      model: origin.model.slug,
      type: origin.type,
      prompt: origin.prompt,
      params: origin.params,
    })
  }

  function clearFinished() {
    queue.value = queue.value.filter((t) => isLiveStatus(t.status))
  }

  /** 组件卸载时清理定时器，避免泄漏 */
  function dispose() {
    timers.forEach((t) => clearInterval(t))
    timers.clear()
  }

  return {
    history,
    queue,
    submitting,
    activeCount,
    create,
    cancel,
    retry,
    clearFinished,
    dispose,
  }
})
