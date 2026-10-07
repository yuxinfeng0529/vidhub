<script setup lang="ts">
withDefaults(
  defineProps<{
    value: number
    /** 生成中的任务用流动条纹表达「还在动」 */
    animated?: boolean
    height?: number
    tone?: 'brand' | 'accent' | 'success' | 'warning' | 'danger'
  }>(),
  { animated: false, height: 6, tone: 'brand' },
)
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-full bg-inset ring-1 ring-line-subtle"
    :style="{ height: `${height}px` }"
    role="progressbar"
    :aria-valuenow="Math.round(value)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="h-full rounded-full transition-[width] duration-500 ease-out"
      :class="[`tone-${tone}`, { 'is-animated': animated }]"
      :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"
    />
  </div>
</template>

<style scoped>
.tone-brand {
  background: linear-gradient(90deg, #7c5cff, #9b82ff);
  box-shadow: 0 0 12px rgba(124, 92, 255, 0.5);
}
.tone-accent {
  background: linear-gradient(90deg, #22d3ee, #67e8f9);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
}
.tone-success {
  background: linear-gradient(90deg, #16a34a, #22c55e);
}
.tone-warning {
  background: linear-gradient(90deg, #d97706, #f59e0b);
}
.tone-danger {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

/* 流动条纹 */
.is-animated {
  position: relative;
  overflow: hidden;
}
.is-animated::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    115deg,
    rgba(255, 255, 255, 0.28) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.28) 50%,
    rgba(255, 255, 255, 0.28) 75%,
    transparent 75%
  );
  background-size: 22px 22px;
  animation: stripe-move 0.9s linear infinite;
}

@keyframes stripe-move {
  to {
    background-position: 22px 0;
  }
}
</style>
