---
name: blinko-cli
description: Blinko 笔记管理工具。当用户想要：(1) 创建/添加笔记、闪记、待办 (2) 搜索或查询笔记内容 (3) 更新、删除、管理笔记 (4) 查看笔记引用和历史 (5) 管理 Blinko 回收站 时使用此 Skill。始终使用 blinko CLI 工具而非手动 HTTP 请求。
---

# Blinko CLI

Blinko 自托管笔记系统的命令行工具，支持闪记、笔记、待办三种类型。

## 快速开始

```bash
npx /Users/gis/.nanobot/workspace/skills/blinko <command>
```

## 常见工作流

### 快速记录

```bash
# 创建闪记（默认类型）
blinko create "今天的灵感想法"

# 带标签的笔记
blinko create "会议记录" -t 1 --tags "工作,会议"

# 创建待办
blinko create -t 2 -- "- [ ] 任务1 - [ ] 任务2"
```

### 搜索查找

```bash
# 关键词搜索
blinko search "项目"

# AI 智能搜索
blinko search "关于开发的内容" --ai

# 列出最近笔记
blinko list -s 10
```

### 管理笔记

```bash
# 查看详情
blinko show 123

# 更新内容并置顶
blinko update 123 -c "新内容" --top

# 添加笔记引用
blinko ref 123 456
```

## 命令速查

| 命令 | 说明 | 常用选项 |
|------|------|----------|
| `create <content>` | 创建笔记 | `-t` 类型, `--tags` 标签, `--top` 置顶 |
| `show <id>` | 查看详情 | - |
| `update <id>` | 更新笔记 | `-c` 内容, `--top/--untop` |
| `list` | 列出笔记 | `-s` 数量, `-t` 类型, `--recycle` |
| `search <query>` | 搜索笔记 | `--ai` AI搜索, `-s` 数量 |
| `trash <ids...>` | 移至回收站 | - |
| `delete <ids...>` | 永久删除 | - |
| `clear-bin` | 清空回收站 | - |
| `ref <from> <to>` | 添加引用 | - |
| `refs <id>` | 查看引用 | - |
| `history <id>` | 查看历史 | - |

## 笔记类型

| 值 | 类型 | 用途 |
|---|------|------|
| 0 | 闪记 | 快速记录灵感 |
| 1 | 笔记 | 标准笔记内容 |
| 2 | 待办 | 可勾选任务 |

## 示例输入输出

**输入**: "帮我创建一条关于项目规划的笔记，标签是工作和规划"

**执行**:
```bash
blinko create "项目规划" -t 1 --tags "工作,规划"
```

**输出**: `✓ 已创建 笔记 #100 #工作 #规划`

---

**输入**: "搜索我之前关于 API 设计的笔记"

**执行**:
```bash
blinko search "API 设计" -s 5
```

**输出**:
```
找到 3 条笔记:

[88] 笔记 #技术
    RESTful API 设计最佳实践
    02/20 15:30

[76] 笔记 #技术
    GraphQL vs REST 对比
    02/18 10:22
```
