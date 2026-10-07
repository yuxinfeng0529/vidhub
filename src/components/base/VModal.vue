<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import VIcon from './VIcon.vue'

const props = withDefaults(
  defineProps<{ open: boolean; title?: string; width?: string }>(),
  { title: '', width: '880px' },
)
const emit = defineEmits<{ close: [] }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="absolute inset-0 bg-black/72 backdrop-blur-sm"
          @click="emit('close')"
        />
        <div
          class="glass relative z-10 max-h-[88vh] w-full overflow-hidden rounded-xl shadow-[0_32px_80px_-24px_rgba(0,0,0,0.9)]"
          :style="{ maxWidth: width }"
        >
          <header
            v-if="title || $slots.header"
            class="flex items-center justify-between gap-4 border-b border-line-subtle px-5 py-3.5"
          >
            <slot name="header">
              <h3 class="text-[15px] font-semibold">{{ title }}</h3>
            </slot>
            <button class="btn-icon" aria-label="关闭" @click="emit('close')">
              <VIcon name="x" :size="16" />
            </button>
          </header>
          <div class="max-h-[calc(88vh-56px)] overflow-y-auto">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s var(--ease-swift);
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition:
    transform 0.28s var(--ease-out-expo),
    opacity 0.22s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: translateY(12px) scale(0.98);
  opacity: 0;
}
</style>
