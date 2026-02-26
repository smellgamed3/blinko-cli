#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function parseConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`配置文件不存在: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  const map = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    map[key] = value;
  }
  if (!map.server_url || !map.token) {
    fail("配置缺少 server_url 或 token");
  }
  return map;
}

const CONFIG_PATH = path.join(os.homedir(), ".config", "blinko.skill.yaml");
const CONFIG = parseConfig(CONFIG_PATH);

function formatType(type) {
  if (type === 0) return "闪记";
  if (type === 1) return "笔记";
  if (type === 2) return "待办";
  return `类型${type}`;
}

function shortContent(text, max = 80) {
  const oneLine = String(text || "").replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max - 1)}…`;
}

function parseOptions(args) {
  const opts = { _: [] };
  for (let i = 0; i < args.length; i += 1) {
    const cur = args[i];
    if (cur === "--") {
      opts._.push(...args.slice(i + 1));
      break;
    }
    if (!cur.startsWith("-")) {
      opts._.push(cur);
      continue;
    }
    if (cur === "-t" || cur === "-s" || cur === "-c" || cur === "--ref") {
      const next = args[i + 1];
      if (!next || next.startsWith("-")) fail(`选项缺少参数: ${cur}`);
      opts[cur] = next;
      i += 1;
      continue;
    }
    opts[cur] = true;
  }
  return opts;
}

async function request(method, apiPath, body, query) {
  const url = new URL(`${CONFIG.server_url.replace(/\/+$/, "")}/api${apiPath}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${CONFIG.token}`
  };
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(url, { method, headers, body: payload });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const msg = typeof json === "string" ? json : json?.message || JSON.stringify(json);
    fail(`${res.status} ${res.statusText}: ${msg}`);
  }
  return json;
}

function printNoteDetail(note) {
  console.log(`[${note.id}] ${formatType(note.type)}${note.isTop ? " 📌" : ""}${note.isRecycle ? " (回收站)" : ""}`);
  if (Array.isArray(note.tags) && note.tags.length) {
    const tags = note.tags.map((t) => `#${t.tag?.name || t.name || ""}`).join(" ");
    console.log(tags);
  }
  console.log(note.content || "");
  if (note.createdAt) console.log(`创建: ${note.createdAt}`);
  if (note.updatedAt) console.log(`更新: ${note.updatedAt}`);
}

async function cmdCreate(args) {
  const opts = parseOptions(args);
  const content = opts._.join(" ").trim();
  if (!content) fail("用法: blinko create <content> [-t 0|1|2] [--top] [--ref id1,id2]");
  const references = opts["--ref"] ? opts["--ref"].split(",").filter(Boolean).map((v) => Number(v.trim())) : [];
  const note = await request("POST", "/v1/note/upsert", {
    content,
    type: opts["-t"] !== undefined ? Number(opts["-t"]) : 0,
    isTop: Boolean(opts["--top"]),
    references
  });
  console.log(`✓ Created ${formatType(note.type)} #${note.id}`);
}

async function cmdShow(args) {
  const id = Number(args[0]);
  if (!id) fail("用法: blinko show <id>");
  const note = await request("POST", "/v1/note/detail", { id });
  printNoteDetail(note);
}

async function cmdUpdate(args) {
  const id = Number(args[0]);
  if (!id) fail("用法: blinko update <id> [-c content] [--top|--untop]");
  const opts = parseOptions(args.slice(1));
  const body = { id };
  if (opts["-c"] !== undefined) body.content = opts["-c"];
  if (opts["--top"]) body.isTop = true;
  if (opts["--untop"]) body.isTop = false;
  if (Object.keys(body).length === 1) fail("至少提供一个更新字段: -c / --top / --untop");
  const note = await request("POST", "/v1/note/upsert", body);
  console.log(`✓ Updated #${note.id}`);
}

async function cmdList(args) {
  const opts = parseOptions(args);
  const size = opts["-s"] !== undefined ? Number(opts["-s"]) : 10;
  const type = opts["-t"] !== undefined ? Number(opts["-t"]) : -1;
  const notes = await request("POST", "/v1/note/list", {
    page: 1,
    size,
    orderBy: "desc",
    type,
    isRecycle: Boolean(opts["--recycle"]),
    searchText: ""
  });
  if (!Array.isArray(notes) || notes.length === 0) {
    console.log("没有结果");
    return;
  }
  for (const note of notes) {
    const tags = Array.isArray(note.tags) ? note.tags.map((t) => `#${t.tag?.name || t.name || ""}`).join(" ") : "";
    console.log(`[${note.id}] ${formatType(note.type)} ${tags}`.trim());
    console.log(`    ${shortContent(note.content)}`);
    console.log(`    ${note.updatedAt || note.createdAt || ""}`);
    console.log("");
  }
}

