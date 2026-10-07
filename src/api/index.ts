/**
 * 接口层。
 *
 * ★ 这是全项目唯一需要改动的地方 ★
 *
 * 现在每个函数都返回本地 mock 数据，但**函数签名严格对齐 docs/04-API接口契约.md**。
 * 接后端时只需要把函数体换成 `client.get(...)` / `client.post(...)`，
 * 上层页面、store、组件的代码一行都不用动。
 *
 * 分层纪律（前端文档 §1）：本文件只做请求，禁止业务判断、禁止弹 toast、禁止跳路由。
 */
import type {
  Asset,
  CurrentUser,
  GenerateType,
  Model,
  Plan,
  Task,
  TaskParams,
  Wallet,
} from './types'
import { MODELS, modelBySlug, type MockModel } from '@/mock/models'
import { MOCK_TASKS } from '@/mock/tasks'
import { MOCK_ASSETS, STORAGE_QUOTA_BYTES } from '@/mock/assets'
import { PLANS } from '@/mock/data'
import { estimateCredits } from '@/utils/pricing'

/** 模拟网络延迟，让加载态、骨架屏这些真实存在的东西能被看见 */
function delay<T>(value: T, ms = 260): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let taskSeq = 0
const newTaskId = () => `t_${Date.now().toString(16).slice(-5)}${(taskSeq++).toString(16)}`

/* ─────────────────────────── 模型 ─────────────────────────── */

export interface ModelQuery {
  types?: GenerateType[]
  vendors?: string[]
  max_duration_gte?: number
  audio?: boolean
  price_max?: number
  sort?: 'recommend' | 'price_asc' | 'price_desc' | 'newest'
  q?: string
}

export const modelApi = {
  /** GET /models */
  async list(query: ModelQuery = {}): Promise<{ items: MockModel[]; total: number }> {
    let items = [...MODELS]

    if (query.types?.length) {
      items = items.filter((m) => m.types.some((t) => query.types!.includes(t)))
    }
    if (query.vendors?.length) {
      items = items.filter((m) => query.vendors!.includes(m.vendor.slug))
    }
    if (query.max_duration_gte) {
      const min = query.max_duration_gte
      items = items.filter((m) => Math.max(...m.spec.durations) >= min)
    }
    if (query.audio) {
      items = items.filter((m) => m.spec.supports_audio)
    }
    if (query.price_max) {
      items = items.filter((m) => m.pricing.from_credits <= query.price_max!)
    }
    if (query.q?.trim()) {
      const kw = query.q.trim().toLowerCase()
      items = items.filter((m) =>
        [m.name, m.tagline, m.vendor.name, ...m.tags].join(' ').toLowerCase().includes(kw),
      )
    }

    switch (query.sort) {
      case 'price_asc':
        items.sort((a, b) => a.pricing.from_credits - b.pricing.from_credits)
        break
      case 'price_desc':
        items.sort((a, b) => b.pricing.from_credits - a.pricing.from_credits)
        break
      case 'newest':
        items.sort((a, b) => b.seed - a.seed)
        break
      default:
        items.sort((a, b) => b.sort_weight - a.sort_weight)
    }

    return delay({ items, total: items.length })
  },

  /** GET /models/{slug} */
  async detail(slug: string): Promise<MockModel | null> {
    return delay(modelBySlug(slug) ?? null, 180)
  },

  /** POST /models/{slug}/quote —— 服务端权威计价 */
  async quote(
    slug: string,
    params: TaskParams,
    available: number,
  ): Promise<{ credits: number; currency_yuan: string; available: number; sufficient: boolean }> {
    const model = modelBySlug(slug)
    if (!model) throw new Error(`未知模型：${slug}`)
    const credits = estimateCredits(model.rules, params)
    return delay(
      {
        credits,
        currency_yuan: (credits / 100).toFixed(2),
        available,
        sufficient: available >= credits,
      },
      120,
    )
  },
}

/* ─────────────────────────── 任务 ─────────────────────────── */

export interface CreateTaskPayload {
  model: string
  type: GenerateType
  prompt: string
  negative_prompt?: string
  params: TaskParams
  first_frame_asset_id?: string | null
}

export const taskApi = {
  /** GET /tasks */
  async list(): Promise<{ items: Task[]; has_more: boolean; next_cursor: string | null }> {
    return delay({ items: MOCK_TASKS, has_more: false, next_cursor: null })
  },

  /** POST /tasks */
  async create(payload: CreateTaskPayload): Promise<Task> {
    const model = modelBySlug(payload.model)
    if (!model) throw new Error(`未知模型：${payload.model}`)

    const credits = estimateCredits(model.rules, payload.params)
    const id = newTaskId()
    const task: Task = {
      id,
      status: 'created',
      model: { slug: model.slug, name: model.name },
      type: payload.type,
      prompt: payload.prompt,
      negative_prompt: payload.negative_prompt ?? null,
      params: { ...payload.params },
      billing: { estimated_credits: credits, frozen_credits: credits, actual_credits: null },
      progress: 0,
      assets: [],
      error: null,
      created_at: new Date().toISOString(),
      submitted_at: null,
      finished_at: null,
      queue_ahead: null,
      provider: { name: model.vendor.slug },
    }
    return delay(task, 420)
  },

  /** POST /tasks/{id}/retry —— 基于原参数创建新任务（重新计费） */
  async retry(id: string): Promise<Task> {
    const origin = MOCK_TASKS.find((t) => t.id === id)
    return this.create({
      model: origin?.model.slug ?? 'kling-v3',
      type: origin?.type ?? 't2v',
      prompt: origin?.prompt ?? '',
      params: origin?.params ?? {
        duration: 5,
        resolution: '720p',
        aspect_ratio: '16:9',
        audio: false,
        seed: -1,
      },
    })
  },
}

/* ─────────────────────────── 资产 ─────────────────────────── */

export const assetApi = {
  /** GET /assets */
  async list(): Promise<{
    items: Asset[]
    total: number
    used_bytes: number
    quota_bytes: number
  }> {
    const used = MOCK_ASSETS.reduce((sum, a) => sum + a.size_bytes, 0)
    return delay({
      items: MOCK_ASSETS,
      total: MOCK_ASSETS.length,
      used_bytes: used,
      quota_bytes: STORAGE_QUOTA_BYTES,
    })
  },
}

/* ─────────────────────────── 钱包 / 套餐 / 用户 ─────────────────────────── */

export const walletApi = {
  /** GET /wallet */
  async get(): Promise<Wallet> {
    const balance = 3400
    const frozen = 680
    return delay({ balance, frozen, available: balance - frozen }, 160)
  },
}

export const planApi = {
  /** GET /plans */
  async list(): Promise<Plan[]> {
    return delay(PLANS, 160)
  },
}

export const userApi = {
  /** GET /users/me */
  async me(): Promise<CurrentUser> {
    return delay({
      id: 'u_01',
      nickname: '创作者 26073',
      phone_masked: '138****2607',
      avatar_text: '创',
      role: 'user',
      plan_name: '基础',
      created_at: '2026-08-14T09:00:00Z',
    })
  },
}

export type { Model }
