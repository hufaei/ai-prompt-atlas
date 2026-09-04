const fs = require("node:fs");
const path = require("node:path");
let sharp = null;
try {
  sharp = require("sharp");
} catch {
  // SVG sources remain reproducible on a dependency-free checkout. The PNG
  // export is skipped until sharp is available.
}

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "docs/assets/mindmaps");
const sourceDir = path.join(outputDir, "source");
const thumbnailDir = path.join(outputDir, "thumbs");
const webpDir = path.join(outputDir, "webp");
const background = path.join(sourceDir, "atlas-background.png");

const palettes = [
  { fill: "#eaf2ff", stroke: "#7399d1", ink: "#244a7c" },
  { fill: "#e9f6f1", stroke: "#6fa991", ink: "#28624f" },
  { fill: "#fff3df", stroke: "#d7a557", ink: "#7c5420" },
  { fill: "#f1edff", stroke: "#9b84cf", ink: "#554084" },
  { fill: "#fff0ec", stroke: "#d98772", ink: "#7f4132" },
  { fill: "#eaf6f8", stroke: "#65a7b2", ink: "#25636c" },
];

const maps = [
  {
    slug: "gpt-5.6-codex-runtime",
    title: "GPT-5.6 / Codex Runtime 学习图谱",
    subtitle: "行为定协作，Runtime 定能力，授权定动作，验证定完成",
    nodes: [
      ["行为层", "Personality", "commentary / final", "协作主体"],
      ["授权层", "判断请求类型", "自治不扩张范围", "危险动作收窄"],
      ["来源与 Skills", "先读项目规则", "完整读取 Skill", "复用模板资源"],
      ["Runtime", "apps 与 tools", "Shell / Web", "Browser / Computer"],
      ["实时语音", "FEM 保持响应", "BEM 负责执行", "STATUS / COMPLETE"],
      ["验证交付", "保护工作区", "检查真实结果", "终态才算完成"],
    ],
    reuse: "原结构复用：Personality → Working with the user → Rules → Destructive actions → Skills → Runtime slots",
    hook: "记忆钩子：模型提示词不是完整 Runtime；工具存在也不等于获得授权。",
  },
  {
    slug: "gpt-5.5-prompt-framework",
    title: "GPT-5.5 Prompt Framework 学习图谱",
    subtitle: "先找到正确事实来源，再决定边界、工具和回答表面",
    nodes: [
      ["理解请求", "目标与输入", "已有用户上下文", "避免重复追问"],
      ["事实来源", "文件用 file search", "邮箱用连接器", "当前事实用 Web"],
      ["边界判断", "安全与隐私", "版权与权限", "副作用检查"],
      ["工具契约", "何时使用", "参数与权限", "结果与失败处理"],
      ["响应表面", "纯文字优先", "富响应有 gate", "Artifact 有交付物"],
      ["证据与回答", "区分事实推断", "压缩工具结果", "结果先说"],
    ],
    reuse: "原结构复用：General → Engineering judgment → Frontend → Editing → Autonomy → Working with user → Runtime slots",
    hook: "记忆钩子：记忆只帮助路由；文件、邮箱和第三方应用仍由各自专用来源负责。",
  },
  {
    slug: "claude-sonnet-5-claude-code",
    title: "Claude Sonnet 5 / Claude Code 学习图谱",
    subtitle: "Assistant Base 塑造助手，Coding Runtime 管理有状态工程执行",
    nodes: [
      ["助手底座", "语气与事实检索", "安全与用户数据", "视觉与 Artifacts"],
      ["Doing Tasks", "理解真实目标", "信息足够就推进", "谨慎执行动作"],
      ["Auto Memory", "按类型保存", "限制敏感与临时态", "推荐前重新复核"],
      ["临时与上下文", "专用 scratchpad", "保护用户工作区", "长任务保存状态"],
      ["Agents / Skills", "独立任务才委派", "完整读取 Skill", "主代理负责整合"],
      ["Tools / Delivery", "专用工具取证", "配置与诊断", "验证后再交付"],
    ],
    reuse: "原结构复用：Assistant base → Capability gates → Coding runtime → Memory → Environment → Agents → Skills → Tools",
    hook: "记忆钩子：跨会话稳定事实进 memory；一次性中间产物进 scratchpad。",
  },
  {
    slug: "claude-fable-5-claude-code-prompt-framework",
    title: "Claude Fable 5.1 / Claude Code 学习图谱",
    subtitle: "Reporting outcomes 把工程闭环收紧为可观察、可审计的交付",
    nodes: [
      ["结果证据", "只报实际发生", "失败放在首句", "未检查就明说"],
      ["Harness", "权限模式", "system updates", "并行专用工具"],
      ["状态", "memory 文件", "session scratchpad", "context continuation"],
      ["Browser", "tab context", "console / dialogs", "失败循环止损"],
      ["Agents / Skills", "边界清楚才委派", "先加载说明", "主代理整合"],
      ["Delivery", "自主推进可逆项", "外部动作确认", "证据化收口"],
    ],
    reuse: "原结构复用：Identity → Reporting outcomes → Harness → State → Browser / Agents / Skills → Tools → Delivery",
    hook: "记忆钩子：“做过”不等于“完成”；只有本轮观察到的结果才能支撑完成声明。",
  },
  {
    slug: "claude-opus-5-claude-code",
    title: "Claude Opus 5 / Claude Code 学习图谱",
    subtitle: "同一模型的两个产品表面：长期助手关系与工程执行 Runtime",
    nodes: [
      ["产品事实", "只答已列入口", "support / docs 路由", "截止后事实搜索"],
      ["Memory FS", "耐久性与价值 gate", "隐私与作用域", "读后再合并"],
      ["Code Harness", "工程角色", "Session guidance", "工作区事实"],
      ["状态管理", "Runtime memory", "Scratchpad", "Context"],
      ["Agents / Skills", "边界清楚才委派", "专用工作流", "主代理复核"],
      ["交付与纠错", "检查真实结果", "错误先定位", "工具不代表授权"],
    ],
    reuse: "原结构复用：Assistant behavior → Memory filesystem ｜ Coding runtime → Harness → Context → Agents → Skills → Tools",
    hook: "记忆钩子：Claude.ai 的记忆服务长期关系；Claude Code 的状态服务可继续执行。",
  },
  {
    slug: "claude-design-skills",
    title: "Claude Design Skills 学习图谱",
    subtitle: "19 个用户 Skills + 2 个内部 Skills + 10 个 starters 组成设计运行时",
    nodes: [
      ["交付物路由", "页面 / 原型", "文档 / Deck", "真实内容来源"],
      ["Design 组件", "一个主组件优先", "内容与逻辑分层", "画布与模板契约"],
      ["Skill Routing", "按交付物选择", "完整读取说明", "各自完成标准"],
      ["Starter 组件", "设备与浏览器框", "Doc / Deck 舞台", "动画 v3 / 3D / 调参"],
      ["预览与反馈", "真实渲染", "屏幕与 Slide 标签", "保留评论锚点"],
      ["导出与 Handoff", "可编辑或像素保真", "PDF / HTML / PPTX", "交给 Claude Code"],
    ],
    reuse: "原结构复用：System boundary → Workflow → Inputs → Design Components → Skills → Starters → Verification → Handoff",
    hook: "记忆钩子：设计代理的关键不是灵感，而是让产物可预览、可评论、可调整、可移交。",
  },
  {
    slug: "grok-prompt-evolution",
    title: "Grok 4.6 / Build / Bot 学习图谱",
    subtitle: "同一产品族分别面向对话工具、应用生成与有状态桌面代理",
    nodes: [
      ["Grok 4.6", "X / Web / Image", "browser tabs", "network details"],
      ["Connectors", "先发现 schema", "缺授权先认证", "调用后再渲染"],
      ["Build Triage", "先判断是否构建", "读取 project rules", "选择 skills"],
      ["App Loop", "startup.sh", "scaffold / run", "浏览器 QA"],
      ["Grok Bot", "SendMessage 发声", "box / computer", "routine / memory"],
      ["Agent Ctrl", "subagent 生命周期", "插件 / MCP", "approval / untrusted"],
    ],
    reuse: "原结构复用：Conversation runtime ｜ App-builder loop ｜ Stateful desktop agent",
    hook: "记忆钩子：能力注册只是起点；真正的差异在工作区、消息通道、授权和完成标准。",
  },
  {
    slug: "gemini-prompt-family",
    title: "Gemini 3.7 Flash Prompt Family 学习图谱",
    subtitle: "先判断信息形状，再把答案路由到 Markdown、图片、组件或交互 Widget",
    nodes: [
      ["Assistant Gate", "身份与语气", "Saved Info 相关性", "当前请求优先"],
      ["Visual Test", "必须提高理解", "具体可视对象", "拒绝装饰图"],
      ["Basekit", "Image / Carousel", "Sequence / Timeline", "Follow-up paths"],
      ["Widget", "真实 initialValues", "语义行为描述", "不硬写 CSS 坐标"],
      ["Layout", "flat siblings", "视觉之间留白", "三秒识别重点"],
      ["Image Contract", "真实 image_tag", "生成与展示分离", "失败回退文本"],
    ],
    reuse: "原结构复用：Saved context → Direct answer → Visual relevance → Component contract → Layout check",
    hook: "记忆钩子：组件是信息表面，不是内容来源；先获得证据，再选择呈现形状。",
  },
  {
    slug: "qwen-prompt-family",
    title: "Qwen 3.8 Max Prompt Runtime 学习图谱",
    subtitle: "极简身份层把主要控制交给函数 schema、调用序列化与 runtime 校验",
    nodes: [
      ["Tools First", "工具目录置顶", "JSON schema", "必填字段清楚"],
      ["Code", "Python sandbox", "计算与解析", "边界未展开"],
      ["Search", "queries 数组", "发现候选来源", "不等于答案"],
      ["Extractor", "urls 至少一个", "goal 必填", "空 goal 返回原文"],
      ["Call Format", "XML envelope", "调用后无 suffix", "交给 harness 解析"],
      ["Runtime", "actual time", "knowledge cutoff", "Qwen3.8 identity"],
    ],
    reuse: "原结构复用：Tool schemas → Function-call envelope → Current time / cutoff → Model identity",
    hook: "记忆钩子：薄 prompt 不是少契约；缺少的路由、权限和恢复行为必须由 runtime 补齐。",
  },
  {
    slug: "meta-muse-code",
    title: "Meta Muse Code Runtime 学习图谱",
    subtitle: "代码事实、公共表面验证、仓库保护和简洁交付组成 coding behavior 层",
    nodes: [
      ["Comms", "CLI / Markdown", "短而直接", "工具不是消息通道"],
      ["Truth", "代码是事实源", "不猜 URL / 结果", "私有 grader 越界"],
      ["Verify", "驱动公共表面", "因果证据", "外部动作需安全目标"],
      ["Scope", "请求是完整契约", "错误与边界同权", "覆盖 wrappers"],
      ["Repo", "先读调用链", "最小完整修复", "保护未跟踪文件"],
      ["Delivery", "检查 collateral diff", "Git 不改历史", "结果 / 风险分离"],
    ],
    reuse: "原结构复用：Identity → Communication → Truthfulness → Verification → Repository work → Final answer",
    hook: "记忆钩子：自信不是证据；测试通过也不是全部，最终要观察用户真正触达的表面。",
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function textLine(value, x, y, className, anchor = "start") {
  return `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
}

function renderSvg(map) {
  const cards = map.nodes.map((node, index) => {
    const x = 70 + index * 240;
    const palette = palettes[index];
    const bullets = node.slice(1).map((line, bulletIndex) => {
      const y = 353 + bulletIndex * 48;
      return `
        <circle cx="${x + 27}" cy="${y - 6}" r="4" fill="${palette.stroke}"/>
        ${textLine(line, x + 42, y, "bullet")}
      `;
    }).join("");
    return `
      <g>
        <rect x="${x}" y="226" width="220" height="296" rx="22"
          fill="rgba(255,255,255,0.94)" stroke="${palette.stroke}" stroke-width="2"/>
        <circle cx="${x + 32}" cy="264" r="18" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="2"/>
        ${textLine(String(index + 1), x + 32, 271, "index", "middle")}
        ${textLine(node[0], x + 62, 273, "node-title")}
        <line x1="${x + 22}" y1="306" x2="${x + 198}" y2="306" stroke="${palette.stroke}" opacity="0.38"/>
        ${bullets}
      </g>
    `;
  }).join("");

  const connectors = map.nodes.slice(0, -1).map((_, index) => {
    const x1 = 290 + index * 240;
    const x2 = 310 + index * 240;
    return `<path d="M ${x1} 374 L ${x2} 374" stroke="#8da0b5" stroke-width="2" stroke-dasharray="5 6"/>`;
  }).join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <style>
        text { font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", sans-serif; fill: #16263d; }
        .title { font-size: 46px; font-weight: 750; letter-spacing: -1px; }
        .subtitle { font-size: 20px; font-weight: 500; fill: #5f6d7c; }
        .node-title { font-size: 23px; font-weight: 700; }
        .bullet { font-size: 17px; font-weight: 520; fill: #435165; }
        .index { font-size: 17px; font-weight: 750; }
        .band-label { font-size: 15px; font-weight: 760; fill: #315880; }
        .band-copy { font-size: 19px; font-weight: 560; fill: #2b4058; }
        .hook { font-size: 23px; font-weight: 680; fill: #26384d; }
        .source { font-size: 13px; font-weight: 500; fill: #778394; letter-spacing: .6px; }
      </style>
      <rect width="1600" height="900" fill="rgba(255,255,255,0.40)"/>
      <rect x="46" y="38" width="1508" height="128" rx="28" fill="rgba(255,255,255,0.88)" stroke="#d8d5cc"/>
      ${textLine(map.title, 80, 95, "title")}
      ${textLine(map.subtitle, 82, 134, "subtitle")}
      <line x1="70" y1="374" x2="1490" y2="374" stroke="#c7d0da" stroke-width="2"/>
      ${connectors}
      ${cards}
      <rect x="70" y="566" width="1420" height="112" rx="22" fill="rgba(239,246,255,0.94)" stroke="#b7cbe3" stroke-width="2"/>
      ${textLine("REUSABLE SOURCE SHAPE", 100, 603, "band-label")}
      ${textLine(map.reuse, 100, 644, "band-copy")}
      <rect x="70" y="710" width="1420" height="104" rx="22" fill="rgba(255,248,230,0.95)" stroke="#dfbf73" stroke-width="2"/>
      <circle cx="108" cy="762" r="22" fill="#fff3c9" stroke="#d7a542" stroke-width="2"/>
      ${textLine("!", 108, 771, "hook", "middle")}
      ${textLine(map.hook, 148, 770, "hook")}
      ${textLine("Source snapshot · asgeirtj/system_prompts_leaks@171d1db · 2026-09-03", 1490, 864, "source", "end")}
    </svg>
  `;
}

async function main() {
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.mkdirSync(thumbnailDir, { recursive: true });
  fs.mkdirSync(webpDir, { recursive: true });
  for (const map of maps) {
    const svg = renderSvg(map);
    const svgPath = path.join(sourceDir, `${map.slug}.svg`);
    const pngPath = path.join(outputDir, `${map.slug}.png`);
    fs.writeFileSync(svgPath, svg);
    if (sharp) {
      await sharp(background)
        .resize(1600, 900, { fit: "cover" })
        .composite([{ input: Buffer.from(svg) }])
        .png({ compressionLevel: 9 })
        .toFile(pngPath);
      const thumbnailPath = path.join(thumbnailDir, `${map.slug}.webp`);
      const webpPath = path.join(webpDir, `${map.slug}.webp`);
      await sharp(pngPath)
        .resize(960, 540, { fit: "cover" })
        .webp({ quality: 72, effort: 6, smartSubsample: true })
        .toFile(thumbnailPath);
      await sharp(pngPath)
        .webp({ quality: 84, effort: 6, smartSubsample: true })
        .toFile(webpPath);
      console.log(`${map.slug}: PNG + homepage/detail WebP variants`);
    } else {
      console.log(`${map.slug}: ${svgPath} (PNG export skipped: install sharp)`);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
