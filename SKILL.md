---
name: blinko-cli
description: Blinko 笔记管理工具。当用户想要：(1) 创建/添加笔记、闪记、待办 (2) 搜索或查询笔记内容 (3) 更新、删除、管理笔记 (4) 查看笔记引用和历史 (5) 管理 Blinko 回收站 时使用此 Skill。始终使用 blinko CLI 工具而非手动 HTTP 请求。
allowed-tools: Bash
---

# Blinko CLI

Blinko 自托管笔记系统的命令行工具，支持闪记（0）、笔记（1）、待办（2）三种类型。

## 规则

- 始终通过 `blinko` 命令操作笔记，不直接发起 HTTP 请求。
- 标签用内联 `#标签名` 写在 content 中，不是独立参数。
- 创建时默认类型为 0（闪记）；若用户说"笔记"用 `-t 1`，说"待办/任务"用 `-t 2`。
- 删除前若用户未明确说"永久删除"，先用 `trash` 移入回收站。

## 命令参考

```
blinko create <content> [-t 0|1|2] [--top] [--ref id1,id2]
blinko show <id>
blinko update <id> [-c <content>] [--top|--untop]
blinko list [-s <size>] [-t <type>] [--recycle]
blinko search <query> [--ai] [-s <size>]
blinko trash <ids...>
blinko delete <ids...>
blinko clear-bin
blinko ref <fromId> <toId>
blinko refs <id>
blinko history <id>
```

## 笔记类型

| 值 | 类型 | 用途 |
|---|------|------|
| 0 | 闪记 | 快速记录灵感（默认） |
| 1 | 笔记 | 标准内容，支持 Markdown |
| 2 | 待办 | 含 `- [ ]` 的任务列表 |

## 示例

**用户**: "帮我记录一条灵感：用 AI 生成周报"

```bash
blinko create "用 AI 生成周报"
```

输出: `✓ 已创建 闪记 #101`

---

**用户**: "创建一条工作笔记，打上 #工作 #规划 标签"

```bash
blinko create "工作规划 #工作 #规划" -t 1
```

---

**用户**: "搜索关于 API 设计的笔记"

```bash
blinko search "API 设计" -s 5
```

---

**用户**: "列出最近 10 条笔记"

```bash
blinko list -s 10
```

---

**用户**: "把笔记 88 更新一下内容，置顶"

```bash
blinko update 88 -c "新内容" --top
```

## 详细文档

完整命令说明见 [README.md](README.md)。
