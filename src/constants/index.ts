import type { TaskStatus } from '@/api/types'

/**
 * 任务状态映射表。
 * 前端文档 §6 明确要求：任何页面显示任务状态都必须引用这张表，不许各写各的。
 */
export interface TaskStatusMeta {
  label: string
  color: string
  glyph: string
  /** 是否处于「未结束」状态——决定要不要继续订阅进度 */
  live: boolean
}

export const TASK_STATUS: Record<TaskStatus, TaskStatusMeta> = {
  created: { label: '已创建', color: 'var(--color-ink-3)', glyph: '○', live: true },
  queued: { label: '排队中', color: 'var(--color-info)', glyph: '⏳', live: true },
  running: { label: '生成中', color: 'var(--color-accent-500)', glyph: '◐', live: true },
  succeeded: { label: '已完成', color: 'var(--color-success)', glyph: '✓', live: false },
  failed: { label: '失败', color: 'var(--color-danger)', glyph: '✕', live: false },
  canceled: { label: '已取消', color: 'var(--color-ink-3)', glyph: '⊘', live: false },
  timeout: { label: '超时', color: 'var(--color-warning)', glyph: '⚠', live: false },
}

export const isLiveStatus = (s: TaskStatus) => TASK_STATUS[s].live

/** 主导航 */
export const NAV_LINKS = [
  { name: '模型广场', to: '/models' },
  { name: '工作台', to: '/studio' },
  { name: '资产库', to: '/assets' },
  { name: '定价', to: '/pricing' },
]

export const FOOTER_COLUMNS = [
  {
    title: '产品',
    links: [
      { name: '模型广场', to: '/models' },
      { name: '生成工作台', to: '/studio' },
      { name: '资产库', to: '/assets' },
      { name: '定价套餐', to: '/pricing' },
    ],
  },
  {
    title: '开发者',
    links: [
      { name: 'API 文档', to: '/pricing' },
      { name: 'API Key 管理', to: '/assets' },
      { name: '用量统计', to: '/pricing' },
      { name: '服务状态', to: '/' },
    ],
  },
  {
    title: '公司',
    links: [
      { name: '关于我们', to: '/' },
      { name: '联系我们', to: '/' },
      { name: '商务合作', to: '/' },
      { name: '加入我们', to: '/' },
    ],
  },
  {
    title: '法律',
    links: [
      { name: '用户协议', to: '/' },
      { name: '隐私政策', to: '/' },
      { name: '内容规范', to: '/' },
      { name: '退款政策', to: '/' },
    ],
  },
]

/** 画幅 → 预览区宽高比 */
export const ASPECT_CLASS: Record<string, string> = {
  '16:9': '16 / 9',
  '9:16': '9 / 16',
  '1:1': '1 / 1',
  '4:3': '4 / 3',
  '21:9': '21 / 9',
}

export const RESOLUTION_HINT: Record<string, string> = {
  '480p': '854 × 480',
  '720p': '1280 × 720',
  '1080p': '1920 × 1080',
  '4K': '3840 × 2160',
}
