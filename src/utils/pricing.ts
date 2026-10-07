import type { TaskParams } from '@/api/types'
import type { PricingRules } from '@/mock/models'

/**
 * 本地预估积分。
 *
 * 前端文档 §7.3 要求「参数变化 → 本地快速估算（< 50ms 反馈）→ 提交前调
 * `/models/{slug}/quote` 拿服务端权威价格校验」。这里实现的就是「本地快速估算」
 * 那一步。公式必须与后端保持一致，任何一侧改动都要同步另一侧。
 *
 *   credits = ceil(时长 × 每秒单价 × 分辨率系数 × 音频系数 × 画幅系数)
 */
export function estimateCredits(rules: PricingRules, params: TaskParams): number {
  const resFactor = rules.resolution[params.resolution] ?? 1
  const aspectFactor = rules.aspect[params.aspect_ratio] ?? 1
  const audioFactor = params.audio ? rules.audio : 1

  const raw = params.duration * rules.per_second * resFactor * aspectFactor * audioFactor
  return Math.max(rules.min_credits, Math.ceil(raw))
}

/** 拆解计价过程，用于「价格明细」浮层——让用户看懂钱花在哪 */
export function explainPrice(rules: PricingRules, params: TaskParams) {
  const resFactor = rules.resolution[params.resolution] ?? 1
  const aspectFactor = rules.aspect[params.aspect_ratio] ?? 1
  const audioFactor = params.audio ? rules.audio : 1
  return [
    { label: '每秒基准价', value: `${rules.per_second} 积分` },
    { label: `时长 × ${params.duration}s`, value: `${rules.per_second * params.duration} 积分` },
    ...(resFactor !== 1
      ? [{ label: `${params.resolution} 系数`, value: `× ${resFactor}` }]
      : []),
    ...(aspectFactor !== 1
      ? [{ label: `${params.aspect_ratio} 画幅系数`, value: `× ${aspectFactor}` }]
      : []),
    ...(params.audio ? [{ label: '音效生成', value: `× ${audioFactor}` }] : []),
  ]
}

/** 参数是否被该模型支持——不支持时 UI 置灰而不是提交后才报错 */
export function paramSupported(
  model: { spec: { durations: number[]; resolutions: string[]; aspect_ratios: string[]; supports_audio: boolean } },
  key: 'duration' | 'resolution' | 'aspect_ratio' | 'audio',
  value: number | string | boolean,
): boolean {
  const s = model.spec
  switch (key) {
    case 'duration':
      return s.durations.includes(value as number)
    case 'resolution':
      return s.resolutions.includes(value as string)
    case 'aspect_ratio':
      return s.aspect_ratios.includes(value as string)
    case 'audio':
      return value ? s.supports_audio : true
  }
}

/** 把一组参数收敛到该模型确实支持的取值（切换模型时调用） */
export function clampParams(
  model: { spec: { durations: number[]; resolutions: string[]; aspect_ratios: string[]; supports_audio: boolean } },
  params: TaskParams,
): TaskParams {
  const s = model.spec
  const pick = <T>(list: T[], current: T, fallback: T): T =>
    list.includes(current) ? current : (list[0] ?? fallback)

  return {
    ...params,
    duration: pick(s.durations, params.duration, 5),
    resolution: pick(s.resolutions, params.resolution, '720p'),
    aspect_ratio: pick(s.aspect_ratios, params.aspect_ratio, '16:9'),
    audio: s.supports_audio ? params.audio : false,
  }
}
