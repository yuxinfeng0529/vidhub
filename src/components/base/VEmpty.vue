<script setup lang="ts">
import VIcon from './VIcon.vue'

withDefaults(
  defineProps<{
    icon?: string
    title: string
    desc?: string
    actionText?: string
  }>(),
  { icon: 'search', desc: '', actionText: '' },
)
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-20 text-center">
    <div
      class="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-elevated text-ink-3"
    >
      <VIcon :name="icon" :size="22" />
    </div>
    <p class="text-[15px] font-medium text-ink">{{ title }}</p>
    <p v-if="desc" class="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-3">{{ desc }}</p>
    <button v-if="actionText" class="btn-ghost mt-5 !h-9 !text-[13px]" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>
