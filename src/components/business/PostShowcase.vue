<script setup lang="ts">
import { computed } from 'vue'
import type { PosterScene } from '@/mock/models'
import { seededRand } from '@/utils/format'

/**
 * 程序化预览图。
 *
 * 真实项目里这里是一张 `<video preload="none" poster>`，poster_url 由后端
 * 在生成完成后异步抽首帧得到（前端文档 §7.4 明确禁止前端 canvas 抽帧）。
 *
 * 本地没有任何视频素材，所以用纯 CSS 分层合成一个「会呼吸的场景」：
 *   天空渐变 → 光斑 → 远山剪影 → 近景剪影 → 斜向光扫 → 暗角 → 胶片颗粒
 * 同一个 seed 永远渲染出同一张图，不会每次刷新闪色。
 */
const props = withDefaults(
  defineProps<{
    scene: PosterScene
    seed?: number
    /** hover 播放态：加速动画并显示进度条 */
    playing?: boolean
    ratio?: string
  }>(),
  { seed: 1, playing: false, ratio: '16 / 9' },
)

interface SceneDef {
  sky: string
  orb: string
  orbSize: string
  orbPos: string
  backFill: string
  backShape: string
  frontFill: string
  frontShape: string
  drift: string
  speed: string
}

const RIDGE = {
  mountains:
    'polygon(0 64%, 12% 47%, 25% 59%, 38% 39%, 52% 56%, 66% 43%, 80% 58%, 92% 48%, 100% 57%, 100% 100%, 0 100%)',
  mountainsNear:
    'polygon(0 78%, 11% 65%, 23% 75%, 35% 58%, 47% 73%, 59% 62%, 73% 76%, 87% 65%, 100% 75%, 100% 100%, 0 100%)',
  city:
    'polygon(0 71%, 6% 71%, 6% 55%, 13% 55%, 13% 67%, 20% 67%, 20% 43%, 27% 43%, 27% 63%, 35% 63%, 35% 50%, 43% 50%, 43% 69%, 51% 69%, 51% 37%, 59% 37%, 59% 61%, 67% 61%, 67% 47%, 75% 47%, 75% 67%, 83% 67%, 83% 53%, 91% 53%, 91% 69%, 100% 69%, 100% 100%, 0 100%)',
  cityNear:
    'polygon(0 84%, 9% 84%, 9% 72%, 18% 72%, 18% 81%, 28% 81%, 28% 66%, 38% 66%, 38% 86%, 50% 86%, 50% 70%, 61% 70%, 61% 83%, 72% 83%, 72% 64%, 84% 64%, 84% 84%, 100% 84%, 100% 100%, 0 100%)',
  waves:
    'polygon(0 58%, 10% 52%, 22% 60%, 34% 50%, 46% 59%, 58% 51%, 70% 61%, 82% 53%, 92% 60%, 100% 55%, 100% 100%, 0 100%)',
  wavesNear:
    'polygon(0 82%, 12% 74%, 26% 84%, 40% 72%, 54% 83%, 68% 73%, 82% 85%, 94% 76%, 100% 82%, 100% 100%, 0 100%)',
  flats:
    'polygon(0 62%, 100% 52%, 100% 100%, 0 100%)',
  flatsNear:
    'polygon(0 84%, 100% 70%, 100% 100%, 0 100%)',
  trees:
    'polygon(0 66%, 8% 52%, 15% 68%, 23% 46%, 31% 70%, 39% 55%, 47% 72%, 55% 48%, 63% 68%, 71% 54%, 79% 70%, 87% 50%, 94% 66%, 100% 58%, 100% 100%, 0 100%)',
  treesNear:
    'polygon(0 88%, 6% 70%, 13% 90%, 20% 66%, 28% 92%, 36% 74%, 44% 94%, 52% 68%, 60% 90%, 68% 72%, 76% 92%, 84% 70%, 92% 90%, 100% 76%, 100% 100%, 0 100%)',
  dome:
    'polygon(0 74%, 20% 68%, 40% 72%, 60% 66%, 80% 73%, 100% 69%, 100% 100%, 0 100%)',
  domeNear:
    'polygon(0 92%, 100% 86%, 100% 100%, 0 100%)',
}

