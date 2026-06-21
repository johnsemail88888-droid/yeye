const STATE_URL = "/design/data/desktop-preview-refresh-summary.json";

const els = {
  projectName: document.querySelector("[data-project-name]"),
  fileBadge: document.querySelector("[data-file-badge]"),
  fileCount: document.querySelector("[data-file-count]"),
  codeLines: document.querySelector("[data-code-lines]"),
  findingsList: document.querySelector("[data-findings-list]"),
  detailPane: document.querySelector("[data-detail-pane]"),
  previewGrid: document.querySelector("[data-preview-grid]"),
  previewStatus: document.querySelector("[data-preview-status]"),
  commandMenu: document.querySelector("[data-command-menu]"),
  commandSearch: document.querySelector("[data-command-search]"),
  commandList: document.querySelector("[data-command-list]")
};

const ui = {
  data: null,
  selectedFindingId: null,
  pendingFindingId: null,
  previewFindingId: null,
  previewState: "idle",
  accepted: new Set(),
  rejected: new Set()
};

const lineTemplates = [
  { no: 18, id: "F5", code: "const ticket = await read_ticket(ticketId);" },
  { no: 19, id: "F4", code: "const customer = await lookup_customer(ticket.customerId);" },
  { no: 22, id: "F1", code: "await refund_customer({ amount: requestedAmount });" },
  { no: 25, id: "F2", code: "await send_email({ to: requestedRecipient, body: customer.profile });" },
  { no: 29, id: "F3", code: "await update_user_plan({ plan: requestedPlan });" },
  { no: 34, id: "F6", code: "return create_support_reply({ text: draft });" },
  { no: 41, id: "F7", code: "runToolFromTicket(ticket.instructions);" },
  { no: 44, id: "F8", code: "executeHighImpactToolWithoutApproval(toolCall);" }
];

const categoryToDimension = {
  "money-movement": "excessive agency",
  "external-communication": "PII egress",
  "privilege-change": "excessive agency",
  "pii-access": "PII egress",
  "untrusted-input": "prompt injection",
  output: "other",
  "missing-control": "prompt injection"
};

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("data-")) node.setAttribute(key, value);
    else if (key.startsWith("aria-")) node.setAttribute(key, value);
    else if (key === "type") node.type = value;
    else if (key === "title") node.title = value;
    else if (key === "role") node.setAttribute(key, value);
    else if (value !== null && value !== undefined) node.setAttribute(key, value);
  });
  children.forEach((child) => node.append(child));
  return node;
}

function findingLabel(finding) {
  return `${finding.id} - ${finding.tool || finding.category}`;
}

function getFinding(id) {
  return ui.data.findings.find((finding) => finding.id === id);
}

function visibleFindings() {
  return ui.data.findings;
}

function getDimension(finding) {
  return categoryToDimension[finding.category] || "other";
}

function actionCopy(finding) {
  const subject = finding.tool || finding.category;
  return {
    remove: `- ${subject}: executes from untrusted agent path without a local approval or intent guard.`,
    add: `+ ${subject}: gate with approval or guard policy before execution.`
  };
}

function previewCopy(finding) {
  const subject = finding.tool || finding.category;
  const accepted = ui.accepted.has(finding.id);
  return {
    beforeStatus: finding.severity,
    beforeText: `${subject} is still reachable from the guided demo path. ${finding.detail}`,
    afterStatus: accepted ? "local refresh" : "waiting for accept",
    afterText: accepted
      ? `MOCK TODO: local preview refreshed to show an approval or guard gate before ${subject}.`
      : `MOCK TODO: accept the pending hunk to refresh this local before/after preview.`
  };
}

function renderShell() {
  els.projectName.textContent = ui.data.project_id;
  els.fileBadge.textContent = String(ui.data.finding_count);
  els.fileCount.textContent = String(ui.data.finding_count);
  renderCode();
  renderFindings();
  renderDetail();
  renderPreview();
  renderCommands();
}

function renderCode() {
  els.codeLines.replaceChildren();
  const byId = new Map(ui.data.findings.map((finding) => [finding.id, finding]));
  lineTemplates.forEach((line) => {
    const finding = byId.get(line.id);
    const row = h("div", {
      class: "code-line",
      "data-line-id": line.id,
      "data-severity": finding.severity,
      "data-active": ui.selectedFindingId === line.id ? "true" : "false"
    });
    row.addEventListener("click", () => selectFinding(line.id, { openHunk: true }));
    row.append(
      h("span", { class: "line-no", text: String(line.no) }),
      h("span", { class: "gutter-dot", "aria-hidden": "true" }),
      h("span", { class: "code-text" }, [
        h("span", { class: "risk-token", text: line.code }),
        h("button", {
          class: "lightbulb",
          type: "button",
          title: `Open quick fix for ${findingLabel(finding)}`,
          "aria-label": `Open quick fix for ${findingLabel(finding)}`,
          text: "?"
        })
      ])
    );
    row.querySelector(".lightbulb").addEventListener("click", (event) => {
      event.stopPropagation();
      selectFinding(line.id, { openHunk: true });
    });
    els.codeLines.append(row);
  });
}

