const DATA_URL = "/design/data/desktop-hover-binding-summary.json";

const els = {
  statGrid: document.querySelector("[data-stat-grid]"),
  fileBadge: document.querySelector("[data-file-badge]"),
  sourcePill: document.querySelector("[data-source-pill]"),
  sourceCopy: document.querySelector("[data-source-copy]"),
  selectedLabel: document.querySelector("[data-selected-label]"),
  editorLines: document.querySelector("[data-editor-lines]"),
  cardList: document.querySelector("[data-card-list]"),
  eventList: document.querySelector("[data-event-list]"),
  editorScroll: document.querySelector("[data-editor-scroll]"),
  popover: document.querySelector("[data-popover]")
};

const state = {
  data: null,
  selectedFindingId: null,
  hoveredFindingId: null,
  flashFindingId: null
};

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
    if (!response.ok) throw new Error(`Snapshot returned ${response.status}`);
    return await response.json();
  } catch (error) {
    return {
      source_status: "MOCK TODO",
      source_detail: `Snapshot unavailable: ${error.message}`,
      project_id: "MOCK TODO",
      run_id: "MOCK TODO",
      verify: {},
      severity_counts: {},
      findings: []
    };
  }
}

function bindEvents() {
  document.addEventListener("pointerover", (event) => {
    const line = event.target.closest("[data-finding-line]");
    if (!line) return;
    showPopover(line.dataset.findingLine, line);
  });

  document.addEventListener("pointerout", (event) => {
    const line = event.target.closest("[data-finding-line]");
    if (line && !line.contains(event.relatedTarget)) hidePopover();
  });

  document.addEventListener("click", (event) => {
    const lineId = event.target.closest("[data-finding-line]")?.dataset.findingLine;
    if (lineId) selectFinding(lineId, "editor");

    const cardId = event.target.closest("[data-finding-card]")?.dataset.findingCard;
    if (cardId) selectFinding(cardId, "card");

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "next") stepSelection(1);
    if (action === "prev") stepSelection(-1);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      stepSelection(1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepSelection(-1);
    }
    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      focusSelected();
    }
  });
}

function render() {
  renderSource();
  renderStats();
  renderEditor();
  renderCards();
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
  const counts = state.data.severity_counts || {};
  // from GET /api/state.project_id, run_id, verify.demo_ready, risk_map.findings
  els.statGrid.innerHTML = [
    stat("Project", state.data.project_id),
    stat("Run", state.data.run_id),
    stat("Findings", findings.length),
    stat("Critical", counts.critical ?? countSeverity("critical")),
    stat("High", counts.high ?? countSeverity("high")),
    stat("Demo ready", boolLabel(state.data.verify.demo_ready))
  ].join("");
  els.fileBadge.textContent = String(findings.length);
  els.selectedLabel.textContent = state.selectedFindingId || "none";
}

function renderEditor() {
  els.editorLines.innerHTML = state.data.findings.map((finding, index) => {
    const selected = finding.id === state.selectedFindingId;
    const flashing = finding.id === state.flashFindingId;
    const label = finding.tool || finding.category || "finding";
    return `
      <div class="code-line ${selected ? "is-selected" : ""} ${flashing ? "is-flashing" : ""}"
        data-finding-line="${escapeHtml(finding.id)}"
        data-severity="${escapeHtml(finding.severity || "low")}"
        tabindex="0">
        <span class="line-no">M${index + 1}</span>
        <span class="gutter-dot" aria-hidden="true"></span>
        <span class="code-text"><span class="squiggle">${escapeHtml(finding.id)} ${escapeHtml(label)}</span> // MOCK TODO exact span from risk_map</span>
        <button class="spark" type="button" aria-label="Select ${escapeHtml(finding.id)}">*</button>
      </div>
    `;
  }).join("") || `<div class="code-line"><span class="line-no">--</span><span></span><span class="code-text">No live findings returned.</span></div>`;
}