const SCENES: Record<PosterScene, SceneDef> = {
  aurora: {
    sky: 'radial-gradient(120% 90% at 50% 110%, #0d3b4a 0%, #0a1c2e 45%, #05070f 100%)',
    orb: 'radial-gradient(circle, rgba(103,232,249,.85) 0%, rgba(34,211,238,0) 70%)',
    orbSize: '150% 55%',
    orbPos: '50% 18%',
    backFill: 'linear-gradient(180deg, #10313f 0%, #08131f 100%)',
    backShape: RIDGE.flats,
    frontFill: 'linear-gradient(180deg, #0b2230 0%, #050a12 100%)',
    frontShape: RIDGE.flatsNear,
    drift: 'rgba(155,130,255,.55)',
    speed: '19s',
  },
  dunes: {
    sky: 'linear-gradient(180deg, #2a1330 0%, #6d2547 32%, #c4553a 64%, #f0a05a 100%)',
    orb: 'radial-gradient(circle, rgba(255,214,150,.95) 0%, rgba(255,170,90,0) 68%)',
    orbSize: '70% 55%',
    orbPos: '68% 52%',
    backFill: 'linear-gradient(180deg, #9b4a3c 0%, #7a3a34 100%)',
    backShape: RIDGE.mountains,
    frontFill: 'linear-gradient(180deg, #5d2b2c 0%, #33161c 100%)',
    frontShape: RIDGE.mountainsNear,
    drift: 'rgba(255,196,120,.45)',
    speed: '23s',
  },
  ocean: {
    sky: 'linear-gradient(180deg, #06162e 0%, #0d3a63 42%, #1d6d92 66%, #3aa9c0 100%)',
    orb: 'radial-gradient(circle, rgba(190,245,255,.8) 0%, rgba(120,220,255,0) 70%)',
    orbSize: '80% 40%',
    orbPos: '42% 46%',
    backFill: 'linear-gradient(180deg, #17567c 0%, #0b2c46 100%)',
    backShape: RIDGE.waves,
    frontFill: 'linear-gradient(180deg, #0d3a5c 0%, #04141f 100%)',
    frontShape: RIDGE.wavesNear,
    drift: 'rgba(190,245,255,.5)',
    speed: '15s',
  },
  city: {
    sky: 'linear-gradient(180deg, #150d2e 0%, #2b1350 38%, #4a1d55 72%, #75302f 100%)',
    orb: 'radial-gradient(circle, rgba(255,160,120,.7) 0%, rgba(255,110,90,0) 72%)',
    orbSize: '120% 45%',
    orbPos: '50% 74%',
    backFill: 'linear-gradient(180deg, #241247 0%, #150a2b 100%)',
    backShape: RIDGE.city,
    frontFill: 'linear-gradient(180deg, #120727 0%, #05030f 100%)',
    frontShape: RIDGE.cityNear,
    drift: 'rgba(124,92,255,.5)',
    speed: '26s',
  },
  cosmos: {
    sky: 'radial-gradient(110% 80% at 62% 38%, #2a1856 0%, #120b2c 42%, #03040c 100%)',
    orb: 'radial-gradient(circle, rgba(216,180,254,.9) 0%, rgba(124,92,255,.35) 35%, rgba(124,92,255,0) 72%)',
    orbSize: '85% 70%',
    orbPos: '62% 38%',
    backFill: 'linear-gradient(180deg, #1b1040 0%, #0a0620 100%)',
    backShape: RIDGE.dome,
    frontFill: 'linear-gradient(180deg, #0b0620 0%, #020208 100%)',
    frontShape: RIDGE.domeNear,
    drift: 'rgba(34,211,238,.42)',
    speed: '30s',
  },
  forest: {
    sky: 'linear-gradient(180deg, #062018 0%, #0d3a26 40%, #1c5c33 72%, #3f8a3e 100%)',
    orb: 'radial-gradient(circle, rgba(226,255,180,.85) 0%, rgba(160,230,120,0) 70%)',
    orbSize: '75% 60%',
    orbPos: '30% 20%',
    backFill: 'linear-gradient(180deg, #12402a 0%, #072016 100%)',
    backShape: RIDGE.trees,
    frontFill: 'linear-gradient(180deg, #0a2b1c 0%, #03110a 100%)',
    frontShape: RIDGE.treesNear,
    drift: 'rgba(190,255,150,.4)',
    speed: '21s',
  },
  neon: {
    sky: 'linear-gradient(180deg, #0a0718 0%, #231047 36%, #5b1354 70%, #8f2050 100%)',
    orb: 'radial-gradient(circle, rgba(255,90,190,.75) 0%, rgba(120,40,220,0) 72%)',
    orbSize: '110% 60%',
    orbPos: '38% 62%',
    backFill: 'linear-gradient(180deg, #2d1055 0%, #160733 100%)',
    backShape: RIDGE.city,
    frontFill: 'linear-gradient(180deg, #12052c 0%, #04010d 100%)',
    frontShape: RIDGE.cityNear,
    drift: 'rgba(34,211,238,.55)',
    speed: '17s',
  },
  studio: {
    sky: 'linear-gradient(180deg, #2b2622 0%, #443a33 38%, #6b5c50 74%, #8d7a69 100%)',
    orb: 'radial-gradient(circle, rgba(255,240,215,.9) 0%, rgba(255,220,180,0) 70%)',
    orbSize: '90% 62%',
    orbPos: '34% 14%',
    backFill: 'linear-gradient(180deg, #6b5a4c 0%, #483b32 100%)',
    backShape: RIDGE.flats,
    frontFill: 'linear-gradient(180deg, #3b3129 0%, #1d1713 100%)',
    frontShape: RIDGE.domeNear,
    drift: 'rgba(255,226,180,.4)',
    speed: '24s',
  },
}

