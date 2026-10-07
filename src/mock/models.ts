import type { GenerateType, ModelDetail, ModelSpec, Vendor } from '@/api/types'

/**
 * 厂商与其品牌标记。
 *
 * 真实项目里 logo 走后端下发（`vendor.logo_url`），这里没有官方素材，
 * 所以前端用「双色渐变 + 首字母缩写」的程序化标记代替，视觉上统一且不会侵权。
 */
export interface VendorBrand extends Vendor {
  mark: string
  from: string
  to: string
}

export const VENDORS: VendorBrand[] = [
  { slug: 'kling', name: '快手可灵', mark: 'KL', from: '#FF5C8A', to: '#7C5CFF' },
  { slug: 'jimeng', name: '字节即梦', mark: 'JM', from: '#22D3EE', to: '#3B82F6' },
  { slug: 'seedance', name: '字节 Seedance', mark: 'SD', from: '#38BDF8', to: '#818CF8' },
  { slug: 'sora', name: 'OpenAI', mark: 'SO', from: '#10B981', to: '#22D3EE' },
  { slug: 'veo', name: 'Google Veo', mark: 'VE', from: '#4285F4', to: '#A78BFA' },
  { slug: 'hailuo', name: 'MiniMax 海螺', mark: 'HL', from: '#F97316', to: '#EF4444' },
  { slug: 'vidu', name: '生数 Vidu', mark: 'VD', from: '#A855F7', to: '#EC4899' },
  { slug: 'runway', name: 'Runway', mark: 'RW', from: '#22C55E', to: '#84CC16' },
  { slug: 'pika', name: 'Pika', mark: 'PK', from: '#F472B6', to: '#FBBF24' },
  { slug: 'luma', name: 'Luma AI', mark: 'LM', from: '#60A5FA', to: '#22D3EE' },
  { slug: 'wanx', name: '阿里通义万相', mark: 'WX', from: '#FB7185', to: '#8B5CF6' },
  { slug: 'hunyuan', name: '腾讯混元', mark: 'HY', from: '#3B82F6', to: '#06B6D4' },
]

export const vendorBySlug = (slug: string): VendorBrand =>
  VENDORS.find((v) => v.slug === slug) ?? VENDORS[0]!

/**
 * 计价规则：真实项目由后端 `/models/{slug}/quote` 给权威价格，
 * 这里在前端复刻同一套公式，用来做「毫秒级预估」。
 * 提交前仍应调 quote 校验（见前端文档 §7.3）。
 */
export interface PricingRules {
  per_second: number
  resolution: Record<string, number>
  audio: number
  aspect: Record<string, number>
  min_credits: number
}

/** MockVideoPoster 的「场景原型」——决定程序化预览图长什么样 */
export type PosterScene =
  | 'aurora'
  | 'dunes'
  | 'ocean'
  | 'city'
  | 'cosmos'
  | 'forest'
  | 'neon'
  | 'studio'

export interface MockModel extends ModelDetail {
  /** 前端演示专用：本地计价规则 */
  rules: PricingRules
  /** 前端演示专用：预览图场景 */
  scene: PosterScene
  seed: number
  /** 推荐位排序用的一句话卖点 */
  bestFor: string
}

const spec = (p: Partial<ModelSpec> = {}): ModelSpec => ({
  durations: [5, 10],
  resolutions: ['720p', '1080p'],
  aspect_ratios: ['16:9', '9:16', '1:1'],
  supports_audio: false,
  supports_first_frame: true,
  supports_last_frame: false,
  max_prompt_length: 2000,
  ...p,
})

const rules = (p: Partial<PricingRules> = {}): PricingRules => ({
  per_second: 8,
  resolution: { '720p': 1, '1080p': 1.5 },
  audio: 1.35,
  aspect: { '16:9': 1, '9:16': 1, '1:1': 0.9 },
  min_credits: 30,
  ...p,
})

const CONTENT_NOTE = '能力、参数与价格为演示用占位数据，上线前必须按实际签约渠道核对。'

