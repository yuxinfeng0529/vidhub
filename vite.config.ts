import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/**
 * GitHub Pages 的 SPA 回退。
 *
 * Pages 是纯静态托管，不支持 nginx 那种 `try_files ... /index.html`。
 * 直接访问 /vidhub/studio 时它找不到文件，会返回仓库根目录的 404.html。
 *
 * 因为 base 是绝对路径 '/vidhub/'，index.html 里所有资源引用都带上了这个前缀，
 * 所以把 index.html 原样复制成 404.html 就够了：SPA 外壳照样加载，
 * Vue Router 从 window.location.pathname 读到 '/vidhub/studio'，
 * 去掉 base 后正确匹配到 /studio 路由。
 *
 * 不需要网上常见的那套 15 行 JS 重定向（把路径塞进 query 再还原）。
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    writeBundle(options) {
      const dir = options.dir ?? 'dist'
      copyFileSync(`${dir}/index.html`, `${dir}/404.html`)
    },
  }
}

export default defineConfig(({ command }) => ({
  // 开发时挂在根路径（http://127.0.0.1:5173/），
  // 构建时挂到 Pages 的项目子路径（https://yuxinfeng0529.github.io/vidhub/）
  base: command === 'build' ? '/vidhub/' : '/',
  plugins: [vue(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // 默认目录名是 'assets'，会和应用的 /assets 路由（资产库）撞名：
    // Pages 会先把 /vidhub/assets 301 到 /vidhub/assets/，多一次跳转、URL 被迫带上尾斜杠。
    // 换成 static 彻底避开。
    assetsDir: 'static',
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
}))
