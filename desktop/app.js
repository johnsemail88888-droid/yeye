const DATA_URL = "/design/data/desktop-apply-preview-summary.json";

const els = {
  statGrid: document.querySelector("[data-stat-grid]"),
  fileBadge: document.querySelector("[data-file-badge]"),
  sourcePill: document.querySelector("[data-source-pill]"),
  sourceCopy: document.querySelector("[data-source-copy]"),
  selectedLabel: document.querySelector("[data-selected-label]"),
  editorLines: document.querySelector("[data-editor-lines]"),
  findingList: document.querySelector("[data-finding-list]"),
  inlineHunk: document.querySelector("[data-inline-hunk]"),
  hunkTitle: document.querySelector("[data-hunk-title]"),
  removeLine: document.querySelector("[data-remove-line]"),
  addLine: document.querySelector("[data-add-line]"),
  previewCopy: document.querySelector("[data-preview-copy]"),
  previewMeter: document.querySelector("[data-preview-meter]"),
  eventList: document.querySelector("[data-event-list]")
};

const state = {
  data: null,
  selectedFindingId: null,
  pendingFindingId: null,
  accepted: new Set(),
  rejected: new Set()
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
      severity_counts: {},
      verify: {},
      findings: []
    };
  }
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const id = event.target.closest("[data-finding-id]")?.dataset.findingId;
    if (id) selectFinding(id);

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "open-hunk") openHunk();
    if (action === "accept-hunk") acceptHunk();
    if (action === "reject-hunk") rejectHunk();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && state.pendingFindingId) {
      event.preventDefault();
      acceptHunk();
    }
    if (event.key === "Escape" && state.pendingFindingId) {
      event.preventDefault();
      rejectHunk();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      acceptAllVisible();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === ".") {
      event.preventDefault();
      openHunk();
    }
  });
}

function render() {
  renderSource();
  renderStats();
  renderEditor();
  renderCards();
  renderHunk();
  renderPreview();
}

function renderSource() {
  const live = state.data.source_status.startsWith("LIVE");
  els.sourcePill.textContent = live ? "LIVE" : "MOCK";
  els.sourcePill.classList.toggle("live", live);
  els.sourcePill.classList.toggle("mock", !live);
  els.sourceCopy.textContent = state.data.source_detail;
}

function renderStats() {
  const counts = state.data.severity_counts || {};
  // from GET /api/state.project_id, run_id, verify.demo_ready, risk_map.findings
  els.statGrid.innerHTML = [
    stat("Project", state.data.project_id),
    stat("Run", state.data.run_id),
    stat("Findings", state.data.findings.length),
    stat("Critical", counts.critical ?? countSeverity("critical")),
    stat("High", counts.high ?? countSeverity("high")),
    stat("Demo ready", boolLabel(state.data.verify.demo_ready))
  ].join("");
  els.fileBadge.textContent = String(state.data.findings.length);
  els.selectedLabel.textContent = state.selectedFindingId || "none";
}

function renderEditor() {
  els.editorLines.innerHTML = state.data.findings.map((finding, index) => {
    const selected = finding.id === state.selectedFindingId;
    const accepted = state.accepted.has(finding.id);
    const rejected = state.rejected.has(finding.id);
    const label = finding.tool || finding.category || "finding";
    return `
      <div class="code-line ${selected ? "is-selected" : ""} ${accepted ? "is-accepted" : ""} ${rejected ? "is-rejected" : ""}" data-finding-id="${escapeHtml(finding.id)}" tabindex="0">
        <span class="line-no">M${index + 1}</span>
        <span class="code-text">${escapeHtml(finding.id)} ${escapeHtml(label)} // MOCK TODO exact file span</span>
        <button class="spark" type="button" data-finding-id="${escapeHtml(finding.id)}" aria-label="Preview ${escapeHtml(finding.id)}">*</button>
      </div>
    `;
  }).join("") || `<div class="code-line"><span class="line-no">--</span><span class="code-text">No live findings returned.</span></div>`;
}