const def = computed(() => SCENES[props.scene] ?? SCENES.aurora)

/** 每张图的光斑位置与亮度都略有不同，避免一排卡片看起来是同一张 */
const vars = computed(() => {
  const r1 = seededRand(props.seed)
  const r2 = seededRand(props.seed * 3.7)
  const r3 = seededRand(props.seed * 7.1)
  return {
    '--orb-size': def.value.orbSize,
    '--orb-pos': def.value.orbPos,
    '--orb': def.value.orb,
    '--sky': def.value.sky,
    '--back-fill': def.value.backFill,
    '--back-shape': def.value.backShape,
    '--front-fill': def.value.frontFill,
    '--front-shape': def.value.frontShape,
    '--drift': def.value.drift,
    '--speed': def.value.speed,
    '--tilt': `${(r1 - 0.5) * 6}deg`,
    '--glow-x': `${30 + r2 * 40}%`,
    '--glow-y': `${25 + r3 * 40}%`,
    '--hue': `${Math.round((r2 - 0.5) * 24)}deg`,
  } as Record<string, string>
})

/** 星点只在宇宙 / 极光 / 城市出现 */
const hasStars = computed(() => ['cosmos', 'aurora', 'city'].includes(props.scene))
const starLayers = computed(() => {
  const dots = Array.from({ length: 26 }, (_, i) => {
    const x = seededRand(props.seed + i * 2.3) * 100
    const y = seededRand(props.seed + i * 5.1) * 62
    const s = seededRand(props.seed + i * 1.7) * 1.6 + 0.7
    return `radial-gradient(${s.toFixed(2)}px ${s.toFixed(2)}px at ${x.toFixed(1)}% ${y.toFixed(1)}%, rgba(255,255,255,.85), transparent)`
  })
  return { backgroundImage: dots.join(',') }
})
</script>

