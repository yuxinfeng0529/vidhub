<script setup lang="ts">
/** 页面底层的极光背景。纯 CSS，无 canvas、无图片请求。 */
withDefaults(defineProps<{ variant?: 'hero' | 'page' }>(), { variant: 'page' })
</script>

<template>
  <div class="backdrop" :class="variant" aria-hidden="true">
    <div class="grid-layer" />
    <div class="blob blob-a" />
    <div class="blob blob-b" />
    <div class="blob blob-c" />
    <div class="fade" />
  </div>
</template>

<style scoped>
.backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.grid-layer {
  position: absolute;
  inset: -1px;
  background-image:
    linear-gradient(rgba(46, 53, 66, 0.34) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46, 53, 66, 0.34) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(120% 80% at 50% 0%, #000 8%, transparent 68%);
  -webkit-mask-image: radial-gradient(120% 80% at 50% 0%, #000 8%, transparent 68%);
  opacity: 0.7;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;
}

.blob-a {
  width: 720px;
  height: 720px;
  top: -280px;
  left: -140px;
  background: radial-gradient(circle, rgba(124, 92, 255, 0.5) 0%, transparent 68%);
  animation: drift-a 26s ease-in-out infinite;
}

.blob-b {
  width: 620px;
  height: 620px;
  top: -180px;
  right: -160px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.34) 0%, transparent 68%);
  animation: drift-b 32s ease-in-out infinite;
}

.blob-c {
  width: 540px;
  height: 540px;
  top: 220px;
  left: 38%;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
  animation: drift-c 38s ease-in-out infinite;
}

.fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(11, 13, 18, 0.6) 62%, #0b0d12 100%);
}

/* 内页的极光要收敛一些，别抢内容的注意力 */
.page .blob {
  opacity: 0.45;
}
.page .grid-layer {
  opacity: 0.35;
}

.hero .blob-a {
  width: 860px;
  height: 860px;
}
.hero .blob-b {
  width: 760px;
  height: 760px;
}

@keyframes drift-a {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(80px, 60px, 0) scale(1.14);
  }
}
@keyframes drift-b {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1.06);
  }
  50% {
    transform: translate3d(-70px, 90px, 0) scale(1);
  }
}
@keyframes drift-c {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 0.8;
  }
  50% {
    transform: translate3d(60px, -70px, 0);
    opacity: 1;
  }
}
</style>