async function cmdSearch(args) {
  const opts = parseOptions(args);
  const query = opts._.join(" ").trim();
  if (!query) fail("用法: blinko search <query> [--ai] [-s size]");
  const size = opts["-s"] !== undefined ? Number(opts["-s"]) : 10;
  const notes = await request("POST", "/v1/note/list", {
    page: 1,
    size,
    orderBy: "desc",
    type: -1,
    isRecycle: false,
    searchText: query,
    isUseAiQuery: Boolean(opts["--ai"])
  });
  if (!Array.isArray(notes) || notes.length === 0) {
    console.log("没有结果");
    return;
  }
  console.log(`找到 ${notes.length} 条笔记:\n`);
  for (const note of notes) {
    const tags = Array.isArray(note.tags) ? note.tags.map((t) => `#${t.tag?.name || t.name || ""}`).join(" ") : "";
    console.log(`[${note.id}] ${formatType(note.type)} ${tags}`.trim());
    console.log(`    ${shortContent(note.content, 120)}`);
    console.log(`    ${note.updatedAt || note.createdAt || ""}`);
    console.log("");
  }
}

function parseIds(ids) {
  const parsed = ids.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0);
  if (!parsed.length) fail("请提供至少一个有效 ID");
  return parsed;
}

async function cmdTrash(args) {
  const ids = parseIds(args);
  await request("POST", "/v1/note/batch-trash", { ids });
  console.log(`✓ Trashed ${ids.length} notes`);
}

async function cmdDelete(args) {
  const ids = parseIds(args);
  await request("POST", "/v1/note/batch-delete", { ids });
  console.log(`✓ Deleted ${ids.length} notes`);
}

async function cmdClearBin() {
  await request("POST", "/v1/note/clear-recycle-bin", {});
  console.log("✓ Recycle bin cleared");
}

async function cmdRef(args) {
  const from = Number(args[0]);
  const to = Number(args[1]);
  if (!from || !to) fail("用法: blinko ref <fromId> <toId>");
  await request("POST", "/v1/note/add-reference", { fromNoteId: from, toNoteId: to });
  console.log(`✓ Added reference: ${from} -> ${to}`);
}

async function cmdRefs(args) {
  const noteId = Number(args[0]);
  if (!noteId) fail("用法: blinko refs <id>");
  const references = await request("POST", "/v1/note/reference-list", { noteId, type: "references" });
  const referencedBy = await request("POST", "/v1/note/reference-list", { noteId, type: "referencedBy" });
  const print = (title, list) => {
    console.log(`${title} (${Array.isArray(list) ? list.length : 0})`);
    if (!Array.isArray(list) || !list.length) {
      console.log("  (none)");
      return;
    }
    for (const item of list) {
      const note = item.note || item;
      console.log(`  [${note.id}] ${shortContent(note.content, 90)}`);
    }
  };
  print("references", references);
  print("referencedBy", referencedBy);
}

async function cmdHistory(args) {
  const noteId = Number(args[0]);
  if (!noteId) fail("用法: blinko history <id>");
  const rows = await request("GET", "/v1/note/history", undefined, { noteId });
  if (!Array.isArray(rows) || !rows.length) {
    console.log("无历史记录");
    return;
  }
  for (const row of rows) {
    const ver = row.version ?? row.id ?? "-";
    const updated = row.updatedAt || row.createdAt || "";
    const content = row.content || row.note?.content || "";
    console.log(`[v${ver}] ${updated}`);
    console.log(`    ${shortContent(content, 120)}`);
  }
}

function help() {
  console.log(`Blinko CLI

用法:
  blinko create <content> [-t type] [--top] [--ref id1,id2]
  blinko show <id>
  blinko update <id> [-c content] [--top|--untop]
  blinko list [-s size] [-t type] [--recycle]
  blinko search <query> [--ai] [-s size]
  blinko trash <ids...>
  blinko delete <ids...>
  blinko clear-bin
  blinko ref <fromId> <toId>
  blinko refs <id>
  blinko history <id>`);
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === "-h" || cmd === "--help" || cmd === "help") {
    help();
    return;
  }
  const map = {
    create: cmdCreate,
    show: cmdShow,
    update: cmdUpdate,
    list: cmdList,
    search: cmdSearch,
    trash: cmdTrash,
    delete: cmdDelete,
    "clear-bin": cmdClearBin,
    ref: cmdRef,
    refs: cmdRefs,
    history: cmdHistory
  };
  const fn = map[cmd];
  if (!fn) fail(`未知命令: ${cmd}`);
  await fn(rest);
}

main().catch((err) => fail(err?.message || String(err)));
