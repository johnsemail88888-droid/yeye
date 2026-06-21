const DATA_URL = "/design/data/desktop-command-palette-summary.json";

const els = {
  statGrid: document.querySelector("[data-stat-grid]"),
  fileBadge: document.querySelector("[data-file-badge]"),
  sourcePill: document.querySelector("[data-source-pill]"),
  sourceCopy: document.querySelector("[data-source-copy]"),
  editorLines: document.querySelector("[data-editor-lines]"),
  findingList: document.querySelector("[data-finding-list]"),
  eventList: document.querySelector("[data-event-list]"),
  paletteBackdrop: document.querySelector("[data-palette-backdrop]"),
  paletteInput: document.querySelector("[data-palette-input]"),
  commandList: document.querySelector("[data-command-list]"),
  suggestionsPanel: document.querySelector("[data-suggestions-panel]"),
  diffPreview: document.querySelector("[data-diff-preview]"),
  editorScroll: document.querySelector("[data-editor-scroll]")
};

const state = {
  data: null,
  selectedFindingId: null,
  paletteOpen: false,
  paletteIndex: 0,
  paletteQuery: "",
  patchOpen: false,
  suggestionsOpen: true
};

const commands = [
  {
    id: "quick-fix",
    group: "Fix",
    title: "Quick Fix selected finding",
    detail: "Open the gated MOCK TODO patch preview for the selected real finding.",
    shortcut: "Cmd/Ctrl+.",
    run: () => previewPatch()
  },
  {
    id: "accept-hunk",
    group: "Patch",
    title: "Accept hunk",
    detail: "Accept the local preview hunk. Prototype state only, no source write.",
    shortcut: "Tab",
    run: () => acceptHunk()
  },
  {
    id: "reject-hunk",
    group: "Patch",
    title: "Reject hunk",
    detail: "Close the local patch preview without changing source.",
    shortcut: "Esc",
    run: () => rejectHunk()
  },
  {
    id: "toggle-suggestions",
    group: "Layout",
    title: "Toggle suggestions panel",
    detail: "Collapse or restore the right-hand recommendations pane.",
    shortcut: "Cmd/Ctrl+Alt+B",
    run: () => toggleSuggestions()
  },
  {
    id: "focus-finding",
    group: "Navigate",
    title: "Focus selected finding",
    detail: "Scroll the selected MOCK TODO editor span and matching card into view.",
    shortcut: "F",
    run: () => focusFinding()
  }
];

init();

async function init() {
  state.data = await loadData();
  state.selectedFindingId = state.data.findings[0]?.id || null;
  render();
  bindEvents();
}

async function loadData() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`State snapshot returned ${response.status}`);
    return await response.json();
  } catch (error) {
    return {
      source_status: "MOCK TODO",
      source_detail: `Snapshot unavailable: ${error.message}`,
      project_id: "MOCK TODO",
      run_id: "MOCK TODO",
      live_scan_run_id: "MOCK TODO",
      verify: {},
      findings: []
    };
  }
}

function render() {
  renderSource();
  renderStats();
  renderEditor();
  renderFindings();
  renderCommands();
}

function renderSource() {
  const live = state.data.source_status.startsWith("LIVE");
  els.sourcePill.textContent = live ? "LIVE" : "MOCK";
  els.sourcePill.classList.toggle("live", live);
  els.sourcePill.classList.toggle("mock", !live);
  els.sourceCopy.textContent = state.data.source_detail;
}

function renderStats() {
  const findings = state.data.findings;
  const total = findings.length;
  const critical = countSeverity("critical");
  const high = countSeverity("high");
  const ready = boolLabel(state.data.verify.demo_ready);
  // from GET /api/state.project_id, run_id, risk_map.findings, verify.demo_ready
  els.statGrid.innerHTML = [
    stat("Project", state.data.project_id),
    stat("Run", state.data.run_id),
    stat("Findings", total),
    stat("Critical", critical),
    stat("High", high),
    stat("Demo ready", ready)
  ].join("");
  els.fileBadge.textContent = String(total);
}

