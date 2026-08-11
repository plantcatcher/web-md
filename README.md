# Everything to Markdown · 把任何资料变成 AI 读得懂的 Markdown

由 **星球小捕手** 打造，借鉴并参考了开源文档转换模型
[Firecrawl anydoc](https://github.com/firecrawl/anydoc)（Rust → WebAssembly，MIT 许可证）。
把各种资料——Word、PowerPoint、Excel、PDF、OpenDocument、RTF、EPUB、CSV 共 14 种格式——
一键转成 **AI 可直接读取的 Markdown 文件**，**全程在本地浏览器运行，文件不上传**。

> 核心定位：将各种资料转为 AI 可以读懂的 markdown 文件。

## 功能

- 拖拽或点击选择文档；提供 `.rtf` / `.csv` 示例一键试用
- 格式由文件内容自动识别（改名/扩展名错也不怕），CSV 这类无签名的按扩展名兜底
- 转换结果：文件名、识别到的格式、字符数、耗时
- 两种视图：**预览**（GFM 渲染，带 XSS 净化）/ **源码**（原始 Markdown）
- 一键**复制**到剪贴板、**下载**为 `.md`
- 错误友好提示（加密文件、不支持格式、结构损坏等分别给出中文原因）

## 运行（必须经由 HTTP，不能直接双击打开 html）

ES Module 与 WebAssembly 需要 HTTP 协议，用 `file://` 打开会被浏览器拦截。

任选一种静态服务器，在项目根目录执行：

```bash
# 方式一：Python（自带）
python -m http.server 8123

# 方式二：Node
npx serve .
```

然后浏览器打开 `http://localhost:8123`。

## 部署

纯静态站点，把整个目录原样上传到任意静态托管即可：GitHub Pages、Cloudflare Pages、
Netlify、Vercel、对象存储 + CDN 等。无需后端、无构建步骤。

## 目录结构

```
anydoc-web/
├── index.html            # 首页（中文 UI，Everything to Markdown）
├── blog.html             # 原理博客索引
├── blog/                 # 原理博客文章
│   ├── why-markdown.html
│   ├── unified-model.html
│   ├── format-detection.html
│   ├── local-offline.html
│   └── pdf-boundary.html
├── styles.css            # 样式（深色/浅色自适应，响应式）
├── app.js                # 转换逻辑 / 交互（ES Module）
├── privacy.html          # 隐私政策（AdSense / GDPR 合规）
├── terms.html            # 使用条款
├── cookie-consent.js     # Cookie 同意横幅 + 按需加载 AdSense
├── ads.txt              # Google AdSense 授权文件（需替换 pub-id）
├── robots.txt
├── assets/
│   └── favicon.svg
├── pkg/                  # 本地内置的 @firecrawl/anydoc-wasm（自包含、可离线）
│   ├── anydoc_wasm.js
│   ├── anydoc_wasm_bg.wasm
│   ├── anydoc_wasm.d.ts
│   └── LICENSE
└── vendor/
    └── marked.min.js     # Markdown 渲染器（本地内置）
```

## 原理博客

`blog.html` 与 `blog/` 下是一组原理文章，讲清楚 Everything to Markdown 背后的思路：

- 为什么 AI 需要 Markdown：资料形态与"可读"的含义
- 统一文档模型：14 种格式如何归一为一套 Markdown
- 不看扩展名：格式到底是怎么被识别出来的
- 为什么转换应该发生在你的浏览器里（本地/离线/隐私）
- PDF 的边界：文本型与扫描型，以及 OCR 之外的事

均为纯静态页面，复用同一套样式，随站点一起离线部署。

## 关于依赖

- `@firecrawl/anydoc-wasm@0.1.8`：从 npm 下载后内置在 `pkg/`，使整站离线可用。
  如需更新，重新从 `https://cdn.jsdelivr.net/npm/@firecrawl/anydoc-wasm` 拉取同名文件替换即可。
- `marked@12`：Markdown → HTML，内置在 `vendor/`。

## 版权与许可

- 网站与品牌 **Everything to Markdown** 由 **星球小捕手** 创建，借鉴参考开源模型 Firecrawl anydoc 构建。
- 底层 anydoc 为 MIT 许可证（见 `pkg/LICENSE`），本前端重写保留原始署名与许可。

## 合规与 Google AdSense 接入

本站已为接入 **Google AdSense** 做合规准备（隐私 / 同意 / 授权三位一体）：

| 文件 | 作用 |
| --- | --- |
| `privacy.html` | 隐私政策：文件本地处理不上传、Cookie 分类、AdSense 个性化广告与其退出方式（Google 广告设置 / aboutads.info）、儿童隐私、用户权利 |
| `terms.html` | 使用条款：服务描述、免责声明、知识产权（基于 Firecrawl anydoc）、责任限制、适用法律 |
| `cookie-consent.js` | 首次访问弹出同意横幅，**仅用户「接受全部」后才动态加载 Google Analytics 与 AdSense 脚本**；「仅必要」则不加载任何分析/广告/追踪；选择存 localStorage，页脚「Cookie 设置」可重新选择 |
| `ads.txt` | AdSense 授权文件，声明本站的广告销售方，防广告欺诈 |

### 接入前需替换的占位项

1. **Google Analytics 衡量 ID**
   - `cookie-consent.js` 第 16 行：`var GA_MEASUREMENT_ID = 'G-VJLJ6NM3G4';`
   - 替换为你自己的 GA4 衡量 ID（形如 `G-XXXXXXXXXX`）。分析脚本仅在用户「接受全部」后加载。
2. **发布商 ID（两处）**
   - `cookie-consent.js` 第 15 行：`var ADSENSE_PUB_ID = 'ca-pub-0000000000000000';`
   - 各页面广告位 `data-ad-client="ca-pub-0000000000000000"`（首页 `index.html`、博客列表 `blog.html`、`blog/` 下 5 篇文章）
3. **广告位 Slot ID**：各页面 `<ins class="adsbygoogle" data-ad-slot="0000000000">` 替换为 AdSense 后台生成的真实广告单元 ID。
4. **ads.txt**：把 `google.com, ca-pub-0000000000000000, DIRECT, f08c47fec0942fa0` 中的发布商 ID 换成你自己的（保留 `DIRECT` 与证书哈希，或按 AdSense 后台提示填写）。
5. **联系邮箱**：`privacy.html` 的 `privacy@everythingtomarkdown.com` 替换为你真实的隐私联系邮箱。
6. **部署校验**：上线后访问 `https://你的域名/ads.txt` 应能看到该文件（AdSense 会定期抓取核验）。

> 说明：发布商 ID 仍为占位值时，`cookie-consent.js` 不会加载任何广告脚本（即使点了「接受全部」），方便你先上线合规框架、拿到 AdSense 账号后再填真实 ID。
> 注意：Google AdSense 要求网站具备实质性内容且符合其政策；本站博客（`blog/`）即为合规内容支撑。
> 关于分析 Cookie 的合规：本站的 Google Analytics 与 AdSense 一样，**仅在用户「接受全部」后加载**，因此不会在未经同意的情况下设置跟踪 Cookie，与隐私政策一致。如希望即便拒绝也保留匿名建模数据，可改用 Google Consent Mode（在 `cookie-consent.js` 的 `loadAnalytics()` 中改为先 `gtag('consent','default',{analytics_storage:'denied'})` 再按同意更新）。