function renderCards() {
  els.findingList.innerHTML = state.data.findings.map((finding) => {
    const selected = finding.id === state.selectedFindingId;
    const status = findingStatus(finding.id);
    const label = finding.tool || "no tool field";
    return `
      <li class="finding-card ${selected ? "is-selected" : ""}" data-finding-id="${escapeHtml(finding.id)}" tabindex="0">
        <div class="card-head">
          <div>
            <strong>${escapeHtml(finding.id)} ${escapeHtml(label)}</strong>
            <div class="meta">${escapeHtml(finding.category || "category unavailable")} - MOCK TODO file:line</div>
          </div>
          <span class="chip severity-${escapeHtml(finding.severity || "low")}">${escapeHtml(finding.severity || "unscored")}</span>
        </div>
        <p class="muted">${escapeHtml(finding.detail || "No detail field in state snapshot.")}</p>
        <div class="row-actions">
          <span class="pill live">real finding</span>
          <span class="pill mock">MOCK TODO patch</span>
          <span class="pill ${status.className}">${escapeHtml(status.label)}</span>
        </div>
      </li>
    `;
  }).join("") || `<li class="finding-card"><p class="muted">MOCK TODO empty state.</p></li>`;
}

function renderHunk() {
  const finding = currentFinding();
  const open = Boolean(state.pendingFindingId && finding);
  els.inlineHunk.classList.toggle("is-open", open);
  if (!open) return;
  const label = finding.tool || finding.category || "finding";
  els.hunkTitle.textContent = `${finding.id} pending hunk`;
  els.removeLine.textContent = `MOCK TODO remove unguarded ${label} path`;
  els.addLine.textContent = `MOCK TODO add explicit approval or guard check for ${label}`;
}

function renderPreview() {
  const accepted = state.accepted.size;
  const total = state.data.findings.length || 1;
  const percent = Math.round((accepted / total) * 100);
  els.previewMeter.style.setProperty("--meter", `${percent}%`);
  if (!accepted) {
    els.previewCopy.textContent = "No hunk accepted yet. Preview refresh is idle.";
  } else {
    els.previewCopy.textContent = `${accepted} local hunk${accepted === 1 ? "" : "s"} accepted. MOCK TODO preview refresh complete; no source writes.`;
  }
}

function selectFinding(id) {
  state.selectedFindingId = id;
  state.pendingFindingId = id;
  state.rejected.delete(id);
  log(`Selected ${id}; pending hunk opened.`);
  render();
}

function openHunk() {
  if (!state.selectedFindingId) return;
  state.pendingFindingId = state.selectedFindingId;
  state.rejected.delete(state.selectedFindingId);
  log(`Opened MOCK TODO hunk for ${state.selectedFindingId}.`);
  render();
}

function acceptHunk() {
  const id = state.pendingFindingId || state.selectedFindingId;
  if (!id) return;
  state.accepted.add(id);
  state.rejected.delete(id);
  state.pendingFindingId = null;
  log(`Accepted local hunk for ${id}. Source unchanged.`);
  render();
}

function rejectHunk() {
  const id = state.pendingFindingId || state.selectedFindingId;
  if (!id) return;
  state.rejected.add(id);
  state.accepted.delete(id);
  state.pendingFindingId = null;
  log(`Rejected local hunk for ${id}.`);
  render();
}

function acceptAllVisible() {
  state.data.findings.forEach((finding) => {
    state.accepted.add(finding.id);
    state.rejected.delete(finding.id);
  });
  state.pendingFindingId = null;
  log("Accepted all visible MOCK TODO hunks as local UI state.");
  render();
}

function currentFinding() {
  return state.data.findings.find((finding) => finding.id === state.pendingFindingId);
}

function findingStatus(id) {
  if (state.accepted.has(id)) return { label: "accepted local", className: "accepted" };
  if (state.rejected.has(id)) return { label: "rejected", className: "rejected" };
  if (state.pendingFindingId === id) return { label: "pending", className: "mock" };
  return { label: "not previewed", className: "" };
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
