import type { Plan } from '@/api/types'
import type { PosterScene } from './models'

/* ────────────────────────── 首页：示例视频墙 ──────────────────────────
   真实项目里这些来自后端 `/api/v1/site/home`，运营可随时替换。
   本地没有视频素材，因此用 PostShowcase 渲染「程序化预览」——
   由 seed + scene 决定的动态渐变场景，视觉上像一张会呼吸的海报。 */

export interface ShowcaseItem {
  id: string
  prompt: string
  modelName: string
  modelSlug: string
  duration: number
  scene: PosterScene
  seed: number
  /** 瀑布流里的相对高度，制造错落感 */
  span: 'tall' | 'normal' | 'short'
}

export const SHOWCASE: ShowcaseItem[] = [
  { id: 's1', prompt: '极光下的冰湖，缓慢推近，倒影完整', modelName: '可灵 3.0', modelSlug: 'kling-v3', duration: 10, scene: 'aurora', seed: 11, span: 'tall' },
  { id: 's2', prompt: '赛博朋克街角，霓虹招牌在雨水中融化', modelName: '可灵 2.5', modelSlug: 'kling-v2.5', duration: 5, scene: 'neon', seed: 29, span: 'short' },
  { id: 's3', prompt: '海浪拍打礁石，逆光水花飞散，高速摄影', modelName: 'Sora 2', modelSlug: 'sora-2', duration: 10, scene: 'ocean', seed: 53, span: 'normal' },
  { id: 's4', prompt: '玻璃香水瓶置于亚麻布上，晨光斜射', modelName: '即梦 3.0', modelSlug: 'jimeng-v3', duration: 5, scene: 'studio', seed: 37, span: 'normal' },
  { id: 's5', prompt: '星云在深空中缓慢坍缩，紫青交织', modelName: 'Runway Gen-4', modelSlug: 'runway-gen4', duration: 10, scene: 'cosmos', seed: 97, span: 'tall' },
  { id: 's6', prompt: '先特写眼睛，再拉远到整个天台城市全景', modelName: 'Seedance Pro', modelSlug: 'seedance-pro', duration: 8, scene: 'city', seed: 41, span: 'normal' },
  { id: 's7', prompt: '沙漠日落，镜头环绕骆驼队一周', modelName: '海螺 02', modelSlug: 'hailuo-02', duration: 10, scene: 'dunes', seed: 71, span: 'short' },
  { id: 's8', prompt: '森林清晨鸟鸣，缓缓上升穿过树冠', modelName: 'Veo 3.1', modelSlug: 'veo-3.1', duration: 6, scene: 'forest', seed: 67, span: 'normal' },
]

/* ────────────────────────── 首页：能力亮点 ────────────────────────── */

export interface Feature {
  icon: string
  title: string
  desc: string
  accent: string
}

export const FEATURES: Feature[] = [
  {
    icon: 'layers',
    title: '一家账号 · 全部模型',
    desc: '可灵、即梦、Sora、Veo、海螺、Vidu… 同一个工作台切换，不用在六个后台之间搬提示词。',
    accent: '#7C5CFF',
  },
  {
    icon: 'clock',
    title: '按秒计费 · 不浪费',
    desc: '只为你真正生成的秒数付费。参数一改，价格立刻重算，提交前就能看到要花多少。',
    accent: '#22D3EE',
  },
  {
    icon: 'archive',
    title: '生成即入资产库',
    desc: '每条成片自动归档，带提示词与参数。素材和成片放一起，找回三个月前的镜头只要一次搜索。',
    accent: '#22C55E',
  },
  {
    icon: 'braces',
    title: '一套 API 全搞定',
    desc: '界面里能做的事，API 里都能做。同一份余额，同一套任务状态，Webhook 推送到你的服务器。',
    accent: '#F59E0B',
  },
]

/* ────────────────────────── 首页：三步上手 ────────────────────────── */

export const STEPS = [
  {
    n: '01',
    title: '挑模型',
    desc: '模型广场按价格、时长、是否带音频筛选。每个模型都标着单价和它最擅长什么。',
  },
  {
    n: '02',
    title: '写提示词',
    desc: '输入你想要的画面。不确定怎么写就点「优化」——我们会把口语化的描述扩写成模型听得懂的指令。',
  },
  {
    n: '03',
    title: '出片',
    desc: '进度实时可见，完成自动存入资产库。同参数再来一条只要一次点击。',
  },
]

/* ────────────────────────── 首页：数据条 ────────────────────────── */

export const STATS = [
  { value: '13', suffix: '家', label: '已接入上游渠道' },
  { value: '99.2', suffix: '%', label: '近 30 天任务成功率' },
  { value: '1.8', suffix: 's', label: '平均首字节响应' },
  { value: '0.98', suffix: '元', label: '最低每秒成本' },
]