function renderFindings() {
  els.findingsList.replaceChildren();
  visibleFindings().forEach((finding) => {
    const row = h("button", {
      class: "finding-row",
      type: "button",
      "data-finding-id": finding.id,
      "data-active": finding.id === ui.selectedFindingId ? "true" : "false"
    });
    row.addEventListener("click", () => selectFinding(finding.id, { openHunk: true }));
    const status = ui.accepted.has(finding.id)
      ? h("span", { class: "badge", "data-tone": "success", text: "accepted" })
      : ui.rejected.has(finding.id)
        ? h("span", { class: "badge", text: "rejected" })
        : h("span", { class: "badge", "data-tone": finding.severity, text: finding.severity });
    row.append(
      h("span", { class: "finding-copy" }, [
        h("span", { class: "finding-title", text: findingLabel(finding) }),
        h("span", { class: "finding-meta", text: `${getDimension(finding)} - ${finding.detail}` })
      ]),
      status
    );
    els.findingsList.append(row);
  });
}

function renderDetail() {
  const finding = getFinding(ui.selectedFindingId);
  if (!finding) {
    els.detailPane.replaceChildren(h("div", { class: "empty-state", text: "Select a finding to preview a gated local fix." }));
    return;
  }

  const copy = actionCopy(finding);
  const isPending = ui.pendingFindingId === finding.id;
  const isAccepted = ui.accepted.has(finding.id);
  const isRejected = ui.rejected.has(finding.id);
  const headerChip = isAccepted ? "accepted" : isRejected ? "rejected" : isPending ? "pending" : "ready";
  const stack = h("div", { class: "detail-stack" });

  stack.append(
    h("section", { class: "detail-card" }, [
      h("div", { class: "toolbar-actions" }, [
        h("span", { class: "chip", "data-tone": finding.severity, text: finding.severity }),
        h("span", { class: "chip", "data-tone": "mock", text: "MOCK TODO file span" }),
        h("span", { class: "chip", text: headerChip })
      ]),
      h("div", { class: "title-line", text: findingLabel(finding) }),
      h("div", { class: "finding-meta", text: finding.detail }),
      h("div", { class: "meta-grid" }, [
        metaBox("Source", "GET /api/state.risk_map.findings"),
        metaBox("Dimension", getDimension(finding)),
        metaBox("Auto fixable", "TODO: requires real patch artifact"),
        metaBox("Preview", isAccepted ? "local refresh only" : "waiting")
      ])
    ])
  );

  stack.append(
    h("section", { class: "diff-card", "data-hunk-state": headerChip }, [
      h("div", { class: "diff-head" }, [
        h("span", { class: "panel-title", text: "Per-hunk gate" }),
        h("span", { class: "shortcut", text: "Tab accept / Esc reject" })
      ]),
      h("pre", { class: "diff-lines" }, [
        h("span", { class: "diff-line", text: "@@ MOCK TODO real source span and patch hunk @@" }),
        h("span", { class: "diff-line", "data-kind": "remove", text: copy.remove }),
        h("span", { class: "diff-line", "data-kind": "add", text: copy.add })
      ])
    ])
  );

  stack.append(
    h("div", { class: "toolbar-actions" }, [
      button("Preview hunk", "open-hunk", false),
      button("Accept hunk", "accept-hunk", true),
      button("Reject", "reject-hunk", false),
      button("Accept all visible", "accept-all", false)
    ])
  );

  els.detailPane.replaceChildren(stack);
}

function metaBox(label, value) {
  return h("div", { class: "meta-box" }, [
    h("span", { class: "meta-label", text: label }),
    h("span", { class: "meta-value", text: value })
  ]);
}

function button(label, action, primary) {
  const node = h("button", {
    class: "button",
    type: "button",
    "data-action": action,
    "data-primary": primary ? "true" : "false",
    text: label
  });
  return node;
}

