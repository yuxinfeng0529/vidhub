import type { Task } from '@/api/types'
import { MODELS } from './models'

const now = Date.now()
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString()

let seq = 0
const nextId = () => `t_${(0x9f2a + seq++ * 37).toString(16)}`

interface Seed {
  slug: string
  status: Task['status']
  prompt: string
  duration: number
  resolution: string
  aspect: string
  audio: boolean
  progress: number
  minutesAgo: number
  credits: number
  error?: { code: string; message: string }
  queueAhead?: number
}

const SEEDS: Seed[] = [
  {
    slug: 'kling-v3',
    status: 'running',
    prompt: '一只柯基在草地上奔跑，阳光明媚，电影质感，浅景深，逆光绒毛边缘发光',
    duration: 10,
    resolution: '1080p',
    aspect: '16:9',
    audio: true,
    progress: 62,
    minutesAgo: 1,
    credits: 243,
  },
  {
    slug: 'sora-2',
    status: 'queued',
    prompt: '海浪拍打礁石，水花在逆光中飞散，高速摄影，慢动作',
    duration: 10,
    resolution: '1080p',
    aspect: '16:9',
    audio: true,
    progress: 0,
    minutesAgo: 0,
    credits: 437,
    queueAhead: 2,
  },
  {
    slug: 'jimeng-v3',
    status: 'succeeded',
    prompt: '一个玻璃香水瓶放在米色亚麻布上，晨光斜射，慢速推近，柔和阴影',
    duration: 5,
    resolution: '1080p',
    aspect: '9:16',
    audio: false,
    progress: 100,
    minutesAgo: 24,
    credits: 45,
  },
  {
    slug: 'seedance-pro',
    status: 'succeeded',
    prompt: '先特写女主角的眼睛，再拉远到整个天台城市全景，黄昏色温',
    duration: 8,
    resolution: '1080p',
    aspect: '16:9',
    audio: true,
    progress: 100,
    minutesAgo: 96,
    credits: 76,
  },
  {
    slug: 'veo-3.1',
    status: 'failed',
    prompt: '一位老人对着镜头说“欢迎回来”，背景是下雨的窗',
    duration: 8,
    resolution: '1080p',
    aspect: '16:9',
    audio: true,
    progress: 38,
    minutesAgo: 190,
    credits: 307,
    error: {
      code: 'PROVIDER_CONTENT_FLAGGED',
      message: '上游内容安全策略拒绝了本次生成，积分已全额退回。',
    },
  },
  {
    slug: 'hailuo-02',
    status: 'succeeded',
    prompt: '沙漠日落，镜头环绕骆驼队一周后向上摇到天空',
    duration: 10,
    resolution: '1080p',
    aspect: '16:9',
    audio: false,
    progress: 100,
    minutesAgo: 300,
    credits: 105,
  },
  {
    slug: 'pika-2.5',
    status: 'canceled',
    prompt: '霓虹灯管组成的“OPEN”招牌闪烁，雨夜街道反光',
    duration: 5,
    resolution: '720p',
    aspect: '1:1',
    audio: false,
    progress: 0,
    minutesAgo: 430,
    credits: 23,
  },
  {
    slug: 'runway-gen4',
    status: 'succeeded',
    prompt: '星云在深空中缓慢坍缩，紫色与青色交织，粒子缓慢聚拢',
    duration: 10,
    resolution: '1080p',
    aspect: '16:9',
    audio: false,
    progress: 100,
    minutesAgo: 700,
    credits: 195,
  },
  {
    slug: 'luma-ray3',
    status: 'succeeded',
    prompt: '集市里人群穿行，镜头跟随一个提菜篮的人，午后暖光',
    duration: 9,
    resolution: '1080p',
    aspect: '16:9',
    audio: false,
    progress: 100,
    minutesAgo: 1400,
    credits: 135,
  },
  {
    slug: 'vidu-q2',
    status: 'timeout',
    prompt: '参考图中的人物在便利店拿起一罐饮料，微笑着看向镜头',
    duration: 8,
    resolution: '1080p',
    aspect: '9:16',
    audio: false,
    progress: 91,
    minutesAgo: 2000,
    credits: 72,
    error: { code: 'TASK_TIMEOUT', message: '上游超时未返回结果，积分已全额退回。' },
  },
]

/** 资产 id 与任务一一对应，避免 mock 数据里两处各写一套 id */
export const taskAssetId = (taskId: string) => `a_${taskId.slice(2)}`

export const MOCK_TASKS: Task[] = SEEDS.map((s) => {
  const model = MODELS.find((m) => m.slug === s.slug)!
  const id = nextId()
  const finished = s.status === 'succeeded' || s.status === 'failed' || s.status === 'timeout'
  const settled = s.status === 'succeeded'
  return {
    id,
    status: s.status,
    model: { slug: model.slug, name: model.name },
    type: s.slug === 'vidu-q2' ? 'i2v' : 't2v',
    prompt: s.prompt,
    negative_prompt: null,
    params: {
      duration: s.duration,
      resolution: s.resolution,
      aspect_ratio: s.aspect,
      audio: s.audio,
      seed: -1,
    },
    billing: {
      estimated_credits: s.credits,
      frozen_credits: s.status === 'queued' || s.status === 'running' ? s.credits : 0,
      actual_credits: settled ? s.credits : null,
      refunded_credits: s.status === 'failed' || s.status === 'timeout' ? s.credits : undefined,
    },
    progress: s.progress,
    assets: settled
      ? [
          {
            id: taskAssetId(id),
            type: 'video',
            url: '',
            poster_url: '',
            duration: s.duration,
            width: s.aspect === '9:16' ? 1080 : s.aspect === '1:1' ? 1080 : 1920,
            height: s.aspect === '9:16' ? 1920 : 1080,
            size_bytes: Math.round(s.duration * 1_450_000),
          },
        ]
      : [],
    error: s.error ?? null,
    created_at: iso(s.minutesAgo),
    submitted_at: s.status === 'created' ? null : iso(s.minutesAgo),
    finished_at: finished ? iso(Math.max(0, s.minutesAgo - s.duration / 6)) : null,
    queue_ahead: s.queueAhead ?? null,
    provider: { name: model.vendor.slug },
  }
})

/** 工作台右侧「本次队列」初始只放未完成的任务 */
export const INITIAL_ACTIVE_TASKS = MOCK_TASKS.filter(
  (t) => t.status === 'queued' || t.status === 'running',
)
