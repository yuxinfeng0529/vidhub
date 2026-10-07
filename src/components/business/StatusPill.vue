<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStatus } from '@/api/types'
import { TASK_STATUS } from '@/constants'

const props = defineProps<{ status: TaskStatus; compact?: boolean }>()

const meta = computed(() => TASK_STATUS[props.status])
</script>

<template>
  <span
    class="pill"
    :style="{
      color: meta.color,
      borderColor: `color-mix(in srgb, ${meta.color} 38%, transparent)`,
      background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
    }"
  >
    <span class="glyph" :class="{ spin: status === 'running' }">{{ meta.glyph }}</span>
    <span v-if="!compact">{{ meta.label }}</span>
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  white-space: nowrap;
}
.glyph {
  font-size: 10px;
  line-height: 1;
}
.spin {
  display: inline-block;
  animation: spin-slow 1.1s linear infinite;
}
@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}
</style>