function renderCards() {
  els.cardList.innerHTML = state.data.findings.map((finding) => {
    const selected = finding.id === state.selectedFindingId;
    const label = finding.tool || "no tool field";
    return `
      <li class="suggestion-card ${selected ? "is-selected" : ""}" data-finding-card="${escapeHtml(finding.id)}" tabindex="0">
        <div class="card-title">
          <div>
            <strong>${escapeHtml(finding.id)} ${escapeHtml(label)}</strong>
            <div class="meta">${escapeHtml(finding.category || "category unavailable")} - MOCK TODO file:line</div>
          </div>
          <span class="chip severity-${escapeHtml(finding.severity || "low")}">${escapeHtml(finding.severity || "unscored")}</span>
        </div>
        <p class="muted">${escapeHtml(finding.detail || "No detail field in state snapshot.")}</p>
        <div class="row-actions">
          <span class="pill live">real finding</span>
          <span class="pill mock">MOCK TODO span</span>
        </div>
        <div class="card-detail">
          <div class="mock-diff" aria-label="Mock patch preview">
            <div class="remove"><span>-</span><span>MOCK TODO risky call preview for ${escapeHtml(finding.id)}</span></div>
            <div class="add"><span>+</span><span>MOCK TODO guarded call preview. Bind to a real patch artifact before apply.</span></div>
          </div>
        </div>
      </li>
    `;
  }).join("") || `<li class="suggestion-card"><p class="muted">MOCK TODO empty state.</p></li>`;
}

function showPopover(id, anchor) {
  state.hoveredFindingId = id;
  const finding = findById(id);
  if (!finding) return;
  const rect = anchor.getBoundingClientRect();
  const popWidth = Math.min(384, window.innerWidth - 32);
  const left = Math.min(Math.max(rect.left + 56, 16), window.innerWidth - popWidth - 16);
  const top = Math.min(Math.max(rect.top - 18, 16), window.innerHeight - 190);
  els.popover.style.setProperty("--pop-left", `${left}px`);
  els.popover.style.setProperty("--pop-top", `${top}px`);
  els.popover.innerHTML = `
    <strong>${escapeHtml(finding.id)} ${escapeHtml(finding.category || "finding")}</strong>
    <span class="muted">${escapeHtml(finding.detail || "No detail field available.")}</span>
    <span class="pill mock">MOCK TODO exact code span</span>
  `;
  els.popover.classList.add("is-open");
}

function hidePopover() {
  state.hoveredFindingId = null;
  els.popover.classList.remove("is-open");
}

function selectFinding(id, source) {
  state.selectedFindingId = id;
  state.flashFindingId = id;
  render();
  focusSelected();
  log(`${source === "card" ? "Card" : "Editor"} selected ${id}; matching surface flashed.`);
  window.setTimeout(() => {
    state.flashFindingId = null;
    renderEditor();
  }, 900);
}

function stepSelection(delta) {
  const findings = state.data.findings;
  if (!findings.length) return;
  const current = findings.findIndex((finding) => finding.id === state.selectedFindingId);
  const next = (current + delta + findings.length) % findings.length;
  selectFinding(findings[next].id, "keyboard");
}

function focusSelected() {
  const id = state.selectedFindingId;
  document.querySelector(`[data-finding-line="${cssEscape(id)}"]`)?.scrollIntoView({ block: "center", inline: "nearest" });
  document.querySelector(`[data-finding-card="${cssEscape(id)}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function findById(id) {
  return state.data.findings.find((finding) => finding.id === id);
}

function countSeverity(severity) {
  return state.data.findings.filter((finding) => finding.severity === severity).length;
}

function stat(label, value) {
  return `<div class="stat"><span class="meta">${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "absent"))}</strong></div>`;
}

function boolLabel(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  return "absent";
}

function log(message) {
  const item = document.createElement("li");
  item.className = "event-row";
  item.innerHTML = `<span class="dot"></span><span>${escapeHtml(message)}</span>`;
  els.eventList.prepend(item);
  while (els.eventList.children.length > 4) {
    els.eventList.lastElementChild.remove();
  }
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
