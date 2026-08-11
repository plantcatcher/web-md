import init, {
  formatFromBytes,
  formatFromPath,
  toMarkdownBytes,
} from './pkg/anydoc_wasm.js';

const $ = (id) => document.getElementById(id);

const els = {
  drop: $('drop'),
  dropTitle: $('drop-title'),
  dropHint: $('drop-hint'),
  file: $('file'),
  sampleRtf: $('sample-rtf'),
  sampleCsv: $('sample-csv'),
  result: $('result'),
  name: $('result-name'),
  format: $('result-format'),
  stats: $('result-stats'),
  tabPreview: $('tab-preview'),
  tabRaw: $('tab-raw'),
  copy: $('copy'),
  download: $('download'),
  preview: $('preview'),
  raw: $('raw').querySelector('code'),
  error: $('error'),
};

let markdown = '';
let baseName = 'document';

/* ---------- Markdown 渲染（带安全净化） ---------- */
if (window.marked) {
  window.marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
}

const FORBIDDEN = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'FORM']);
function sanitize(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walk = (node) => {
    [...node.children].forEach((child) => {
      if (FORBIDDEN.has(child.tagName)) {
        child.remove();
        return;
      }
      [...child.attributes].forEach((attr) => {
        const n = attr.name.toLowerCase();
        if (n.startsWith('on')) child.removeAttribute(attr.name);
        else if ((n === 'href' || n === 'src') && /^\s*javascript:/i.test(attr.value)) {
          child.removeAttribute(attr.name);
        }
      });
      walk(child);
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

function renderPreview(text) {
  if (!window.marked) {
    els.preview.textContent = text;
    return;
  }
  els.preview.innerHTML = sanitize(window.marked.parse(text));
}

/* ---------- 结果展示 ---------- */
function showMarkdown(name, format, text, ms) {
  markdown = text;
  baseName = name.replace(/\.[^.]*$/, '') || 'document';
  const chars = text.length.toLocaleString('en-US');

  els.result.hidden = false;
  els.name.textContent = name;
  els.format.textContent = format || 'auto';
  els.stats.textContent = `${chars} 字符 · ${ms} ms`;
  els.error.hidden = true;
  els.preview.hidden = false;
  els.raw.parentElement.hidden = true;

  renderPreview(text);
  els.raw.textContent = text;

  setTab('preview');
  els.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(name, message) {
  els.result.hidden = false;
  els.name.textContent = name;
  els.format.textContent = '失败';
  els.stats.textContent = '';
  els.preview.hidden = true;
  els.raw.parentElement.hidden = true;
  els.error.hidden = false;
  els.error.textContent = `无法转换此文件：${message}`;
  els.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const ERROR_TEXT = {
  unsupported: '不支持的格式，或无法转换的文件（例如纯图片扫描版 PDF）',
  malformed: '文件结构损坏，无法提取有效内容',
  encrypted: '文件已加密或需要密码',
  resourceLimit: '超出安全限制（解压、嵌套或节点数量）',
  missingPart: '缺少转换所需的必要部分',
};
function errorDetail(code, raw) {
  return (code && ERROR_TEXT[code]) || raw || '未知错误';
}

/* ---------- 转换核心 ---------- */
function convert(name, bytes) {
  const format = formatFromBytes(bytes) ?? formatFromPath(name);
  try {
    const started = performance.now();
    markdown = toMarkdownBytes(bytes, format ?? null);
    const ms = Math.max(1, Math.round(performance.now() - started));
    showMarkdown(name, format, markdown, ms);
  } catch (err) {
    showError(name, errorDetail(err?.code, err?.message ?? String(err)));
  }
}

async function convertFile(file) {
  convert(file.name, new Uint8Array(await file.arrayBuffer()));
}

/* ---------- 标签页切换 ---------- */
function setTab(which) {
  const isPreview = which === 'preview';
  els.tabPreview.classList.toggle('active', isPreview);
  els.tabRaw.classList.toggle('active', !isPreview);
  els.preview.hidden = !isPreview;
  els.raw.parentElement.hidden = isPreview;
}
els.tabPreview.addEventListener('click', () => setTab('preview'));
els.tabRaw.addEventListener('click', () => setTab('raw'));

/* ---------- 复制 / 下载 ---------- */
els.copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(markdown);
    els.copy.textContent = '已复制';
  } catch {
    els.copy.textContent = '复制失败';
  }
  setTimeout(() => (els.copy.textContent = '复制'), 1200);
});

els.download.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${baseName}.md` });
  a.click();
  URL.revokeObjectURL(url);
});

/* ---------- 拖拽 / 选择 ---------- */
els.drop.addEventListener('click', () => els.file.click());
els.file.addEventListener('change', () => {
  if (els.file.files[0]) convertFile(els.file.files[0]);
});

['dragover', 'drop'].forEach((ev) =>
  window.addEventListener(ev, (e) => e.preventDefault()),
);
els.drop.addEventListener('dragover', () => els.drop.classList.add('over'));
els.drop.addEventListener('dragleave', () => els.drop.classList.remove('over'));
els.drop.addEventListener('drop', (e) => {
  els.drop.classList.remove('over');
  const f = e.dataTransfer?.files?.[0];
  if (f) convertFile(f);
});

/* ---------- 示例 ---------- */
const SAMPLE_RTF = String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Times New Roman;}}
\pard\sa200 Everything to Markdown 会读取文档的 {\b 格式}、{\i 强调}与{\b\i 结构}，再写出表达同样意思的 Markdown。\par
\pard\sa200 这一段来自本页现场拼出的一个小 RTF 文件。拖入你自己的文档试试真实转换。\par
}`;
const SAMPLE_CSV =
  'format,kind,since\ndocx,WordprocessingML,0.1.0\nepub,EPUB 2 and 3,0.1.0\nxlsx,Excel workbook,0.1.0\npdf,via pdf-inspector,0.1.0\n';

els.sampleRtf.addEventListener('click', () =>
  convert('notes.rtf', new TextEncoder().encode(SAMPLE_RTF)),
);
els.sampleCsv.addEventListener('click', () =>
  convert('report.csv', new TextEncoder().encode(SAMPLE_CSV)),
);

/* ---------- 启动：加载 WASM ---------- */
(async () => {
  try {
    await init();
    els.dropTitle.textContent = '把文档拖到这里';
    els.dropHint.innerHTML = '或 <u>点击浏览</u>。转换在你本机完成，文件不会上传。';
  } catch (err) {
    els.dropTitle.textContent = '转换器加载失败';
    els.dropHint.textContent = String(err?.message ?? err);
    els.drop.disabled = true;
  }
})();
