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
let activeInput: HTMLElement | null = null;

const state = {
  cwd: "~/site",
};

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

function blank(): void {
  const div = document.createElement("div");
  div.className = "blank";
  terminalScreen.appendChild(div);
  scrollBottom();
}

function scrollBottom(): void {
  terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

function focusInput(): void {
  if (!activeInput) return;
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

function resetTerminal(command?: string): void {
  terminalScreen.innerHTML = "";
  activeInput = null;
  line("Welcome to loganmesh.com.", "green");
  line(`Type ${cmdButton("help")} or tap a command below.`, "dim");
  blank();
  appendPrompt();
  const commandToRun = command || "about";
  setCurrentCommand(commandToRun);
  executeCommand(commandToRun);
}

function initializeTerminal(): void {
  const initialCommand = new URLSearchParams(window.location.search).get("cmd") || undefined;
  resetTerminal(initialCommand);
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
    ["about", "print a message about myself"],
    ["projects", "list project entries"],
    ["blog", "list blog post entries"],
    ["open [project]", "preview a project or blog post"],
    ["contact", "show contact links"],
    ["clear", "clear terminal"],
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
  line(`${color("#", "faint")} ${color("Logan Mesh", "yellow")}`);
  line(`${color("role", "cyan")}         Incoming SWE Intern @ ${color("Bloomberg", "white")} | Math + CS @ ${color("UF", "orange")}`);
  line(`${color("interests", "cyan")}    Software engineering, quant dev & research, mathematics`);
  line(`${color("contact", "cyan")}      ${link("mailto:loganmesh91@gmail.com", "loganmesh91@gmail.com")}  ${link("https://github.com/lmesh91", "github.com/lmesh91")}  ${link("https://www.linkedin.com/in/lmesh/", "linkedin.com/in/lmesh")}`);
  line("");

  line(`${color("##", "faint")} ${color("Summary", "yellow")}`);
  line("I am a sophomore seeking a math and computer science degree at the University of Florida.");
  line("I love working on interesting problems at the intersection of math, computing, and/or finance.");
  line("");

  line(`${color("##", "faint")} ${color("Education", "yellow")}`);
  line(`${color("University of Florida", "cyan")}  Class of 2029, Math + CS double major`);
  line(`${color("Honors", "cyan")}                 4.0 GPA, Dean's List, President's Honor Roll`);
  line("");

  line(`${color("##", "faint")} ${color("Experience", "yellow")}`);
  line(`${color("Bloomberg", "cyan")}              Software Engineering Intern, New York City`);
  line("Professional software engineering in a high-throughput financial technology environment.");
  line("");

  line(`${color("##", "faint")} ${color("Awards", "yellow")}`);
  line(`${color("Putnam", "cyan")}                 24 / 120, top 14% of participants`);
  line(`${color("SCUDEM X", "cyan")}               Outstanding Prize Winner team`);
  line(`${color("M3 Challenge", "cyan")}           Semifinalist team, top 2% of 655 US/UK teams`);
  line("");

  line(`${color("##", "faint")} ${color("Projects", "yellow")}`);
  line(`${link("/projects/leantex", "LeanTeX")}                Convert proofs written in Lean 4 to natural language.`);
  line("");

  line(`${color("See more:", "green")}  ${cmdButton("projects")}  ${cmdButton("blog")}  ${cmdButton("contact")}`);
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
  line(`Tap a slug or type ${cmdButton(`open ${entries[0].slug}`)}.`, "dim");
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
  line(`Tap a slug or type ${cmdButton(`open ${entries[0].slug}`)}.`, "dim");
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
    case "clear":
      terminalScreen.innerHTML = "";
      activeInput = null;
      renderCommandPalette();
      break;
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
  if (!activeInput || document.activeElement === activeInput) return;
  if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
    focusInput();
  }
});

initializeTerminal();
