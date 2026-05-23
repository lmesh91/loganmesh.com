type TerminalItem = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  draft: boolean;
  date?: string;
  status?: string;
  featured?: boolean;
  url: string;
  type: "blog" | "project";
};

type TerminalData = {
  blog: TerminalItem[];
  projects: TerminalItem[];
};

export {};

const terminalRoot = document.getElementById("screen") as HTMLElement | null;
const dataEl = document.getElementById("terminal-data");

if (!terminalRoot || !dataEl?.textContent) {
  throw new Error("Terminal root or data payload is missing.");
}

const terminalScreen = terminalRoot;
const terminalData = JSON.parse(dataEl.textContent) as TerminalData;

let commandHistory: string[] = [];
let historyIndex = -1;
let booting = false;
let activeInput: HTMLElement | null = null;

const state = {
  cwd: "~/site",
};

const logo = `░██                                                        ░███     ░███                       ░██        
░██                                                        ░████   ░████                       ░██        
░██          ░███████   ░████████  ░██████   ░████████     ░██░██ ░██░██  ░███████   ░███████  ░████████  
░██         ░██    ░██ ░██    ░██       ░██  ░██    ░██    ░██ ░████ ░██ ░██    ░██ ░██        ░██    ░██ 
░██         ░██    ░██ ░██    ░██  ░███████  ░██    ░██    ░██  ░██  ░██ ░█████████  ░███████  ░██    ░██ 
░██         ░██    ░██ ░██   ░███ ░██   ░██  ░██    ░██    ░██       ░██ ░██               ░██ ░██    ░██ 
░██████████  ░███████   ░█████░██  ░█████░██ ░██    ░██    ░██       ░██  ░███████   ░███████  ░██    ░██ 
                              ░██                                                                         
                        ░███████                                                                          
                                                                                                          `;

const bootLines = [
  { text: "loganmesh kernel 0.1.0-terminal #1 SMP static-site", cls: "green", delay: 80 },
  { text: "Command line: root=/dev/site theme=terminal interactive=1 cards=0 inputbar=0", cls: "dim", delay: 90 },
  { text: "[    0.000000] boot: initializing loganmesh.com", cls: "", delay: 95 },
  { text: "[    0.041112] font: Departure Mono requested; local webfont hook checked", cls: "", delay: 80 },
  { text: "[    0.083821] content: loading markdown collections blog, projects", cls: "", delay: 75 },
  { text: "[    0.121449] input: inline editable shell prompt attached", cls: "", delay: 80 },
  { text: "[    0.160700] mobile: clickable terminal commands enabled", cls: "", delay: 90 },
  { text: "[    0.211004] robots: noindex until SITE_PUBLIC_READY=true", cls: "", delay: 70 },
  { text: "[    0.287110] status: ready", cls: "green", delay: 110 },
];

