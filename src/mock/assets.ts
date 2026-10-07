import type { Asset } from '@/api/types'
import { MODELS } from './models'
import { MOCK_TASKS } from './tasks'

const now = Date.now()
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString()

/** 成片库：由「已完成任务」派生，保证两处数据天然一致 */
const generated: Asset[] = MOCK_TASKS.flatMap((t) =>
  t.assets.map((a) => {
    const model = MODELS.find((m) => m.slug === t.model.slug)!
    return {
      id: a.id,
      type: 'video' as const,
      url: a.url,
      poster_url: a.poster_url,
      filename: `${t.model.slug}_${t.id}.mp4`,
      source: 'generated' as const,
      model: { slug: model.slug, name: model.name },
      prompt: t.prompt,
      duration: a.duration,
      width: a.width,
      height: a.height,
      size_bytes: a.size_bytes,
      favorite: model.slug === 'kling-v3' || model.slug === 'sora-2',
      created_at: t.finished_at ?? t.created_at,
      task_id: t.id,
    }
  }),
)

interface UploadSeed {
  filename: string
  minutesAgo: number
  mb: number
  w: number
  h: number
  favorite?: boolean
  scene: string
}

const UPLOAD_SEEDS: UploadSeed[] = [
  { filename: '模特-正面-白底.png', minutesAgo: 18, mb: 2.4, w: 2048, h: 2048, favorite: true, scene: 'studio' },
  { filename: '产品图-香水瓶-01.jpg', minutesAgo: 42, mb: 1.8, w: 2400, h: 1600, favorite: true, scene: 'studio' },
  { filename: '参考-街景夜景.jpg', minutesAgo: 155, mb: 3.1, w: 3000, h: 2000, scene: 'neon' },
  { filename: '素材-沙漠航拍.mp4', minutesAgo: 320, mb: 48.6, w: 3840, h: 2160, scene: 'dunes' },
  { filename: '角色参考-女主-A.png', minutesAgo: 500, mb: 2.2, w: 1024, h: 1536, favorite: true, scene: 'forest' },
  { filename: '角色参考-女主-B.png', minutesAgo: 502, mb: 2.1, w: 1024, h: 1536, scene: 'forest' },
  { filename: '纹理-亚麻布.jpg', minutesAgo: 880, mb: 4.3, w: 2000, h: 2000, scene: 'dunes' },
  { filename: '素材-波浪慢动作.mp4', minutesAgo: 1200, mb: 62.4, w: 1920, h: 1080, scene: 'ocean' },
  { filename: '草图-分镜-v3.png', minutesAgo: 1600, mb: 1.1, w: 1600, h: 900, scene: 'city' },
  { filename: '色卡-品牌主色.png', minutesAgo: 2400, mb: 0.3, w: 1200, h: 800, scene: 'aurora' },
]

const uploads: Asset[] = UPLOAD_SEEDS.map((u, i) => {
  const isVideo = u.filename.endsWith('.mp4')
  return {
    id: `a_up_${String(i + 1).padStart(2, '0')}`,
    type: isVideo ? 'video' : 'image',
    url: '',
    poster_url: '',
    filename: u.filename,
    source: 'upload',
    duration: isVideo ? 12 + i * 3 : undefined,
    width: u.w,
    height: u.h,
    size_bytes: Math.round(u.mb * 1024 * 1024),
    favorite: u.favorite ?? false,
    created_at: iso(u.minutesAgo),
  }
})

export const MOCK_ASSETS: Asset[] = [...generated, ...uploads].sort(
  (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
)

/** 存储配额：免费版 10 GB */
export const STORAGE_QUOTA_BYTES = 10 * 1024 * 1024 * 1024
