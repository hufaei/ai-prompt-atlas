const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "docs/assets/mindmaps");
const sourceDir = path.join(outputDir, "source");
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
    title: "Claude Fable 5 / Claude Code 学习图谱",
    subtitle: "用 Harness 把工程请求推进到工作区证据、修改、验证和交付",
    nodes: [
      ["Harness", "工程代理身份", "持续到完成或阻塞", "短进度与终态交付"],
      ["Memory", "项目与反馈事实", "Why / How to apply", "保留来源与链接"],
      ["Environment", "gitStatus / claudeMd", "专用 scratchpad", "上下文续作"],
      ["Tool Registry", "Read / Edit / Bash", "Agent / Task", "每个工具有边界"],
      ["时间与设计", "Cron / Monitor", "ScheduleWakeup", "Artifact / DesignSync"],
      ["工程闭环", "查证再编辑", "保护 Git 现场", "验证真实行为"],
    ],
    reuse: "原结构复用：Harness → Communication → Session → Memory → Environment → Context → Tools → Git → Delivery",
    hook: "记忆钩子：Claude Code 的完成不是给建议，而是让工程状态真的发生并被验证。",
  },
  {
    slug: "claude-opus-5-claude-code",
    title: "Claude Opus 5 / Claude Code 学习图谱",
    subtitle: "同一模型的两个产品表面：长期助手关系与工程执行 Runtime",
    nodes: [
      ["Assistant", "默认立场", "语气与纠错", "安全分支路由"],
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
    subtitle: "结构化产物 + 可复用组件 + 专用 Skill + 可见验证 + 清楚交接",
    nodes: [
      ["交付物路由", "页面 / 原型", "文档 / Deck", "真实内容来源"],
      ["Design 组件", "一个主组件优先", "内容与逻辑分层", "画布与模板契约"],
      ["Skill Routing", "22 个专用 Skills", "完整读取说明", "各自完成标准"],
      ["Starter 组件", "设备与浏览器框", "Doc / Deck 舞台", "动画 / 3D / 调参"],
      ["预览与反馈", "真实渲染", "屏幕与 Slide 标签", "保留评论锚点"],
      ["导出与 Handoff", "可编辑或像素保真", "PDF / HTML / PPTX", "交给 Claude Code"],
    ],
    reuse: "原结构复用：System boundary → Workflow → Inputs → Design Components → Skills → Starters → Verification → Handoff",
    hook: "记忆钩子：设计代理的关键不是灵感，而是让产物可预览、可评论、可调整、可移交。",
  },
  {
    slug: "grok-prompt-evolution",
    title: "Grok Prompt Evolution 学习图谱",
    subtitle: "从产品能力清单演进为 X / Web / 连接器 / Memory / Sandbox Runtime",
    nodes: [
      ["基础与安全", "同语言回应", "能力与不确定性", "高优先级安全壳"],
      ["环境与上下文", "远程 sandbox", "静态目录快照", "不是用户本机"],
      ["X / Web", "keyword / semantic", "user / thread / video", "网页与图片搜索"],
      ["连接器与记忆", "先发现工具 schema", "再执行连接器", "User Info / Memories"],
      ["Image / Render", "一次预览走 render", "项目资产走 tool", "Citation / File"],
      ["Files / Skills", "read / edit / write", "bash 执行", "Skills 管工作流"],
    ],
    reuse: "原结构复用：Base behavior → Environment → Context → Tools → Render components → Skills → User info → Memories",
    hook: "记忆钩子：Grok 最值得学的是产品能力注册；最需要补的是统一的完成与验证骨架。",
  },
  {
    slug: "gemini-prompt-family",
    title: "Gemini Prompt Family 学习图谱",
    subtitle: "Pro 决定是否视觉化，Flash 取得证据并渲染，Nano Banana 执行图像",
    nodes: [
      ["Pro 总控", "身份与能力隔离", "Strict / Expert", "视觉与 Widget gate"],
      ["用户数据", "必要性测试", "敏感数据限制", "纠正优先"],
      ["Flash 工具", "Python 计算", "Google Search", "Workspace / YouTube"],
      ["Web UI", "Image / Carousel", "Sequence / Timeline", "GenerateWidget"],
      ["Nano Banana", "image_gen", "display", "search / image_search"],
      ["最终路由", "先取事实证据", "再选展示表面", "版权与来源检查"],
    ],
    reuse: "原结构复用：Assistant identity → Capability gate → Follow-up → Personalization → Visual / Widget → Flash tools → Image API",
    hook: "记忆钩子：工具负责取得事实，组件负责展示事实；不要先选组件再反推内容。",
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
      ${textLine("Source snapshot · asgeirtj/system_prompts_leaks@1e82828 · 2026-07-30", 1490, 864, "source", "end")}
    </svg>
  `;
}

async function main() {
  fs.mkdirSync(sourceDir, { recursive: true });
  for (const map of maps) {
    const svg = renderSvg(map);
    const svgPath = path.join(sourceDir, `${map.slug}.svg`);
    const pngPath = path.join(outputDir, `${map.slug}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(background)
      .resize(1600, 900, { fit: "cover" })
      .composite([{ input: Buffer.from(svg) }])
      .png({ compressionLevel: 9 })
      .toFile(pngPath);
    console.log(`${map.slug}: ${pngPath}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
