const STATE_URL = "/design/data/extension-export-packet-1002-summary.json";

const els = {
  sourceLine: document.querySelector("[data-source-line]"),
  totalBadge: document.querySelector("[data-total-badge]"),
  scanCards: document.querySelector("[data-scan-cards]"),
  summaryGrid: document.querySelector("[data-summary-grid]"),
  filterTabs: document.querySelector("[data-filter-tabs]"),
  findingList: document.querySelector("[data-finding-list]"),
  statusLine: document.querySelector("[data-status-line]"),
  packetTitle: document.querySelector("[data-packet-title]"),
  destinationTitle: document.querySelector("[data-destination-title]"),
  destinationCopy: document.querySelector("[data-destination-copy]"),
  artifactList: document.querySelector("[data-artifact-list]"),
  jsonPreview: document.querySelector("[data-json-preview]"),
  commandMenu: document.querySelector("[data-command-menu]"),
  commandSearch: document.querySelector("[data-command-search]"),
  commandList: document.querySelector("[data-command-list]")
};

const ui = {
  data: null,
  scanMode: "quick",
  filter: "all",
  destination: "local",
  included: new Set(),
  lastAction: "Ready to assemble packet."
};

const scanModes = [
  ["quick", "Quick Scan", "Passive findings packet."],
  ["active", "Active Probe", "Would include canary traces when exposed."],
  ["deep", "Deep Scan", "Would include body evidence when exposed."]
];

const filters = [
  ["all", "All"],
  ["critical", "Critical"],
  ["high", "High"],
  ["included", "Included"]
];

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "type") node.type = value;
    else if (key.startsWith("data-")) node.setAttribute(key, value);
    else if (key.startsWith("aria-")) node.setAttribute(key, value);
    else if (key === "title") node.title = value;
    else if (value !== null && value !== undefined) node.setAttribute(key, value);
  });
  children.forEach((child) => node.append(child));
  return node;
}

function render() {
  els.sourceLine.textContent = `${ui.data.source_status} - ${ui.data.project_id} / ${ui.data.run_id}`;
  els.totalBadge.textContent = String(ui.data.finding_count);
  renderScanCards();
  renderSummary();
  renderFilters();
  renderFindings();
  renderPacket();
  renderCommands();
}

function renderScanCards() {
  els.scanCards.replaceChildren(...scanModes.map(([id, title, copy]) => {
    const card = h("button", {
      class: "scan-card",
      type: "button",
      "data-scan-mode": id,
      "data-active": ui.scanMode === id ? "true" : "false"
    }, [
      h("span", { class: "title", text: title }),
      h("span", { class: "subtitle", text: copy }),
      h("span", { class: "chip", "data-tone": id === "quick" ? "low" : "mock", text: id === "quick" ? "real state" : "TODO evidence" })
    ]);
    card.addEventListener("click", () => {
      ui.scanMode = id;
      ui.lastAction = `${title} selected for packet framing.`;
      render();
    });
    return card;
  }));
}

function renderSummary() {
  const counts = ui.data.severity_counts;
  const cards = [
    ["Selected", String(ui.included.size), "local UI state"],
    ["Findings", String(ui.data.finding_count), "risk_map.findings"],
    ["Critical", String(counts.critical || 0), "real severity count"],
    ["Evidence refs", String(ui.data.evidence_files.length), "verify.evidence_files"]
  ];
  els.summaryGrid.replaceChildren(...cards.map(([label, value, note]) => h("article", { class: "metric-card" }, [
    h("span", { class: "metric-label", text: label }),
    h("span", { class: "metric-value", text: value }),
    h("span", { class: "subtitle", text: note })
  ])));
}

function renderFilters() {
  els.filterTabs.replaceChildren(...filters.map(([id, label]) => {
    const count = filteredFindings(id).length;
    const button = h("button", {
      class: "tab-button",
      type: "button",
      "data-filter": id,
      "data-active": ui.filter === id ? "true" : "false"
    }, [
      h("span", { text: label }),
      h("span", { class: "badge", text: String(count) })
    ]);
    button.addEventListener("click", () => {
      ui.filter = id;
      renderFilters();
      renderFindings();
    });
    return button;
  }));
}

function filteredFindings(filter = ui.filter) {
  return ui.data.findings.filter((finding) => {
    if (filter === "included") return ui.included.has(finding.id);
    if (filter === "all") return true;
    return finding.severity === filter;
  });
}

