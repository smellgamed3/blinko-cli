# blinko-cli

[Blinko](https://github.com/blinko-space/blinko) 自托管笔记系统的命令行管理工具。支持闪记、笔记、待办三种类型，覆盖增删改查、搜索、引用关系和历史版本。

## 环境要求

- Node.js ≥ 18
- 可访问 API 的 Blinko 实例

## 安装

```bash
# 克隆并全局链接
git clone https://github.com/smellgamed3/blinko-cli.git
cd blinko-cli
npm link
```

## 配置

创建 `~/.config/blinko.skill.yaml`，填写服务器信息——**此文件包含敏感信息，不纳入代码仓库**：

```yaml
server_url: "https://your-blinko-instance.example.com"
token: "your-jwt-token"
```

Token 获取方式：登录 Blinko → 设置 → API Token。

## 使用方式

```
blinko <命令> [选项]
```

### 命令一览

| 命令 | 说明 | 常用选项 |
|------|------|----------|
| `create <内容>` | 创建笔记 | `-t 0\|1\|2` 类型，`--top` 置顶，`--ref id1,id2` 引用 |
| `show <id>` | 查看笔记详情 | |
| `update <id>` | 更新笔记 | `-c <内容>`，`--top`，`--untop` |
| `list` | 列出最近笔记 | `-s <数量>`，`-t <类型>`，`--recycle` 回收站 |
| `search <关键词>` | 搜索笔记 | `--ai` AI 搜索，`-s <数量>` |
| `trash <ids...>` | 移入回收站 | |
| `delete <ids...>` | 永久删除 | |
| `clear-bin` | 清空回收站 | |
| `ref <来源id> <目标id>` | 添加笔记引用 | |
| `refs <id>` | 查看引用关系 | |
| `history <id>` | 查看编辑历史 | |

### 笔记类型

| 值 | 类型 | 用途 |
|----|------|------|
| `0` | 闪记 | 快速灵感记录（默认） |
| `1` | 笔记 | 标准内容，标签用内联 `#标签名` |
| `2` | 待办 | 含 `- [ ]` 的任务清单 |

### 使用示例

```bash
# 创建闪记
blinko create "今天的灵感"

# 创建带标签的笔记（类型 1）
blinko create "会议记录 #工作 #会议" -t 1

# 创建并置顶
blinko create "重要提醒" --top

# 列出最近 20 条
blinko list -s 20

# 关键词搜索
blinko search "API 设计"

# AI 智能搜索
blinko search "关于异步模式的内容" --ai

# 查看笔记详情
blinko show 42

# 更新内容
blinko update 42 -c "新内容"

# 建立笔记引用
blinko ref 42 99

# 删除笔记
blinko delete 10 11 12
```

## Claude Code Skill 集成

本项目附带 `SKILL.md`，可作为 Claude Code Skill 使用。安装后，当你要求管理笔记时，Claude 会自动调用 `blinko` 命令。

```bash
mkdir -p ~/.claude/skills/blinko-cli
cp SKILL.md ~/.claude/skills/blinko-cli/SKILL.md
```

## 许可证

MIT
