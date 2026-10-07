# vidhub-web · 前端演示版

VidHub 的**纯前端**实现：没有后端，没有数据库，所有数据来自 `src/mock/`，任务进度由本地定时器模拟。

目的只有一个：**先把界面做出来看效果**。等设计定下来，再把 `src/api/index.ts` 里的函数体换成真实的 `axios` 请求即可，页面代码一行不用改。

---

## 跑起来

```bash
npm install       # 已装过可跳过
npm run dev       # → http://127.0.0.1:5173
```

其他命令：

```bash
npm run build        # 类型检查 + 生产构建 → dist/
npm run type-check   # 只跑 vue-tsc
npm run preview      # 预览 dist 产物
```

要求 Node 20.19+ 或 22.12+（Vite 8 的要求），本机 Node 24 没问题。

---

## 部署

已配好 GitHub Pages 自动部署，推 `main` 就会触发。

**线上地址**：<https://yuxinfeng0529.github.io/vidhub/>

首次需要在仓库里手动开一次：**Settings → Pages → Source 选 `GitHub Actions`**。之后每次 `git push` 由 `.github/workflows/deploy.yml` 自动构建发布，不用再管。

### 三个坑，都已经处理

**1. 子路径。** Pages 的项目站点挂在 `https://<用户>.github.io/<仓库名>/`，不是域名根。所以 `vite.config.ts` 里按命令区分：

```ts
base: command === 'build' ? '/vidhub/' : '/'
```

构建走 `/vidhub/`，本地开发仍然是 `http://127.0.0.1:5173/`。**以后改仓库名，这里的 `'/vidhub/'` 要跟着改。**

**2. 刷新 404。** Pages 是纯静态托管，没有 nginx 的 `try_files`，直接访问或刷新 `/vidhub/studio` 会 404。解决办法是构建时把 `index.html` 复制一份成 `404.html`（`vite.config.ts` 里的 `spaFallback()` 插件，在 `writeBundle` 阶段执行）。

因为 `base` 是绝对路径，复制出来的外壳照样能加载，Vue Router 从 `pathname` 里解析出正确路由。**不需要**网上常见的那套「把路径塞进 query 再还原」的十几行 JS 重定向。

> 深链接会返回 HTTP 404 状态码（内容正常，页面正常打开）——这是 Pages 的固有行为，只影响 SEO，不影响使用。

**3. 产物目录与路由撞名。** Vite 默认把构建产物输出到 `dist/assets/`，而应用里正好有个 `/assets` 路由（资产库）。Pages 发现真的存在 `assets` 这个目录，就会把 `/vidhub/assets` 301 到 `/vidhub/assets/`，多一次跳转、URL 被迫带上尾斜杠。

所以 `vite.config.ts` 里把 `build.assetsDir` 改成了 `'static'`。**应用里新增顶级路由时，记得别跟它撞名。**

### 部署到别的地方要改什么

| 目标 | 改动 |
|---|---|
| 自己的服务器 / Nginx | `base` 改回 `'/'`，配 `try_files $uri $uri/ /index.html;` |
| Vercel / Netlify | `base` 改回 `'/'`，加一条到 `/index.html` 的 SPA rewrite |

---

## 技术栈

| | 选型 | 与 `docs/02-前端设计文档.md` 的差异 |
|---|---|---|
| 框架 | Vue 3.5 + TypeScript + Vite 8 | 一致 |
| 路由 | Vue Router 4 | 一致 |
| 状态 | Pinia | 一致 |
| 样式 | **Tailwind CSS 4**（CSS-first 配置） | 设计令牌全部落进 `src/styles/main.css` 的 `@theme`，**没有** `tailwind.config.js` |
| 组件库 | **无**（全部手写） | 文档原定 Element Plus。演示版为了视觉统一先手写，重型组件（表格 / 弹窗 / 虚拟滚动）后续再引入 |

Tailwind v4 用 `@theme { --color-canvas: … }` 直接生成 `bg-canvas` / `text-ink-2` 这类语义工具类，所以文档 §6 那张令牌表是**逐字**落地的，组件里没有任何写死的十六进制色值。

---

## 目录

```
src/
├── api/
│   ├── types.ts          与 docs/04-API接口契约.md 一一对应的类型
│   └── index.ts          ★ 唯一需要改动的文件 ★ 现在返回 mock，将来换成 axios
├── mock/
│   ├── models.ts         13 个模型 / 12 家厂商，含本地计价规则与预览场景
│   ├── tasks.ts          10 条历史任务，覆盖全部 7 种状态
│   ├── assets.ts         成片由任务派生，加 10 条上传素材
│   └── data.ts           首页示例墙、能力亮点、套餐、FAQ
├── stores/
│   ├── auth.ts           登录态
│   ├── wallet.ts         余额 / 冻结 / 解冻（两段式扣费的本地模拟）
│   ├── tasks.ts          ★ 任务状态机 + 进度模拟（将来换成 SSE）
│   ├── assets.ts         资产列表、多选、配额
│   └── studio.ts         工作台草稿（debounce 500ms 写 sessionStorage）
├── components/
│   ├── base/             VIcon / VProgress / VModal / VEmpty
│   ├── business/         PostShowcase / ModelCard / TaskCard / AssetCard / VendorMark / StatusPill
│   ├── layout/           AppHeader / AppFooter / AuroraBackdrop
│   ├── home/             HomeHero / ShowcaseWall / FeatureGrid / VendorWall / StepsSection / PricingPreview / FaqSection
│   └── studio/           StudioModelPicker / StudioParams
├── pages/                Home / Models / ModelDetail / Studio / Assets / Pricing / NotFound
├── constants/            任务状态映射表、导航、画幅比例
└── utils/                format / pricing
```