/* ────────────────────────── 定价套餐 ────────────────────────── */

export const PLANS: Plan[] = [
  {
    id: 'p_free',
    name: '免费体验',
    price_yuan: 0,
    credits: 200,
    bonus_credits: 0,
    tagline: '注册即送，够跑两条 5 秒短片',
    highlights: ['200 积分（约 2 条 5s / 720p）', '全部模型可用', '资产库 1 GB', '并发任务 1 个'],
  },
  {
    id: 'p_basic',
    name: '基础',
    price_yuan: 99,
    credits: 9900,
    bonus_credits: 600,
    tagline: '个人创作者的主力档位',
    highlights: ['9,900 + 600 赠送积分', '折合 ¥0.0094 / 积分', '资产库 50 GB', '并发任务 3 个', '积分有效期 365 天'],
    recommended: true,
    badge: '最多人选',
  },
  {
    id: 'p_pro',
    name: '专业',
    price_yuan: 499,
    credits: 51900,
    bonus_credits: 5000,
    tagline: '小团队与工作室',
    highlights: ['51,900 + 5,000 赠送积分', '折合 ¥0.0087 / 积分', '资产库 500 GB', '并发任务 10 个', '优先生成队列'],
    badge: '省 12%',
  },
  {
    id: 'p_enterprise',
    name: '企业',
    price_yuan: 0,
    credits: 0,
    bonus_credits: 0,
    tagline: '月消耗 10 万积分以上',
    highlights: ['阶梯价，量越大单价越低', '专属渠道与并发保障', 'SLA 与专线支持', '可开专票 · 对公转账'],
  },
]

/** 「1000 积分能做什么」的大白话对照 */
export const CREDIT_EXAMPLES = [
  { credits: 1000, text: '约 8 条 5 秒 720p 视频', detail: '以即梦 3.0 为例（6 积分/秒）' },
  { credits: 5000, text: '约 27 条 10 秒 1080p 视频', detail: '以可灵 2.5 为例（8 积分/秒）' },
  { credits: 20000, text: '约 36 条 10 秒 1080p 带音频', detail: '以可灵 3.0 为例（12 积分/秒）' },
  { credits: 50000, text: '约 95 条 10 秒 1080p 写实镜头', detail: '以 Sora 2 为例（18 积分/秒）' },
]

/* ────────────────────────── FAQ ────────────────────────── */

export interface FaqItem {
  q: string
  a: string
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: '和直接用各家官网有什么区别？',
    a: '三个区别：一是账号统一，不用在六个平台分别注册充值；二是模型可以横向对比，同一个提示词在可灵、即梦、Sora 上各跑一条，挑最好的那个；三是资产统一归档，成片和它的提示词、参数存在一起，还能通过 API 程序化调用。',
  },
  {
    q: '生成失败会扣钱吗？',
    a: '不会。提交时按最高可能消耗冻结积分，任务成功后按实际用量结算并解冻差额，失败或超时则全额退回。你在流水里能看到每一笔冻结与解冻。',
  },
  {
    q: '积分会过期吗？',
    a: '付费购买的积分有效期 365 天，过期前 30 天和 7 天会各提醒一次。赠送的积分有效期 90 天。两项都写在账单页的流水里，随时可查。',
  },
  {
    q: '生成的内容可以商用吗？',
    a: '可以，你对自己生成的内容拥有完整的使用权。但请注意上游厂商各自的条款差异，以及生成内容的合规审查要求——平台会做一层内容安全过滤，最终责任仍在使用方。',
  },
  {
    q: '支持开发票吗？',
    a: '支持。个人可开电子普票，企业档位可开增值税专用发票、支持对公转账。在账单页提交开票信息即可。',
  },
  {
    q: '一条视频大概要等多久？',
    a: '取决于模型和当前队列。5 秒 720p 通常在 40 秒到 2 分钟之间出片；4K 或 Sora 2 这类重模型高峰期可能要 5 到 10 分钟。等待期间进度实时可见，可以关掉页面，完成后会通知你。',
  },
  {
    q: '可以只用 API 不用网页吗？',
    a: '可以。注册后在个人中心申请 API Key，接口契约完全公开，支持 Webhook 回调。你在网页上能做的所有事，API 都能做，共享同一份余额。',
  },
  {
    q: '你们自己训练模型吗？',
    a: '不。我们只做调度和封装——把上游厂商的能力统一成一套接口。所以我们的定位是「你少注册六个账号」，而不是「我们比可灵更懂视频」。',
  },
]
