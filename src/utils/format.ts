/** 积分数值 → `1,200 积分` */
export function formatCredits(n: number, withUnit = true): string {
  const s = Math.round(n).toLocaleString('zh-CN')
  return withUnit ? `${s} 积分` : s
}

/** 积分 → 人民币。1 元 = 100 积分（见 docs/README.md §4） */
export function creditsToYuan(n: number): string {
  return `¥${(n / 100).toFixed(2)}`
}

/** 字节 → 人类可读 */
export function formatBytes(bytes: number, digits = 1): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let v = bytes / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(digits)} ${units[i]}`
}

/** 秒 → `1分23秒` */
export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} 秒`
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return s === 0 ? `${m} 分钟` : `${m} 分 ${s} 秒`
}

/** 秒 → `00:12`（视频角标用） */
export function formatClock(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** ISO 时间 → `3 分钟前` / `昨天 14:20` */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const min = Math.floor(diff / 60_000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小时前`
  const day = Math.floor(hr / 24)
  if (day === 1) return '昨天'
  if (day < 30) return `${day} 天前`
  return new Date(iso).toLocaleDateString('zh-CN')
}

/** ISO 时间 → `10-07 14:20` */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 提示词里的换行与超长在卡片上要截断 */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`
}

/** 生成一个稳定的伪随机数（同一 seed 永远得到同一结果，避免每次渲染闪色） */
export function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}