function escapeHTML(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function color(text: string, cls: string): string {
  return `<span class="${cls}">${escapeHTML(text)}</span>`;
}

function cmdButton(command: string, label = command): string {
  return `<button class="terminal-command" type="button" data-command="${escapeHTML(command)}">${escapeHTML(label)}</button>`;
}

function link(url: string, label: string): string {
  return `<a class="terminal-link" href="${escapeHTML(url)}">${escapeHTML(label)}</a>`;
}

function line(text = "", cls = ""): HTMLElement {
  const div = document.createElement("div");
  div.className = `line ${cls}`;
  div.innerHTML = text;
  terminalScreen.appendChild(div);
  scrollBottom();
  return div;
}

function pre(text = "", cls = ""): HTMLElement {
  const el = document.createElement("pre");
  el.className = `ascii-logo ${cls}`;
  el.textContent = text;
  terminalScreen.appendChild(el);
  scrollBottom();
  return el;
}

function blank(): void {
  const div = document.createElement("div");
  div.className = "blank";
  terminalScreen.appendChild(div);
  scrollBottom();
}

function scrollBottom(): void {
  terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function focusInput(): void {
  if (!activeInput || booting) return;
  activeInput.focus({ preventScroll: true });
  placeCaretEnd(activeInput);
}

function placeCaretEnd(el: HTMLElement): void {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function currentCommandText(): string {
  return activeInput ? activeInput.textContent?.replace(/\u00a0/g, " ").replace(/\u200B/g, "") ?? "" : "";
}

function setCurrentCommand(text: string): void {
  if (!activeInput) return;
  activeInput.textContent = text || "\u200B";
  placeCaretEnd(activeInput);
}

function appendPrompt(): void {
  const row = document.createElement("div");
  row.className = "line input-line";
  row.innerHTML =
    `<span class="prompt">guest@loganmesh</span>` +
    `<span>:<span class="cwd">${state.cwd}</span>$&nbsp;</span>` +
    `<span class="current-input" contenteditable="true" spellcheck="false" autocapitalize="none" role="textbox" aria-label="Terminal command input"></span>`;
  terminalScreen.appendChild(row);
  activeInput = row.querySelector(".current-input");
  activeInput!.textContent = "\u200B";
  activeInput!.addEventListener("keydown", handleInputKeydown);
  activeInput!.addEventListener("paste", handlePaste);
  scrollBottom();
  focusInput();
}

function freezePrompt(commandText: string): void {
  const text = String(commandText || "").replace(/\u200B/g, "");
  if (!activeInput) return;
  const row = activeInput.closest(".input-line");
  if (!row) return;
  row.innerHTML =
    `<span class="prompt">guest@loganmesh</span>` +
    `<span>:<span class="cwd">${state.cwd}</span>$&nbsp;</span>` +
    `<span class="cmdtext">${escapeHTML(text)}</span>`;
  activeInput = null;
}

async function bootSequence(): Promise<void> {
  booting = true;
  if (activeInput) activeInput.setAttribute("contenteditable", "false");
  terminalScreen.innerHTML = "";
  activeInput = null;

  for (const row of bootLines) {
    await sleep(row.delay);
    line(escapeHTML(row.text), row.cls);
  }

  blank();
  pre(logo, "green");

  await sleep(120);
  line("Welcome to loganmesh.com.", "green");
  line(`Type ${color("help", "cyan")} or tap a command below.`, "dim");
  renderCommandPalette();
  blank();

  booting = false;
  appendPrompt();

  const initialCommand = new URLSearchParams(window.location.search).get("cmd");
  if (initialCommand) {
    setCurrentCommand(initialCommand);
    executeCommand(initialCommand);
  }
}

function renderCommandPalette(): void {
  line('<span class="green">clickable commands:</span>');
  line(
    [
      cmdButton("help"),
      cmdButton("about"),
      cmdButton("projects"),
      cmdButton("blog"),
      cmdButton("contact"),
      cmdButton("uname"),
      cmdButton("clear"),
      cmdButton("reboot"),
    ].join("  "),
    "command-palette",
  );
}

function help(): void {
  line("Available commands:", "green");
  const wrapper = document.createElement("div");
  wrapper.className = "command-list";
  const rows = [
    ["help", "show this command list"],
    ["about", "print public identity placeholder"],
    ["projects", "list project markdown entries"],
    ["blog", "list blog markdown entries"],
    ["open project-alpha", "preview a project or blog slug"],
    ["contact", "show contact links"],
    ["uname", "print site kernel"],
    ["clear", "clear terminal"],
    ["reboot", "replay boot sequence"],
  ];

  for (const [cmd, desc] of rows) {
    const b = document.createElement("button");
    b.className = "terminal-command";
    b.type = "button";
    b.dataset.command = cmd;
    b.textContent = cmd;
    const d = document.createElement("span");
    d.className = "dim";
    d.textContent = desc;
    wrapper.appendChild(b);
    wrapper.appendChild(d);
  }

  terminalScreen.appendChild(wrapper);
  scrollBottom();
}

function about(): void {
  [
    ["name", "Logan Mesh"],
    ["site", "loganmesh.com"],
    ["summary", "Placeholder intro. Replace this with a compact statement of what you build, study, and write about."],
    ["status", "preview-only static site; deployment intentionally disabled"],
  ].forEach(([key, value]) => {
    line(`${color(key.padEnd(10), "cyan")}${escapeHTML(value)}`);
  });
}

function projects(): void {
  const entries = terminalData.projects;
  line("slug                 status      title", "green");
  line("----                 ------      -----", "faint");
  if (!entries.length) {
    line("No published project entries. Mark a project draft: false to list it.", "dim");
    return;
  }
  entries.forEach((item) => {
    line(`${cmdButton(`open ${item.slug}`, item.slug.padEnd(21))}${escapeHTML((item.status ?? "unknown").padEnd(12))}${escapeHTML(item.title)}`);
  });
  line("");
  line(`Tap a slug or type ${color(`open ${entries[0].slug}`, "cyan")}.`, "dim");
}

function blog(): void {
  const entries = terminalData.blog;
  line("date        slug                 title", "green");
  line("----        ----                 -----", "faint");
  if (!entries.length) {
    line("No published blog entries. Mark a post draft: false to list it.", "dim");
    return;
  }
  entries.forEach((item) => {
    line(`${escapeHTML(item.date ?? "undated")}  ${cmdButton(`open ${item.slug}`, item.slug.padEnd(21))}${escapeHTML(item.title)}`);
  });
  line("");
  line(`Tap a slug or type ${color(`open ${entries[0].slug}`, "cyan")}.`, "dim");
}

function findEntry(slug: string): TerminalItem | undefined {
  return [...terminalData.projects, ...terminalData.blog].find((item) => item.slug === slug);
}

function openEntry(slug: string): void {
  const item = findEntry(slug);
  if (!item) {
    line(`open: no project or blog slug '${escapeHTML(slug || "")}'`, "red");
    line(`Try ${cmdButton("projects")} or ${cmdButton("blog")}.`, "dim");
    return;
  }

  line(`# ${escapeHTML(item.title)}`, "yellow");
  line(`type:     ${item.type}`);
  if (item.date) line(`date:     ${escapeHTML(item.date)}`);
  if (item.status) line(`status:   ${escapeHTML(item.status)}`);
  line(`tags:     ${escapeHTML(item.tags.join(", ") || "none")}`);
  line("");
  line(escapeHTML(item.description));
  line("");
  line(`full:     ${link(item.url, item.url)}`);
}

function contact(): void {
  line(`email:     ${link("mailto:loganmesh91@gmail.com", "loganmesh91@gmail.com")}`);
  line(`github:    ${link("https://github.com/lmesh91", "github.com/lmesh91")}`);
  line(`linkedin:  ${link("https://www.linkedin.com/in/lmesh/", "linkedin.com/in/lmesh")}`);
}

function unknown(cmd: string): void {
  line(`bash: ${escapeHTML(cmd.split(" ")[0] || "")}: command not found`, "red");
  line(`Run ${cmdButton("help")} for available commands.`, "dim");
}

function executeCommand(raw: string): void {
  if (booting) return;
  const cmd = raw.trim();
  if (!cmd) {
    freezePrompt("");
    appendPrompt();
    return;
  }

  freezePrompt(cmd);
  commandHistory.push(cmd);
  historyIndex = commandHistory.length;

  const parts = cmd.toLowerCase().split(/\s+/);
  const main = parts[0];

  switch (main) {
    case "help":
      help();
      break;
    case "about":
      about();
      break;
    case "projects":
      projects();
      break;
    case "blog":
      blog();
      break;
    case "contact":
      contact();
      break;
    case "uname":
      line("loganmesh 0.1.0-terminal astro-static interactive x86_64");
      break;
    case "clear":
      terminalScreen.innerHTML = "";
      activeInput = null;
      renderCommandPalette();
      break;
    case "reboot":
      void bootSequence();
      return;
    case "open":
      openEntry(parts[1] ?? "");
      break;
    default:
      unknown(cmd);
  }

  if (main !== "clear") blank();
  appendPrompt();
}

function runClickedCommand(cmd: string): void {
  if (booting) return;
  if (!activeInput) appendPrompt();
  setCurrentCommand(cmd);
  executeCommand(cmd);
}

function handleInputKeydown(e: KeyboardEvent): void {
  if (e.key === "Enter") {
    e.preventDefault();
    executeCommand(currentCommandText());
  } else if (e.key === "ArrowUp") {
    if (!commandHistory.length) return;
    e.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    setCurrentCommand(commandHistory[historyIndex] || "");
  } else if (e.key === "ArrowDown") {
    if (!commandHistory.length) return;
    e.preventDefault();
    historyIndex = Math.min(commandHistory.length, historyIndex + 1);
    setCurrentCommand(commandHistory[historyIndex] || "");
  }
}

function handlePaste(e: ClipboardEvent): void {
  e.preventDefault();
  const text = (e.clipboardData || (window as Window & { clipboardData?: DataTransfer }).clipboardData)?.getData("text/plain") ?? "";
  document.execCommand("insertText", false, text.replace(/\r?\n/g, " "));
}

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest<HTMLElement>("[data-command]");
  if (btn) {
    const cmd = btn.getAttribute("data-command");
    if (cmd) runClickedCommand(cmd);
    return;
  }
  if (terminalScreen.contains(target)) focusInput();
});

terminalScreen.addEventListener("keydown", (e: KeyboardEvent) => {
  if (!activeInput || document.activeElement === activeInput || booting) return;
  if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
    focusInput();
  }
});

void bootSequence();