function renderFindings() {
  els.findingList.replaceChildren(...filteredFindings().map((finding) => {
    const included = ui.included.has(finding.id);
    const subject = finding.tool || finding.category;
    const row = h("article", { class: "finding-row", "data-finding-id": finding.id }, [
      h("button", {
        class: "include-toggle",
        type: "button",
        "data-included": included ? "true" : "false",
        "aria-label": included ? `Remove ${finding.id}` : `Include ${finding.id}`,
        text: included ? "In" : "Out"
      }),
      h("span", { class: "finding-copy" }, [
        h("span", { class: "finding-title", text: `${finding.id} - ${subject}` }),
        h("span", { class: "finding-meta", text: `${finding.category} - ${finding.detail}` }),
        h("span", { class: "chip", "data-tone": "mock", text: "Confidence TODO" })
      ]),
      h("span", { class: "chip", "data-tone": finding.severity, text: finding.severity })
    ]);
    row.querySelector("button").addEventListener("click", () => toggleFinding(finding.id));
    return row;
  }));
}

function toggleFinding(id) {
  if (ui.included.has(id)) ui.included.delete(id);
  else ui.included.add(id);
  ui.lastAction = `${id} ${ui.included.has(id) ? "included" : "removed"} from local packet.`;
  render();
}

function includeAllVisible() {
  filteredFindings().forEach((finding) => ui.included.add(finding.id));
  ui.lastAction = "Visible findings added to local packet.";
  render();
}

function clearIncluded() {
  ui.included.clear();
  ui.lastAction = "Local packet cleared.";
  render();
}

function packetPayload() {
  return {
    packet_type: "local_review_packet",
    source: "GET /api/state",
    project_id: ui.data.project_id,
    run_id: ui.data.run_id,
    live_scan_run_id: ui.data.live_scan_run_id,
    scan_mode_frame: ui.scanMode,
    destination: ui.destination,
    destination_status: ui.destination === "phoenix" ? "TODO local fallback - no Phoenix artifact exposed" : "local preview only",
    included_findings: ui.data.findings.filter((finding) => ui.included.has(finding.id)),
    evidence_files: ui.data.evidence_files,
    omitted_fields: ui.data.mock_todo
  };
}

function renderPacket() {
  const selected = ui.included.size;
  els.packetTitle.textContent = `${selected} findings selected`;
  els.statusLine.textContent = ui.lastAction;
  els.destinationTitle.textContent = ui.destination === "phoenix" ? "Phoenix handoff TODO" : "Local JSON packet";
  els.destinationCopy.textContent = ui.destination === "phoenix"
    ? "No Phoenix export artifact is exposed by /api/state, so this remains a labeled local fallback."
    : "Local review packet assembled from read-only state fields.";
  els.artifactList.replaceChildren(...ui.data.evidence_files.map((file) => h("div", { class: "artifact-row" }, [
    h("span", { class: "finding-meta", text: file }),
    h("span", { class: "chip", text: "real ref" })
  ])));
  els.jsonPreview.textContent = JSON.stringify(packetPayload(), null, 2);
}

function copyPacket() {
  ui.destination = "local";
  ui.lastAction = "Local packet preview copied in UI state.";
  render();
}

function sendPhoenix() {
  ui.destination = "phoenix";
  ui.lastAction = "Phoenix send is TODO local fallback; no network call made.";
  render();
}

function setCommandOpen(open) {
  els.commandMenu.dataset.open = String(open);
  if (open) {
    els.commandSearch.value = "";
    els.commandSearch.focus();
  }
}

function renderCommands() {
  const commands = [
    ["Include visible findings", "Ctrl Enter", includeAllVisible],
    ["Clear packet", "Ctrl Backspace", clearIncluded],
    ["Copy local packet", "Ctrl C", copyPacket],
    ["Phoenix fallback preview", "Ctrl P", sendPhoenix]
  ];
  els.commandList.replaceChildren(...commands.map(([label, shortcut, action]) => {
    const row = h("button", { class: "command-row", type: "button" }, [
      h("span", { text: label }),
      h("span", { class: "shortcut", text: shortcut })
    ]);
    row.addEventListener("click", () => {
      action();
      setCommandOpen(false);
    });
    return row;
  }));
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "toggle-command") setCommandOpen(els.commandMenu.dataset.open !== "true");
  if (action === "copy-packet") copyPacket();
  if (action === "send-phoenix") sendPhoenix();
});

document.addEventListener("keydown", (event) => {
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.key.toLowerCase() === "k") {
    event.preventDefault();
    setCommandOpen(els.commandMenu.dataset.open !== "true");
  }
  if (mod && event.key === "Enter") {
    event.preventDefault();
    includeAllVisible();
  }
  if (mod && event.key === "Backspace") {
    event.preventDefault();
    clearIncluded();
  }
  if (mod && event.key.toLowerCase() === "p") {
    event.preventDefault();
    sendPhoenix();
  }
  if (event.key === "Escape" && els.commandMenu.dataset.open === "true") {
    event.preventDefault();
    setCommandOpen(false);
  }
});

async function init() {
  const response = await fetch(STATE_URL);
  ui.data = await response.json();
  ui.data.findings.forEach((finding) => ui.included.add(finding.id));
  render();
}

init().catch((error) => {
  console.error(error);
  els.findingList.replaceChildren(h("article", { class: "packet-card", text: "Unable to load local state snapshot." }));
});
