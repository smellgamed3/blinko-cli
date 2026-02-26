# blinko-cli

Command-line tool for managing [Blinko](https://github.com/blinko-space/blinko) self-hosted notes. Supports flash notes, regular notes, and todos with full CRUD, search, references, and history.

## Prerequisites

- Node.js ≥ 18
- A running Blinko instance with API access

## Installation

```bash
# Clone and link globally
git clone https://github.com/smellgamed3/blinko-cli.git
cd blinko-cli
npm link
```

## Configuration

Create `~/.config/blinko.skill.yaml` with your server credentials — **this file is intentionally excluded from the repository**:

```yaml
server_url: "https://your-blinko-instance.example.com"
token: "your-jwt-token"
```

Get your token by logging into Blinko → Settings → API Token.

## Usage

```
blinko <command> [options]
```

### Commands

| Command | Description | Options |
|---------|-------------|---------|
| `create <content>` | Create a note | `-t 0\|1\|2` type, `--top` pin, `--ref id1,id2` references |
| `show <id>` | Show note detail | |
| `update <id>` | Update a note | `-c <content>`, `--top`, `--untop` |
| `list` | List recent notes | `-s <size>`, `-t <type>`, `--recycle` |
| `search <query>` | Search notes | `--ai` AI search, `-s <size>` |
| `trash <ids...>` | Move to recycle bin | |
| `delete <ids...>` | Permanently delete | |
| `clear-bin` | Empty recycle bin | |
| `ref <from> <to>` | Add reference between notes | |
| `refs <id>` | Show note references | |
| `history <id>` | Show note edit history | |

### Note Types

| Value | Type | Use |
|-------|------|-----|
| `0` | 闪记 Flash | Quick ideas (default) |
| `1` | 笔记 Note | Standard notes, tags inline with `#tag` |
| `2` | 待办 Todo | Checklist tasks |

### Examples

```bash
# Create a flash note
blinko create "Today's idea"

# Create a tagged note (type 1)
blinko create "Meeting notes #work #meeting" -t 1

# Pin a note
blinko create "Important reminder" --top

# List last 20 notes
blinko list -s 20

# Keyword search
blinko search "API design"

# AI-powered search
blinko search "something about async patterns" --ai

# View note detail
blinko show 42

# Update content
blinko update 42 -c "Updated content"

# Link two notes
blinko ref 42 99

# Delete notes
blinko delete 10 11 12
```

## Claude Code Skill

This project includes a `SKILL.md` making it available as a Claude Code skill. When installed at `~/.claude/skills/blinko-cli/`, Claude will automatically invoke `blinko` commands when you ask to manage notes.

```bash
mkdir -p ~/.claude/skills/blinko-cli
cp SKILL.md ~/.claude/skills/blinko-cli/SKILL.md
```

## License

MIT