<template>
  <div
    class="poster grain"
    :class="[`scene-${scene}`, { 'is-playing': playing }]"
    :style="{ ...vars, aspectRatio: ratio }"
  >
    <div class="sky" />
    <div v-if="hasStars" class="stars" :style="starLayers" />
    <div class="orb" />
    <div class="drift" />

    <div class="ridge ridge-back" />
    <div class="ridge ridge-front" />

    <!-- 斜向光扫：模仿镜头眩光，hover 时扫过 -->
    <div class="sheen" />

    <div class="vignette" />

    <slot />
  </div>
</template>

<style scoped>
.poster {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: #05070d;
  width: 100%;
}

.sky,
.stars,
.orb,
.drift,
.ridge,
.sheen,
.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sky {
  background: var(--sky);
}

.stars {
  opacity: 0.75;
  animation: twinkle 6s ease-in-out infinite;
}

.orb {
  inset: auto;
  width: var(--orb-size);
  height: var(--orb-size);
  left: var(--orb-pos);
  top: var(--orb-pos);
  transform: translate(-50%, -50%);
  background: var(--orb);
  filter: blur(6px);
  animation: orb-breathe 9s ease-in-out infinite;
}

/* 缓慢游走的柔光——这张图「活着」的主要来源 */
.drift {
  background: radial-gradient(
    50% 60% at var(--glow-x) var(--glow-y),
    var(--drift) 0%,
    transparent 70%
  );
  filter: blur(28px);
  mix-blend-mode: screen;
  animation: drift-move var(--speed) ease-in-out infinite;
  opacity: 0.75;
}

.ridge {
  inset: auto 0 0 0;
  top: 0;
}
.ridge-back {
  background: var(--back-fill);
  clip-path: var(--back-shape);
  transform: translateX(0) rotate(var(--tilt));
  transform-origin: bottom center;
  animation: parallax var(--speed) ease-in-out infinite;
  opacity: 0.92;
  filter: blur(0.4px);
}
.ridge-front {
  background: var(--front-fill);
  clip-path: var(--front-shape);
  animation: parallax-close calc(var(--speed) * 0.7) ease-in-out infinite;
  filter: blur(1.2px);
}

.sheen {
  background: linear-gradient(
    108deg,
    transparent 30%,
    rgba(255, 255, 255, 0.09) 46%,
    rgba(255, 255, 255, 0.02) 52%,
    transparent 68%
  );
  transform: translateX(-60%);
  opacity: 0;
}

.vignette {
  background:
    radial-gradient(120% 90% at 50% 50%, transparent 42%, rgba(0, 0, 0, 0.55) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.28) 0%, transparent 28%, rgba(0, 0, 0, 0.5) 100%);
}

/* hover 播放态 */
.is-playing .sheen {
  animation: sheen-pass 2.6s var(--ease-swift) infinite;
  opacity: 1;
}
.is-playing .drift {
  animation-duration: calc(var(--speed) * 0.28);
  opacity: 1;
}
.is-playing .ridge-back {
  animation-duration: calc(var(--speed) * 0.32);
}
.is-playing .ridge-front {
  animation-duration: calc(var(--speed) * 0.22);
}
.is-playing .orb {
  animation-duration: 4.5s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 0.95;
  }
}
@keyframes orb-breathe {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.85;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.12);
    opacity: 1;
  }
}
@keyframes drift-move {
  0%,
  100% {
    transform: translate3d(-7%, -3%, 0) scale(1.06);
  }
  50% {
    transform: translate3d(7%, 4%, 0) scale(1.16);
  }
}
@keyframes parallax {
  0%,
  100% {
    transform: translateX(-1.5%) rotate(var(--tilt));
  }
  50% {
    transform: translateX(1.5%) rotate(var(--tilt));
  }
}
@keyframes parallax-close {
  0%,
  100% {
    transform: translateX(2%) scale(1.03);
  }
  50% {
    transform: translateX(-2%) scale(1.07);
  }
}
@keyframes sheen-pass {
  0% {
    transform: translateX(-70%);
  }
  60%,
  100% {
    transform: translateX(70%);
  }
}
</style>
