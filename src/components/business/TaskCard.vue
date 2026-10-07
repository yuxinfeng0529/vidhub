<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/api/types'
import StatusPill from './StatusPill.vue'
import VIcon from '../base/VIcon.vue'
import VProgress from '../base/VProgress.vue'
import { formatCredits, timeAgo, truncate } from '@/utils/format'
import { isLiveStatus } from '@/constants'

const props = withDefaults(
  defineProps<{ task: Task; dense?: boolean }>(),
  { dense: false },
)
const emit = defineEmits<{ cancel: [id: string]; retry: [id: string] }>()

const live = computed(() => isLiveStatus(props.task.status))
const canceledEarly = computed(
  () => props.task.status === 'canceled' || props.task.status === 'timeout',
)
const canCancel = computed(
  () => props.task.status === 'created' || props.task.status === 'queued',
)

const statusText = computed(() => {
  const t = props.task
  switch (t.status) {
    case 'created':
      return '正在创建…'
    case 'queued':
      return t.queue_ahead ? `排队中 · 前方还有 ${t.queue_ahead} 个任务` : '即将开始…'
    case 'running':
      return `生成中 · ${t.progress}%`
    case 'succeeded':
      return '已完成，已存入资产库'
    case 'failed':
      return t.error?.message ?? '生成失败'
    case 'canceled':
      return '已取消，积分已全额退回'
    case 'timeout':
      return t.error?.message ?? '上游超时，积分已全额退回'
  }
})

const progressTone = computed(() => {
  if (props.task.status === 'failed') return 'danger' as const
  if (props.task.status === 'timeout') return 'warning' as const
  if (props.task.status === 'succeeded') return 'success' as const
  if (props.task.status === 'queued' || props.task.status === 'created') return 'brand' as const
  return 'accent' as const
})

const progressValue = computed(() => {
  if (props.task.status === 'created') return 3
  if (props.task.status === 'queued') return 8
  return props.task.progress
})
</script>

<template>
  <div class="rounded-lg border border-line-subtle bg-surface p-3.5 transition-colors hover:border-line">
    <!-- 头部：模型 + 状态 -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <span class="truncate text-[13px] font-medium text-ink">{{ task.model.name }}</span>
        <span class="shrink-0 font-mono text-[10.5px] text-ink-4">{{ task.id }}</span>
      </div>
      <StatusPill :status="task.status" />
    </div>

    <!-- 提示词 -->
    <p v-if="!dense" class="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-3">
      {{ truncate(task.prompt, 90) }}
    </p>

    <!-- 进度条：只有 live 状态才显示 -->
    <div v-if="live" class="mt-3">
      <VProgress
        :value="progressValue"
        :tone="progressTone"
        :animated="task.status === 'running' || task.status === 'queued'"
        :height="4"
      />
      <div class="mt-2 flex items-center justify-between text-[11.5px]">
        <span class="flex items-center gap-1.5 text-ink-2">
          <span
            v-if="task.status === 'running'"
            class="inline-block h-1.5 w-1.5 rounded-full bg-accent-500 anim-pulse-ring"
          />
          {{ statusText }}
        </span>
        <button
          v-if="canCancel"
          class="text-ink-4 transition-colors hover:text-danger"
          @click="emit('cancel', task.id)"
        >
          取消
        </button>
      </div>
    </div>

    <!-- 终态：结果文案 -->
    <div v-else-if="task.status === 'succeeded'" class="mt-3 flex items-center gap-1.5 text-[11.5px] text-success">
      <VIcon name="check" :size="13" />
      {{ statusText }}
    </div>

    <div
      v-else
      class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11.5px]"
      :class="canceledEarly ? 'text-ink-3' : 'text-danger'"
    >
      <VIcon :name="task.status === 'failed' ? 'alert' : 'refresh'" :size="13" />
      <span class="flex-1">{{ statusText }}</span>
      <button
        class="chip transition-colors hover:border-brand-500/60 hover:text-brand-300"
        @click="emit('retry', task.id)"
      >
        重试（{{ formatCredits(task.billing.estimated_credits) }}）
      </button>
    </div>

    <!-- 计费脚注 -->
    <div class="mt-3 flex items-center gap-3 border-t border-line-subtle pt-2.5 text-[11px] text-ink-4">
      <span v-if="task.status === 'succeeded'">
        实际消耗 <span class="font-mono text-ink-2">{{ task.billing.actual_credits }}</span> 积分
      </span>
      <span v-else-if="task.billing.refunded_credits">
        已退回 <span class="font-mono text-success">{{ task.billing.refunded_credits }}</span> 积分
      </span>
      <span v-else>
        冻结 <span class="font-mono text-ink-2">{{ task.billing.frozen_credits }}</span> 积分
      </span>
      <span class="ml-auto">{{ timeAgo(task.created_at) }}</span>
    </div>
  </div>
</template>