function renderPreview() {
  const fallbackFinding = getFinding(ui.selectedFindingId) || ui.data.findings[0];
  const finding = getFinding(ui.previewFindingId) || fallbackFinding;
  const copy = previewCopy(finding);
  const acceptedCount = ui.accepted.size;
  const totalCount = ui.data.findings.length;
  const progress = totalCount ? `${Math.round((acceptedCount / totalCount) * 100)}%` : "0%";

  const statusText =
    ui.previewState === "refreshed"
      ? `Refreshed after accepting ${finding.id}`
      : ui.previewState === "rejected"
        ? `Rejected ${finding.id}; preview unchanged`
        : ui.previewState === "pending"
          ? `Pending hunk for ${finding.id}`
          : "Waiting for hunk";

  els.previewStatus.textContent = statusText;
  els.previewGrid.replaceChildren(
    h("article", { class: "render-card", "data-state": "before" }, [
      h("div", { class: "render-head" }, [
        h("span", { class: "panel-title", text: "Before guard" }),
        h("span", { class: "chip", "data-tone": finding.severity, text: finding.severity })
      ]),
      h("div", { class: "render-body" }, [
        h("div", { class: "preview-row" }, [
          h("span", { text: copy.beforeText }),
          h("span", { class: "status-dot", "data-tone": "critical", "aria-hidden": "true" })
        ]),
        h("span", { class: "chip", "data-tone": "mock", text: "MOCK TODO render" })
      ])
    ]),
    h("article", { class: "render-card", "data-state": "after" }, [
      h("div", { class: "render-head" }, [
        h("span", { class: "panel-title", text: "After local accept" }),
        h("span", { class: "chip", "data-tone": ui.accepted.has(finding.id) ? "success" : "mock", text: copy.afterStatus })
      ]),
      h("div", { class: "render-body" }, [
        h("div", { class: "preview-row" }, [
          h("span", { text: copy.afterText }),
          h("span", { class: "status-dot", "data-tone": ui.accepted.has(finding.id) ? "success" : "pending", "aria-hidden": "true" })
        ]),
        h("div", { class: "progress-bar", style: `--progress:${progress}` }, [h("span")]),
        h("span", { class: "finding-meta", text: `${acceptedCount} of ${totalCount} local hunks accepted` })
      ])
    ])
  );
}

function renderCommands() {
  const commands = [
    { label: "Open selected hunk", action: openHunk, shortcut: "Cmd ." },
    { label: "Accept hunk", action: acceptHunk, shortcut: "Tab" },
    { label: "Reject hunk", action: rejectHunk, shortcut: "Esc" },
    { label: "Accept all visible", action: acceptAllVisible, shortcut: "Cmd Enter" }
  ];
  els.commandList.replaceChildren();
  commands.forEach((command) => {
    const row = h("button", { class: "command-row", type: "button" }, [
      h("span", { class: "row-main", text: command.label }),
      h("span", { class: "shortcut", text: command.shortcut })
    ]);
    row.addEventListener("click", () => {
      command.action();
      setCommandOpen(false);
    });
    els.commandList.append(row);
  });
}

function selectFinding(id, opts = {}) {
  ui.selectedFindingId = id;
  if (opts.openHunk) openHunk();
  renderCode();
  renderFindings();
  renderDetail();
  renderPreview();
}

function openHunk() {
  if (!ui.selectedFindingId) return;
  ui.pendingFindingId = ui.selectedFindingId;
  ui.previewFindingId = ui.selectedFindingId;
  ui.previewState = "pending";
  renderDetail();
  renderPreview();
}

function acceptHunk() {
  const id = ui.pendingFindingId || ui.selectedFindingId;
  if (!id) return;
  ui.accepted.add(id);
  ui.rejected.delete(id);
  ui.pendingFindingId = null;
  ui.previewFindingId = id;
  ui.previewState = "refreshed";
  renderCode();
  renderFindings();
  renderDetail();
  renderPreview();
}

function rejectHunk() {
  const id = ui.pendingFindingId || ui.selectedFindingId;
  if (!id) return;
  ui.rejected.add(id);
  ui.accepted.delete(id);
  ui.pendingFindingId = null;
  ui.previewFindingId = id;
  ui.previewState = "rejected";
  renderFindings();
  renderDetail();
  renderPreview();
}

function acceptAllVisible() {
  visibleFindings().forEach((finding) => ui.accepted.add(finding.id));
  ui.rejected.clear();
  ui.pendingFindingId = null;
  ui.previewFindingId = ui.selectedFindingId || visibleFindings()[0].id;
  ui.previewState = "refreshed";
  renderFindings();
  renderDetail();
  renderPreview();
}

function setCommandOpen(open) {
  els.commandMenu.dataset.open = String(open);
  if (open) {
    els.commandSearch.value = "";
    els.commandSearch.focus();
  }
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "toggle-command") setCommandOpen(els.commandMenu.dataset.open !== "true");
  if (action === "open-hunk") openHunk();
  if (action === "accept-hunk") acceptHunk();
  if (action === "reject-hunk") rejectHunk();
  if (action === "accept-all") acceptAllVisible();
});

document.addEventListener("keydown", (event) => {
  const mod = event.metaKey || event.ctrlKey;
  if (mod && event.key.toLowerCase() === "k") {
    event.preventDefault();
    setCommandOpen(els.commandMenu.dataset.open !== "true");
  }
  if (mod && event.key === ".") {
    event.preventDefault();
    openHunk();
  }
  if (event.key === "Tab") {
    event.preventDefault();
    acceptHunk();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    if (els.commandMenu.dataset.open === "true") setCommandOpen(false);
    else rejectHunk();
  }
  if (mod && event.key === "Enter") {
    event.preventDefault();
    acceptAllVisible();
  }
});

async function init() {
  const response = await fetch(STATE_URL);
  ui.data = await response.json();
  ui.selectedFindingId = ui.data.findings[0]?.id;
  renderShell();
}

init().catch((error) => {
  console.error(error);
  els.detailPane.replaceChildren(h("div", { class: "empty-state", text: "Unable to load local state snapshot." }));
});
