/**
 * 与 docs/04-API接口契约.md 一一对应的类型定义。
 *
 * 纪律：这里只放「后端契约里存在的字段」。前端自造的展示字段一律加 `_` 前缀或
 * 放到单独的 mock 类型里（见 src/mock/types.ts），避免将来接真实接口时混淆。
 */

export type GenerateType = 't2v' | 'i2v' | 'v2v'

export type TaskStatus =
  | 'created'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'timeout'

export type ModelStatus = 'available' | 'maintenance' | 'offline'

export interface Vendor {
  slug: string
  name: string
  logo_url?: string
}

export interface ModelSpec {
  durations: number[]
  resolutions: string[]
  aspect_ratios: string[]
  supports_audio: boolean
  supports_first_frame: boolean
  supports_last_frame: boolean
  max_prompt_length: number
}

export interface ModelPricing {
  unit: 'per_second' | 'per_call'
  from_credits: number
  currency_note: string
}

export interface ModelPreview {
  video_url: string
  poster_url: string
}

/** GET /models 返回的模型对象 */
export interface Model {
  id: string
  slug: string
  name: string
  vendor: Vendor
  tagline: string
  types: GenerateType[]
  tags: string[]
  spec: ModelSpec
  pricing: ModelPricing
  preview: ModelPreview
  status: ModelStatus
  recommended: boolean
  sort_weight: number
}

/** 模型详情在列表对象上追加的字段 */
export interface ModelDetail extends Model {
  description: string
  examples: ModelExample[]
  price_table: ModelPriceRow[]
  limitations: string[]
}

export interface ModelExample {
  prompt: string
  video_url: string
  poster_url: string
  params: { duration: number; resolution: string }
}

export interface ModelPriceRow {
  resolution: string
  duration: number
  audio: boolean
  credits: number
}

/** 生成任务的参数 */
export interface TaskParams {
  duration: number
  resolution: string
  aspect_ratio: string
  audio: boolean
  seed: number
}

export interface TaskBilling {
  estimated_credits: number
  frozen_credits: number
  actual_credits: number | null
  refunded_credits?: number
}

export interface TaskAsset {
  id: string
  type: 'video' | 'image'
  url: string
  poster_url: string
  duration: number
  width: number
  height: number
  size_bytes: number
}

export interface TaskError {
  code: string
  message: string
}

export interface Task {
  id: string
  status: TaskStatus
  model: { slug: string; name: string }
  type: GenerateType
  prompt: string
  negative_prompt?: string | null
  params: TaskParams
  billing: TaskBilling
  progress: number
  assets: TaskAsset[]
  error: TaskError | null
  created_at: string
  submitted_at: string | null
  finished_at: string | null
  /** 排队时上游给出的「前方还有几个任务」，没有就是 null */
  queue_ahead?: number | null
  /** 仅调试可见；C 端默认隐藏 */
  provider?: { name: string }
}

export type AssetSource = 'upload' | 'generated'

export interface Asset {
  id: string
  type: 'video' | 'image'
  url: string
  poster_url: string
  filename: string
  source: AssetSource
  model?: { slug: string; name: string }
  prompt?: string
  duration?: number
  width: number
  height: number
  size_bytes: number
  favorite: boolean
  created_at: string
  /** 与任务关联时带上，便于「再次创作」 */
  task_id?: string
}

export interface Wallet {
  balance: number
  frozen: number
  available: number
}

export interface Plan {
  id: string
  name: string
  price_yuan: number
  credits: number
  bonus_credits: number
  tagline: string
  highlights: string[]
  recommended?: boolean
  badge?: string
}

export interface CurrentUser {
  id: string
  nickname: string
  phone_masked: string
  avatar_text: string
  role: 'user' | 'admin'
  plan_name: string
  created_at: string
}

/** 统一错误对象（后端错误响应体，见前端文档 §4.2） */
export interface ApiErrorShape {
  code: string
  message: string
  details?: Record<string, unknown>
  trace_id?: string
}
