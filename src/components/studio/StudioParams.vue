<script setup lang="ts">
import { ref } from 'vue'
import type { GenerateType, TaskParams } from '@/api/types'
import type { MockModel } from '@/mock/models'
import { TYPE_LABEL } from '@/mock/models'
import { RESOLUTION_HINT } from '@/constants'
import VIcon from '../base/VIcon.vue'

const props = defineProps<{
  model: MockModel
  params: TaskParams
  type: GenerateType
  seedInput: string
  negativePrompt: string
}>()

const emit = defineEmits<{
  'update:params': [patch: Partial<TaskParams>]
  'update:type': [t: GenerateType]
  'update:seedInput': [v: string]
  'update:negativePrompt': [v: string]
  'randomize-seed': []
  'apply-seed': []
}>()

const advanced = ref(false)

/** 只渲染该模型支持的选项；不支持的置灰并说明原因（前端文档 §7.3 关键交互 3） */
const durations = [3, 4, 5, 6, 8, 10, 12, 15, 20, 30]
const resolutions = ['480p', '720p', '1080p', '4K']
const aspects = ['16:9', '9:16', '1:1', '4:3']
</script>

<template>
  <div class="space-y-5">
    <!-- 生成模式 -->
    <div v-if="model.types.length > 1">
      <label class="mb-2 block text-[12.5px] font-medium text-ink-2">生成模式</label>
      <div class="flex gap-1 rounded-lg border border-line bg-inset p-1">
        <button
          v-for="t in model.types"
          :key="t"
          class="seg-item flex-1 !text-[12.5px]"
          :data-active="type === t"
          @click="emit('update:type', t)"
        >
          {{ TYPE_LABEL[t] }}
        </button>
      </div>
    </div>

    <!-- 时长 -->
    <div>
      <div class="mb-2 flex items-baseline justify-between">
        <label class="text-[12.5px] font-medium text-ink-2">时长</label>
        <span class="text-[11px] text-ink-4">该模型最长 {{ Math.max(...model.spec.durations) }} 秒</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="d in durations"
          :key="d"
          class="seg-item !text-[12.5px]"
          :data-active="params.duration === d"
          :disabled="!model.spec.durations.includes(d)"
          :title="model.spec.durations.includes(d) ? '' : `该模型不支持 ${d} 秒`"
          @click="emit('update:params', { duration: d })"
        >
          {{ d }}s
        </button>
      </div>
    </div>

    <!-- 分辨率 -->
    <div>
      <label class="mb-2 block text-[12.5px] font-medium text-ink-2">分辨率</label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="r in resolutions"
          :key="r"
          class="seg-item"
          :data-active="params.resolution === r"
          :disabled="!model.spec.resolutions.includes(r)"
          @click="emit('update:params', { resolution: r })"
        >
          <span class="block">{{ r }}</span>
          <span class="block text-[10px] opacity-60">{{ RESOLUTION_HINT[r] }}</span>
        </button>
      </div>
    </div>

    <!-- 画幅 -->
    <div>
      <label class="mb-2 block text-[12.5px] font-medium text-ink-2">画幅</label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="a in aspects"
          :key="a"
          class="seg-item flex items-center gap-2"
          :data-active="params.aspect_ratio === a"
          :disabled="!model.spec.aspect_ratios.includes(a)"
          @click="emit('update:params', { aspect_ratio: a })"
        >
          <span
            class="block rounded-[3px] border"
            :class="params.aspect_ratio === a ? 'border-white/70' : 'border-ink-4'"
            :style="{
              width: a === '9:16' ? '9px' : a === '1:1' ? '12px' : a === '4:3' ? '15px' : '17px',
              height: a === '9:16' ? '16px' : a === '1:1' ? '12px' : a === '4:3' ? '11px' : '10px',
            }"
          />
          {{ a }}
        </button>
      </div>
    </div>

    <!-- 音频 -->
    <div class="flex items-center justify-between rounded-lg border border-line bg-inset px-3.5 py-3">
      <div>
        <p class="text-[12.5px] font-medium text-ink-2">生成音效</p>
        <p class="mt-0.5 text-[11px] text-ink-4">
          <template v-if="model.spec.supports_audio">上游模型原生生成，与画面同步</template>
          <template v-else>{{ model.name }} 不支持音频轨</template>
        </p>
      </div>
      <button
        class="toggle"
        :data-on="params.audio"
        :disabled="!model.spec.supports_audio"
        :aria-pressed="params.audio"
        @click="emit('update:params', { audio: !params.audio })"
      >
        <span class="knob" />
      </button>
    </div>

    <!-- 随机种子 -->
    <div>
      <label class="mb-2 block text-[12.5px] font-medium text-ink-2">随机种子</label>
      <div class="flex gap-2">
        <input
          :value="seedInput"
          class="field font-mono !text-[13px]"
          placeholder="留空 = 每次随机（-1）"
          @input="emit('update:seedInput', ($event.target as HTMLInputElement).value)"
          @blur="emit('apply-seed')"
          @keydown.enter="emit('apply-seed')"
        />
        <button class="btn-ghost !px-3" title="随机生成一个种子" @click="emit('randomize-seed')">
          <VIcon name="dice" :size="16" />
        </button>
      </div>
      <p class="mt-1.5 text-[11px] text-ink-4">
        固定种子 + 相同参数可以复现同一条结果，方便微调提示词时做对照
      </p>
    </div>

    <!-- 高级 -->
    <div>
      <button
        class="flex w-full items-center gap-2 text-[12.5px] text-ink-3 transition-colors hover:text-ink"
        @click="advanced = !advanced"
      >
        <VIcon name="sliders" :size="14" />
        高级选项
        <VIcon name="chevronDown" :size="13" class="ml-auto transition-transform" :class="advanced ? 'rotate-180' : ''" />
      </button>

      <Transition name="fold">
        <div v-if="advanced" class="mt-3 space-y-3">
          <div>
            <label class="mb-1.5 block text-[12px] text-ink-3">负向提示词</label>
            <textarea
              :value="negativePrompt"
              rows="2"
              class="field resize-none !text-[12.5px]"
              placeholder="不希望出现的元素，例如：模糊, 变形, 多余手指"
              @input="emit('update:negativePrompt', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
          <p class="rounded-lg border border-line-subtle bg-inset p-3 text-[11.5px] leading-relaxed text-ink-4">
            运镜、风格预设、首尾帧等参数将在接入真实上游后按各家能力动态开放。当前为演示版本。
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.toggle {
  position: relative;
  width: 42px;
  height: 24px;
  flex: none;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  background: var(--color-canvas);
  transition:
    background-color 0.24s,
    border-color 0.24s;
}
.toggle[data-on='true'] {
  background: linear-gradient(135deg, #7c5cff, #6544e8);
  border-color: transparent;
}
.toggle:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-ink-2);
  transition:
    transform 0.24s var(--ease-out-expo),
    background-color 0.24s;
}
.toggle[data-on='true'] .knob {
  transform: translateX(18px);
  background: #fff;
}

.fold-enter-active,
.fold-leave-active {
  transition:
    opacity 0.2s,
    transform 0.24s var(--ease-out-expo);
}
.fold-enter-from,
.fold-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