function renderEditor() {
  const rows = state.data.findings.map((finding, index) => {
    const selected = finding.id === state.selectedFindingId;
    const severityClass = severityToLineClass(finding.severity);
    const tool = finding.tool || finding.category || "finding";
    const title = `${finding.id}: ${tool}`;
    return `
      <div class="code-line risk-line ${severityClass} ${selected ? "is-selected" : ""}" data-finding-line="${escapeHtml(finding.id)}">
        <span class="line-no">M${index + 1}</span>
        <span class="code-text">${escapeHtml(title)} // MOCK TODO span, real file/line absent from /api/state</span>
        <button class="spark" type="button" data-lightbulb="${escapeHtml(finding.id)}" title="Quick fix ${escapeHtml(finding.id)}" aria-label="Quick fix ${escapeHtml(finding.id)}">*</button>
      </div>
    `;
  });
  els.editorLines.innerHTML = rows.join("") || emptyRow("No findings returned by the live state snapshot.");
  els.diffPreview.classList.toggle("is-open", state.patchOpen);
}

function renderFindings() {
  const rows = state.data.findings.map((finding) => {
    const selected = finding.id === state.selectedFindingId;
    const severityClass = `severity-${finding.severity || "low"}`;
    const tool = finding.tool || "no tool field";
    return `
      <li class="finding-card ${selected ? "is-selected" : ""}" data-finding-card="${escapeHtml(finding.id)}" tabindex="0">
        <div class="finding-head">
          <div class="finding-title">
            <strong>${escapeHtml(finding.id)} ${escapeHtml(tool)}</strong>
            <span class="meta">${escapeHtml(finding.category || "category unavailable")}</span>
          </div>
          <span class="chip ${severityClass}">${escapeHtml(finding.severity || "unscored")}</span>
        </div>
        <p class="muted">${escapeHtml(finding.detail || "No detail field in state snapshot.")}</p>
        <div class="row-actions">
          <span class="pill live">real finding</span>
          <span class="pill mock">MOCK TODO patch</span>
        </div>
      </li>
    `;
  });
  els.findingList.innerHTML = rows.join("") || `<li class="finding-card"><p class="muted">MOCK TODO empty state. No live findings were returned.</p></li>`;
}

function renderCommands() {
  const filtered = filteredCommands();
  if (state.paletteIndex >= filtered.length) state.paletteIndex = Math.max(0, filtered.length - 1);
  els.commandList.innerHTML = filtered.map((command, index) => `
    <li class="command-row ${index === state.paletteIndex ? "is-active" : ""}" data-command-row="${escapeHtml(command.id)}">
      <span class="command-copy">
        <strong>${escapeHtml(command.title)}</strong>
        <span>${escapeHtml(command.detail)}</span>
      </span>
      <span class="shortcut">${escapeHtml(command.shortcut)}</span>
    </li>
  `).join("") || `<li class="command-row"><span class="command-copy"><strong>No commands</strong><span>Try a different search.</span></span></li>`;
}

function filteredCommands() {
  const query = state.paletteQuery.trim().toLowerCase();
  if (!query) return commands;
  return commands.filter((command) => {
    return `${command.group} ${command.title} ${command.detail} ${command.shortcut}`.toLowerCase().includes(query);
  });
}

function bindEvents() {
  document.addEventListener("keydown", handleKeys);
  document.querySelector("[data-open-palette]").addEventListener("click", () => openPalette());
  document.addEventListener("click", (event) => {
    const commandId = event.target.closest("[data-command]")?.dataset.command;
    if (commandId) runCommand(commandId);

    const lightbulbId = event.target.closest("[data-lightbulb]")?.dataset.lightbulb;
    if (lightbulbId) {
      selectFinding(lightbulbId);
      runCommand("quick-fix");
    }

    const cardId = event.target.closest("[data-finding-card]")?.dataset.findingCard;
    if (cardId) selectFinding(cardId);

    const rowCommandId = event.target.closest("[data-command-row]")?.dataset.commandRow;
    if (rowCommandId) runCommand(rowCommandId);

    if (event.target === els.paletteBackdrop) closePalette();
  });
  els.paletteInput.addEventListener("input", () => {
    state.paletteQuery = els.paletteInput.value;
    state.paletteIndex = 0;
    renderCommands();
  });
}

