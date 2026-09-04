# Qwen 3.8 Max Prompt Runtime Notes

这份笔记用于复习固定源快照里的 Qwen 3.8 Max 系统提示词。它不是官方模型说明，而是一份“极简身份层 + 完整工具协议”的 prompt engineering 样本。

> 源快照：`asgeirtj/system_prompts_leaks@171d1db270008b6cd8132f1a1b924ff3506b9f8a`（2026-09-03）。结论只来自该文件实际出现的身份、时间、工具 schema 与函数调用格式。

## 一句话核心

Qwen 3.8 Max 的可见提示词把绝大多数篇幅交给工具注册：先声明三个函数，再规定 XML 调用形状，最后注入当前时间、知识截止和模型身份。

它最适合用来观察一个问题：**当行为层极短时，可靠性几乎完全取决于工具 schema、runtime 校验和调用后处理。**

## 源提示词的真实结构

源文件的顺序非常直接：

```text
Tools
├── code_interpreter
├── web_search
└── web_extractor
↓
Function-call serialization rules
↓
Current time + knowledge cutoff
↓
Model identity: Qwen3.8
```

这里没有展开人格、长任务续作、权限层、文件工作区、Git、memory 或完成验证。不要因为模型名称而补写源文件没有的能力。

## 三个工具，各自拥有不同事实

### `code_interpreter`：计算与可执行结果

它接收单个必填字符串 `code`，描述为 Python code sandbox。源文件没有额外声明文件系统、联网、持久化或副作用边界。

因此可复用的认识不是“代码解释器无所不能”，而是：

- 数值、解析和可运行计算应进入代码沙箱。
- schema 只证明 `code` 参数存在，不证明沙箱能访问网络或用户文件。
- 执行结果仍需要由上层 prompt 解释、校验并整合进答案。

### `web_search`：从问题到候选来源

`web_search` 接收必填的 `queries` 数组。每个元素是一个搜索查询字符串。

它适合发现来源，但源文件没有写引用格式、时效判断、来源优先级或冲突裁决。也就是说，“能搜”不等于“已经建立证据链”。

### `web_extractor`：从已知 URL 取得正文

`web_extractor` 接收：

- `urls`：至少一个 URL 的数组。
- `goal`：访问目标；为空时返回原始内容。

这是一个很清楚的两阶段网页路由：

```text
不知道地址 → web_search 找候选
已经知道地址 → web_extractor 抽取
需要定向理解 → 在 goal 中写明目标
需要原始内容 → goal 为空
```

值得注意的是，`goal` 仍是必填字段，即使想拿原文也要显式传空值。工具契约里的“必填”和自然语言里的“可为空”是两个不同维度。

## XML 调用协议

源提示词要求调用函数时只输出指定嵌套格式，函数块必须放在 XML 标签内；可以在调用前写自然语言推理，但调用后不能追加文本。

这个约束控制的是**序列化和回合边界**，不是任务决策：

- 哪个工具该被选，源文件没有统一路由规则。
- 调用失败后是否重试，源文件没有恢复协议。
- 多个查询能否并行，源文件没有说明。
- 工具结果如何引用或核验，源文件没有说明。

所以它是一份薄 prompt、厚 harness 的设计：格式必须由 runtime 严格解析，行为则依赖模型自身和工具返回。

## 值得学习什么

可以借鉴：

- 工具 schema 保持短小，必填字段一眼可见。
- 搜索与网页抽取分开，避免把“发现来源”和“读取来源”混为一谈。
- 函数调用有明确的唯一输出形状，方便 runtime 解析。
- 当前时间、知识截止和身份作为动态状态放在工具协议之后。

需要补齐：

- 当前事实何时必须搜索。
- URL 与网页正文之间的 source authority。
- 工具不可用、空结果和冲突结果的恢复策略。
- code sandbox 的网络、文件、超时与持久化边界。
- 最终答案如何引用证据并区分事实与推断。

## 原文式 FrameworkNote：Minimal Tool Runtime

这份母版严格保留源文件的形状：工具目录在前，调用格式居中，时间与身份在后。只在工具注册块内部补上生产环境通常需要的契约槽位，不把它改写成通用十步 agent 框架。

```text
# Tools

You have access to the following functions:

<tools>

{
  "type": "function",
  "function": {
    "name": "{{COMPUTE_TOOL_NAME = ...}}",
    "description": "{{COMPUTE_PURPOSE = ...}}",
    "parameters": {
      "type": "object",
      "properties": {
        "{{CODE_PARAMETER = ...}}": {
          "description": "{{CODE_INPUT_DESCRIPTION = ...}}",
          "type": "string"
        }
      },
      "required": ["{{CODE_PARAMETER = ...}}"]
    }
  }
}

{
  "type": "function",
  "function": {
    "name": "{{SEARCH_TOOL_NAME = ...}}",
    "description": "{{SEARCH_PURPOSE = ...}}",
    "parameters": {
      "type": "object",
      "properties": {
        "{{QUERY_LIST_PARAMETER = ...}}": {
          "type": "array",
          "items": {"type": "string"},
          "description": "{{QUERY_LIST_DESCRIPTION = ...}}"
        }
      },
      "required": ["{{QUERY_LIST_PARAMETER = ...}}"]
    }
  }
}

{
  "type": "function",
  "function": {
    "name": "{{EXTRACTOR_TOOL_NAME = ...}}",
    "description": "{{EXTRACTOR_PURPOSE = ...}}",
    "parameters": {
      "type": "object",
      "properties": {
        "{{URL_LIST_PARAMETER = ...}}": {
          "type": "array",
          "items": {"type": "string"},
          "minItems": 1
        },
        "{{GOAL_PARAMETER = ...}}": {
          "type": "string",
          "description": "{{EMPTY_GOAL_BEHAVIOR = ...}}"
        }
      },
      "required": ["{{URL_LIST_PARAMETER = ...}}", "{{GOAL_PARAMETER = ...}}"]
    }
  }
}

</tools>

If you choose to call a function, reply only in this format with no suffix:

{{FUNCTION_CALL_ENVELOPE = ...}}

Required parameters must be present. Tool availability does not imply access to
files, networks, accounts, or side effects not named in the selected schema.

Before a call, {{PRE_CALL_EXPLANATION_POLICY = ...}}.
After a call, {{POST_CALL_TEXT_POLICY = ...}}.
On empty result, schema error, timeout, or unavailable tool,
{{FAILURE_AND_RETRY_POLICY = ...}}.

Current actual time: {{CURRENT_TIME = ...}}
Knowledge cutoff: {{KNOWLEDGE_CUTOFF = ...}}

You are {{MODEL_IDENTITY = ...}}.
```

## 复习问题

1. 这个请求需要计算、发现网页，还是读取已知网页？
2. 工具 schema 证明了哪些能力，又没有证明哪些边界？
3. `web_search` 返回的是答案还是候选来源？
4. `goal` 为空与 `goal` 可省略有什么区别？
5. 调用格式约束解决了解析问题，但还缺哪几种恢复行为？
6. 当前时间、知识截止和模型身份为什么属于 runtime state？

## 来源索引

以下链接固定到本笔记使用的源快照 `171d1db270008b6cd8132f1a1b924ff3506b9f8a`：

- [Qwen 3.8 Max](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Qwen/qwen3.8-max.md)