export const MODELS: MockModel[] = [
  {
    id: 'm_01',
    slug: 'kling-v3',
    name: '可灵 3.0',
    vendor: vendorBySlug('kling'),
    tagline: '长镜头叙事与运动控制最强',
    bestFor: '人物动作 · 长镜头',
    types: ['t2v', 'i2v', 'v2v'],
    tags: ['最长 2 分钟', '支持音频', '4K'],
    spec: spec({
      durations: [5, 10, 15, 30],
      resolutions: ['720p', '1080p', '4K'],
      supports_audio: true,
      supports_last_frame: true,
      max_prompt_length: 2500,
    }),
    pricing: { unit: 'per_second', from_credits: 12, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: true,
    sort_weight: 100,
    rules: rules({
      per_second: 12,
      resolution: { '720p': 1, '1080p': 1.5, '4K': 2.6 },
      min_credits: 60,
    }),
    scene: 'aurora',
    seed: 11,
    description:
      '可灵系列在**人物肢体连贯性**和**镜头运动**上长期领先，3.0 把单条时长上限推到 2 分钟，并原生支持音效生成。\n\n适合需要「一条讲完一个情节」的短视频、产品演示片与分镜预演。',
    examples: [
      { prompt: '一只柯基在草地上奔跑，阳光明媚，电影质感，浅景深', video_url: '', poster_url: '', params: { duration: 5, resolution: '1080p' } },
      { prompt: '雨夜霓虹街头，主角撑伞缓步走向镜头，慢推轨', video_url: '', poster_url: '', params: { duration: 10, resolution: '1080p' } },
      { prompt: '微观镜头下的机械齿轮缓慢啮合，金属高光', video_url: '', poster_url: '', params: { duration: 5, resolution: '4K' } },
    ],
    price_table: [
      { resolution: '720p', duration: 5, audio: false, credits: 60 },
      { resolution: '1080p', duration: 10, audio: false, credits: 180 },
      { resolution: '1080p', duration: 10, audio: true, credits: 243 },
      { resolution: '4K', duration: 15, audio: true, credits: 632 },
    ],
    limitations: ['复杂文字渲染仍不稳定', '4K 不开放 30 秒档位', CONTENT_NOTE],
  },
  {
    id: 'm_02',
    slug: 'kling-v2.5',
    name: '可灵 2.5',
    vendor: vendorBySlug('kling'),
    tagline: '性价比最高的成熟版本',
    bestFor: '通用出片',
    types: ['t2v', 'i2v'],
    tags: ['最长 30 秒', '支持音频'],
    spec: spec({ durations: [5, 10, 15, 30], supports_audio: true, max_prompt_length: 2500 }),
    pricing: { unit: 'per_second', from_credits: 8, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: false,
    sort_weight: 92,
    rules: rules({ per_second: 8, min_credits: 40 }),
    scene: 'neon',
    seed: 23,
    description: '3.0 的上一代，画质差距在 10% 以内，单价低约三分之一。预算敏感时的默认选择。',
    examples: [
      { prompt: '赛博朋克城市夜景，镜头快速穿越霓虹招牌', video_url: '', poster_url: '', params: { duration: 5, resolution: '1080p' } },
      { prompt: '咖啡液体倒入玻璃杯的慢动作特写', video_url: '', poster_url: '', params: { duration: 5, resolution: '720p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 5, audio: false, credits: 40 },
      { resolution: '1080p', duration: 10, audio: true, credits: 162 },
    ],
    limitations: ['不支持 4K', CONTENT_NOTE],
  },
  {
    id: 'm_03',
    slug: 'jimeng-v3',
    name: '即梦 3.0',
    vendor: vendorBySlug('jimeng'),
    tagline: '中文提示词理解最好，画面干净',
    bestFor: '中文语义 · 静物',
    types: ['t2v', 'i2v'],
    tags: ['最长 20 秒', '中文优化', '9:16 竖屏'],
    spec: spec({
      durations: [5, 10, 20],
      resolutions: ['720p', '1080p'],
      supports_first_frame: true,
      supports_last_frame: true,
      max_prompt_length: 3000,
    }),
    pricing: { unit: 'per_second', from_credits: 6, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: true,
    sort_weight: 96,
    rules: rules({ per_second: 6, min_credits: 30 }),
    scene: 'studio',
    seed: 37,
    description:
      '对中文长句的理解是几家里面最好的，不需要把提示词硬翻成英文。竖屏内容（电商、口播、种草）出片率明显更高。',
    examples: [
      { prompt: '一个玻璃香水瓶放在米色亚麻布上，晨光斜射，慢速推近', video_url: '', poster_url: '', params: { duration: 5, resolution: '1080p' } },
      { prompt: '国风水墨山水徐徐展开，墨色晕染', video_url: '', poster_url: '', params: { duration: 10, resolution: '1080p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 5, audio: false, credits: 30 },
      { resolution: '1080p', duration: 10, audio: false, credits: 90 },
    ],
    limitations: ['不支持音频轨', CONTENT_NOTE],
  },
  {
    id: 'm_04',
    slug: 'seedance-pro',
    name: 'Seedance Pro',
    vendor: vendorBySlug('seedance'),
    tagline: '多镜头叙事与一致性表现突出',
    bestFor: '多镜头 · 分镜',
    types: ['t2v', 'i2v'],
    tags: ['最长 12 秒', '多镜头', '支持音频'],
    spec: spec({ durations: [4, 8, 12], supports_audio: true, max_prompt_length: 2000 }),
    pricing: { unit: 'per_second', from_credits: 7, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: true,
    sort_weight: 94,
    rules: rules({ per_second: 7, min_credits: 30 }),
    scene: 'city',
    seed: 41,
    description: '单条内可以完成「近景交代 → 全景展开」的镜头切换，并且同一角色跨镜头不跑形。',
    examples: [
      { prompt: '先特写女主角的眼睛，再拉远到整个天台城市全景', video_url: '', poster_url: '', params: { duration: 8, resolution: '1080p' } },
      { prompt: '产品从包装盒中升起，环绕运镜一周', video_url: '', poster_url: '', params: { duration: 4, resolution: '1080p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 4, audio: false, credits: 28 },
      { resolution: '1080p', duration: 12, audio: true, credits: 113 },
    ],
    limitations: ['单条最长 12 秒', CONTENT_NOTE],
  },
  {
    id: 'm_05',
    slug: 'sora-2',
    name: 'Sora 2',
    vendor: vendorBySlug('sora'),
    tagline: '物理拟真与复杂场景调度天花板',
    bestFor: '写实 · 物理模拟',
    types: ['t2v', 'i2v'],
    tags: ['最长 20 秒', '支持音频', '物理拟真'],
    spec: spec({ durations: [5, 10, 20], supports_audio: true, supports_last_frame: true, max_prompt_length: 4000 }),
    pricing: { unit: 'per_second', from_credits: 18, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: true,
    sort_weight: 98,
    rules: rules({ per_second: 18, resolution: { '720p': 1, '1080p': 1.8 }, min_credits: 90 }),
    scene: 'ocean',
    seed: 53,
    description:
      '物体碰撞、液体流动、布料形变的合理程度明显高于其他模型。代价是单价最贵，且高峰期排队较久。\n\n适合需要「看起来像实拍」的品牌片与广告镜头。',
    examples: [
      { prompt: '海浪拍打礁石，水花在逆光中飞散，高速摄影', video_url: '', poster_url: '', params: { duration: 10, resolution: '1080p' } },
      { prompt: '一块丝绸从空中落下覆盖在金属桌面上', video_url: '', poster_url: '', params: { duration: 5, resolution: '1080p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 5, audio: false, credits: 90 },
      { resolution: '1080p', duration: 10, audio: true, credits: 437 },
      { resolution: '1080p', duration: 20, audio: true, credits: 875 },
    ],
    limitations: ['价格最高', '高峰期排队 3–10 分钟', CONTENT_NOTE],
  },
  {
    id: 'm_06',
    slug: 'veo-3.1',
    name: 'Veo 3.1',
    vendor: vendorBySlug('veo'),
    tagline: '原生同步音频，台词口型对得上',
    bestFor: '口播 · 带台词',
    types: ['t2v', 'i2v'],
    tags: ['最长 8 秒', '原生音频', '口型同步'],
    spec: spec({ durations: [4, 6, 8], supports_audio: true, supports_first_frame: true, supports_last_frame: true, max_prompt_length: 3000 }),
    pricing: { unit: 'per_second', from_credits: 16, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: false,
    sort_weight: 90,
    rules: rules({ per_second: 16, resolution: { '720p': 1, '1080p': 1.6 }, audio: 1.5, min_credits: 80 }),
    scene: 'forest',
    seed: 67,
    description: '音画是一次生成的，不是后期贴上去的——所以口型、环境声、对白节奏天然同步。缺点是单条只有 8 秒。',
    examples: [
      { prompt: '一位老人对着镜头说“欢迎回来”，背景是下雨的窗', video_url: '', poster_url: '', params: { duration: 8, resolution: '1080p' } },
      { prompt: '森林清晨鸟鸣，镜头缓缓上升穿过树冠', video_url: '', poster_url: '', params: { duration: 6, resolution: '1080p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 4, audio: false, credits: 64 },
      { resolution: '1080p', duration: 8, audio: true, credits: 307 },
    ],
    limitations: ['单条最长 8 秒', CONTENT_NOTE],
  },
  {
    id: 'm_07',
    slug: 'hailuo-02',
    name: '海螺 02',
    vendor: vendorBySlug('hailuo'),
    tagline: '运镜指令跟得最准，指令型创作首选',
    bestFor: '精确运镜',
    types: ['t2v', 'i2v'],
    tags: ['最长 10 秒', '运镜控制', '响应快'],
    spec: spec({ durations: [6, 10], supports_first_frame: true, max_prompt_length: 2000 }),
    pricing: { unit: 'per_second', from_credits: 7, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: false,
    sort_weight: 86,
    rules: rules({ per_second: 7, min_credits: 40 }),
    scene: 'dunes',
    seed: 71,
    description: '支持在提示词里直接写运镜术语（推、拉、摇、移、环绕、希区柯克变焦），执行到位率高。',
    examples: [
      { prompt: '沙漠日落，镜头环绕骆驼队一周后向上摇到天空', video_url: '', poster_url: '', params: { duration: 10, resolution: '1080p' } },
      { prompt: '希区柯克变焦：人物站在原地，背景急速压缩', video_url: '', poster_url: '', params: { duration: 6, resolution: '720p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 6, audio: false, credits: 42 },
      { resolution: '1080p', duration: 10, audio: false, credits: 105 },
    ],
    limitations: ['不支持音频', '最长 10 秒', CONTENT_NOTE],
  },
  {
    id: 'm_08',
    slug: 'vidu-q2',
    name: 'Vidu Q2',
    vendor: vendorBySlug('vidu'),
    tagline: '参考图一致性最好，适合系列内容',
    bestFor: '角色一致性',
    types: ['t2v', 'i2v', 'v2v'],
    tags: ['最长 8 秒', '角色一致', '视频改风格'],
    spec: spec({ durations: [4, 8], supports_first_frame: true, supports_last_frame: true, max_prompt_length: 2000 }),
    pricing: { unit: 'per_second', from_credits: 6, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: false,
    sort_weight: 82,
    rules: rules({ per_second: 6, min_credits: 24 }),
    scene: 'studio',
    seed: 83,
    description: '给定一张人物参考图，连续生成多条时的角色稳定性优于同价位模型。是做系列短剧的省钱方案。',
    examples: [
      { prompt: '参考图中的人物在便利店拿起一罐饮料，微笑着看向镜头', video_url: '', poster_url: '', params: { duration: 8, resolution: '1080p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 4, audio: false, credits: 24 },
      { resolution: '1080p', duration: 8, audio: false, credits: 72 },
    ],
    limitations: ['不支持音频', CONTENT_NOTE],
  },
  {
    id: 'm_09',
    slug: 'runway-gen4',
    name: 'Runway Gen-4',
    vendor: vendorBySlug('runway'),
    tagline: '风格迁移与视觉特效最丰富',
    bestFor: '风格化 · 特效',
    types: ['t2v', 'i2v', 'v2v'],
    tags: ['最长 10 秒', '风格预设', '笔刷编辑'],
    spec: spec({ durations: [5, 10], resolutions: ['720p', '1080p'], supports_last_frame: true, max_prompt_length: 2000 }),
    pricing: { unit: 'per_second', from_credits: 13, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: false,
    sort_weight: 80,
    rules: rules({ per_second: 13, min_credits: 65 }),
    scene: 'cosmos',
    seed: 97,
    description: '内置大量风格预设（黏土、水彩、赛博、胶片），且支持对局部区域做笔刷式重绘。',
    examples: [
      { prompt: '把这段实拍街道变成黏土动画风格', video_url: '', poster_url: '', params: { duration: 5, resolution: '1080p' } },
      { prompt: '星云在深空中缓慢坍缩，紫色与青色交织', video_url: '', poster_url: '', params: { duration: 10, resolution: '1080p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 5, audio: false, credits: 65 },
      { resolution: '1080p', duration: 10, audio: false, credits: 195 },
    ],
    limitations: ['不支持音频', CONTENT_NOTE],
  },
  {
    id: 'm_10',
    slug: 'pika-2.5',
    name: 'Pika 2.5',
    vendor: vendorBySlug('pika'),
    tagline: '单价最低，适合大量试错',
    bestFor: '批量试稿',
    types: ['t2v', 'i2v'],
    tags: ['最长 10 秒', '价格最低', '出片快'],
    spec: spec({ durations: [3, 5, 10], resolutions: ['480p', '720p'], supports_first_frame: true, max_prompt_length: 1200 }),
    pricing: { unit: 'per_second', from_credits: 5, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: false,
    sort_weight: 74,
    rules: rules({ per_second: 5, resolution: { '480p': 0.6, '720p': 1 }, min_credits: 15 }),
    scene: 'neon',
    seed: 101,
    description: '分辨率不高，但便宜且快。适合在正式生成前先跑十几个提示词看哪个方向对。',
    examples: [
      { prompt: '霓虹灯管组成的“OPEN”招牌闪烁', video_url: '', poster_url: '', params: { duration: 3, resolution: '720p' } },
    ],
    price_table: [
      { resolution: '480p', duration: 3, audio: false, credits: 9 },
      { resolution: '720p', duration: 10, audio: false, credits: 50 },
    ],
    limitations: ['最高 720p', '细节层次较弱', CONTENT_NOTE],
  },
  {
    id: 'm_11',
    slug: 'luma-ray3',
    name: 'Luma Ray 3',
    vendor: vendorBySlug('luma'),
    tagline: '镜头语言自然，像手持摄影机',
    bestFor: '纪实感 · 生活流',
    types: ['t2v', 'i2v'],
    tags: ['最长 9 秒', '自然运镜', 'HDR'],
    spec: spec({ durations: [5, 9], resolutions: ['720p', '1080p'], supports_last_frame: true, max_prompt_length: 2000 }),
    pricing: { unit: 'per_second', from_credits: 10, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: false,
    sort_weight: 78,
    rules: rules({ per_second: 10, min_credits: 50 }),
    scene: 'dunes',
    seed: 113,
    description: '默认带轻微的呼吸感与手持抖动，不做「完美稳定」的运镜，因此更接近真实拍摄的观感。',
    examples: [
      { prompt: '集市里人群穿行，镜头跟随一个提菜篮的人', video_url: '', poster_url: '', params: { duration: 9, resolution: '1080p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 5, audio: false, credits: 50 },
      { resolution: '1080p', duration: 9, audio: false, credits: 135 },
    ],
    limitations: ['不支持音频', CONTENT_NOTE],
  },
  {
    id: 'm_12',
    slug: 'wanx-2.5',
    name: '通义万相 2.5',
    vendor: vendorBySlug('wanx'),
    tagline: '国内直连延迟最低',
    bestFor: '批量生产',
    types: ['t2v', 'i2v'],
    tags: ['最长 5 秒', '国内节点', '延迟低'],
    spec: spec({ durations: [5], resolutions: ['720p', '1080p'], aspect_ratios: ['16:9', '9:16'], supports_first_frame: true, max_prompt_length: 1500 }),
    pricing: { unit: 'per_second', from_credits: 5, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'available',
    recommended: false,
    sort_weight: 70,
    rules: rules({ per_second: 5, min_credits: 25 }),
    scene: 'forest',
    seed: 127,
    description: '服务节点在国内，首字节延迟明显低于海外厂商，适合对响应速度敏感的场景。',
    examples: [
      { prompt: '春日樱花树下花瓣飘落，阳光透过枝叶', video_url: '', poster_url: '', params: { duration: 5, resolution: '1080p' } },
    ],
    price_table: [
      { resolution: '720p', duration: 5, audio: false, credits: 25 },
      { resolution: '1080p', duration: 5, audio: false, credits: 38 },
    ],
    limitations: ['仅 5 秒档位', '不支持 1:1 画幅', CONTENT_NOTE],
  },
  {
    id: 'm_13',
    slug: 'hunyuan-video',
    name: '混元视频',
    vendor: vendorBySlug('hunyuan'),
    tagline: '渠道扩容中，暂不可用',
    bestFor: '—',
    types: ['t2v'],
    tags: ['维护中'],
    spec: spec({ durations: [5], resolutions: ['720p'], aspect_ratios: ['16:9'] }),
    pricing: { unit: 'per_second', from_credits: 6, currency_note: '1 元 = 100 积分' },
    preview: { video_url: '', poster_url: '' },
    status: 'maintenance',
    recommended: false,
    sort_weight: 40,
    rules: rules({ per_second: 6 }),
    scene: 'city',
    seed: 131,
    description: '该渠道正在扩容，暂时无法提交新任务。已在跑的任务不受影响。',
    examples: [],
    price_table: [],
    limitations: ['当前维护中', CONTENT_NOTE],
  },
]

export const modelBySlug = (slug: string): MockModel | undefined =>
  MODELS.find((m) => m.slug === slug)

export const TYPE_LABEL: Record<GenerateType, string> = {
  t2v: '文生视频',
  i2v: '图生视频',
  v2v: '视频生视频',
}