function handleKeys(event) {
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && key === "k") {
    event.preventDefault();
    openPalette();
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key === ".") {
    event.preventDefault();
    runCommand("quick-fix");
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.altKey && key === "b") {
    event.preventDefault();
    runCommand("toggle-suggestions");
    return;
  }
  if (!state.paletteOpen && key === "f") {
    event.preventDefault();
    runCommand("focus-finding");
    return;
  }
  if (!state.paletteOpen && event.key === "Tab" && state.patchOpen) {
    event.preventDefault();
    runCommand("accept-hunk");
    return;
  }
  if (!state.paletteOpen && event.key === "Escape" && state.patchOpen) {
    event.preventDefault();
    runCommand("reject-hunk");
    return;
  }
  if (!state.paletteOpen) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    movePalette(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    movePalette(-1);
  } else if (event.key === "Enter") {
    event.preventDefault();
    const command = filteredCommands()[state.paletteIndex];
    if (command) runCommand(command.id);
  } else if (event.key === "Escape") {
    event.preventDefault();
    closePalette();
  }
}

function openPalette() {
  state.paletteOpen = true;
  state.paletteQuery = "";
  state.paletteIndex = 0;
  els.paletteBackdrop.classList.add("is-open");
  els.paletteBackdrop.setAttribute("aria-hidden", "false");
  els.paletteInput.value = "";
  renderCommands();
  window.setTimeout(() => els.paletteInput.focus(), 0);
}

function closePalette() {
  state.paletteOpen = false;
  els.paletteBackdrop.classList.remove("is-open");
  els.paletteBackdrop.setAttribute("aria-hidden", "true");
}

function movePalette(delta) {
  const max = filteredCommands().length - 1;
  state.paletteIndex = Math.min(Math.max(state.paletteIndex + delta, 0), Math.max(max, 0));
  renderCommands();
}

function runCommand(commandId) {
  const command = commands.find((item) => item.id === commandId);
  if (!command) return;
  command.run();
  closePalette();
  render();
}

function previewPatch() {
  const finding = currentFinding();
  state.patchOpen = true;
  logEvent(`Opened MOCK TODO patch preview for ${finding?.id || "no selected finding"}. No file writes.`);
}

function acceptHunk() {
  const finding = currentFinding();
  state.patchOpen = false;
  logEvent(`Accepted local preview hunk for ${finding?.id || "no selected finding"}. Source unchanged.`);
}

function rejectHunk() {
  const finding = currentFinding();
  state.patchOpen = false;
  logEvent(`Rejected local preview hunk for ${finding?.id || "no selected finding"}.`);
}

function toggleSuggestions() {
  state.suggestionsOpen = !state.suggestionsOpen;
  els.suggestionsPanel.classList.toggle("is-collapsed", !state.suggestionsOpen);
  logEvent(`${state.suggestionsOpen ? "Restored" : "Collapsed"} suggestions panel.`);
}

function focusFinding() {
  const id = state.selectedFindingId;
  const line = document.querySelector(`[data-finding-line="${cssEscape(id)}"]`);
  const card = document.querySelector(`[data-finding-card="${cssEscape(id)}"]`);
  line?.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  card?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  logEvent(`Focused selected finding ${id || "none"}.`);
}

function selectFinding(id) {
  state.selectedFindingId = id;
  state.patchOpen = false;
  logEvent(`Selected ${id}.`);
  render();
}

function currentFinding() {
  return state.data.findings.find((finding) => finding.id === state.selectedFindingId);
}

function logEvent(message) {
  const item = document.createElement("li");
  item.className = "event-row";
  item.innerHTML = `<span class="dot"></span><span>${escapeHtml(message)}</span>`;
  els.eventList.prepend(item);
  while (els.eventList.children.length > 4) {
    els.eventList.lastElementChild.remove();
  }
}

function countSeverity(severity) {
  return state.data.findings.filter((finding) => finding.severity === severity).length;
}

function stat(label, value) {
  return `<div class="stat"><span class="meta">${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "absent"))}</strong></div>`;
}

function emptyRow(message) {
  return `<div class="code-line"><span class="line-no">--</span><span class="code-text">${escapeHtml(message)}</span></div>`;
}

function severityToLineClass(severity) {
  if (severity === "high") return "is-high";
  if (severity === "medium") return "is-medium";
  if (severity === "low") return "is-low";
  return "";
}

function boolLabel(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  return "absent";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cssEscape(value) {
  if (window.CSS && CSS.escape) return CSS.escape(String(value || ""));
  return String(value || "").replaceAll('"', '\\"');
}