---

## 三个需要你知道的「假」东西

**1. 预览图不是视频，是 CSS 画出来的。**

`src/components/business/PostShowcase.vue` 用七层 CSS（天空渐变 → 星点 → 光斑 → 远山剪影 → 近景剪影 → 斜向光扫 → 暗角 + 胶片颗粒）合成一张「会呼吸的图」，由 `scene`（8 种场景原型）+ `seed` 决定长相，同一个 seed 永远渲染同一张。

真实项目里这里应该是 `<video preload="none" poster>`，`poster_url` 由后端在生成完成后异步抽首帧——前端文档 §7.4 明确禁止前端 canvas 抽帧。**接后端时只换 PostShowcase 的内部实现，外部接口不用动。**

**2. 厂商标记不是真 logo。**

拿不到官方素材，用「品牌双色渐变 + 首字母缩写」代替。真实项目走 `vendor.logo_url`。

**3. 任务进度是本地定时器，不是 SSE。**

`stores/tasks.ts` 的 `startSimulation()` 按真实状态机把每个跃迁都走一遍：

```
created → queued(前方 N 个) → running(进度非线性推进) → succeeded | failed
```

约 12% 的概率会失败，用来演示「自动退款 + 一键重试」。接后端时把 `startSimulation()` 换成 `useTaskStream().connect([task.id])` 即可，队列渲染、钱包联动、资产归档都不用改。

---

## 已经落地的交互细节

这些是 `docs/01` / `docs/02` 里点名要求、容易在实现时偷懒跳过的：

- **参数联动计价**：任一参数变化立刻重算，计价条位置固定不跳动（`utils/pricing.ts`）
- **不支持的参数置灰而非提交后报错**：15s 档位在只支持 10s 的模型上是禁用 + 删除线 + tooltip 说明
- **切模型时参数自动收敛**：从可灵 3.0（支持 4K/音频）切到即梦 3.0（都不支持），分辨率自动降级、音频自动关闭
- **两段式扣费可见**：提交时冻结 → 成功结算 / 失败解冻，顶栏余额实时变化
- **余额不足的按钮文案会变**：变成「余额不足，去充值」并跳定价页
- **草稿保护**：刷新页面后提示「已恢复上次编辑的内容」，可一键丢弃
- **防重复提交**：提交中按钮进入 loading 且忽略后续点击
- **筛选与 URL 双向同步**：模型广场的 `?type=&vendor=&sort=` 可分享、可刷新、可后退
- **多选批量操作**：资产库多选后浮出操作条（批量下载打包 zip / 批量删除 / 取消）
- **失败态给的是人话 + 重试 + 退款提示**，不是错误码
- **响应式**：`sm/md/lg/xl` 四档断点，工作台在窄屏上下堆叠
- **`prefers-reduced-motion`**：系统开启减弱动效时，所有动画降到 0.01ms

---

## 接后端时要动的地方

1. 装 `axios`，按 `docs/02` §4.1 写 `client.ts`（拦截器 + 401 刷新排队）
2. 把 `src/api/index.ts` 里每个函数体从 `delay(mock)` 换成 `client.get(...)`
3. `stores/tasks.ts` 的 `startSimulation()` → `useTaskStream().connect(ids)`
4. `PostShowcase` → 真实的 `<video>` + `poster_url`
5. `VendorMark` → `<img :src="vendor.logo_url">`
6. 加 Element Plus（或继续手写，看需要多少重型组件）
7. 补 `docs/02` §8 那张「通用能力清单」：请求重试队列、usePolling、useCountdown、媒体预览、二次确认

---

## 已知的坑

- **数据是假的**：模型名、价格、成功率、备案号全是占位值，`docs/README.md` 里已经写明「必须按实际签约渠道与官方定价核对后再上线」。
- **没做登录页**：演示版默认已登录（这样工作台和资产库能直接看到内容），`docs/02` 里的 `/login`、`/register`、路由守卫都还没写。
- **没做充值页**：`/pricing` 有套餐卡片，但支付状态机（`docs/02` §7.5 那段二维码轮询）没实现。
- **管理后台没做**：那是独立的第二个构建入口，见 `docs/08`。
- **`docs/02` §3 提到的 `useModelStore`** 没建：模型目录目前由页面各自请求。数量少的时候没问题，模型多了要收拢。
