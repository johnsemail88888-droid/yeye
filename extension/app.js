const STATE_URL = "/design/data/extension-fix-guide-0932-summary.json";

const els = {
  sourceLine: document.querySelector("[data-source-line]"),
  scanCards: document.querySelector("[data-scan-cards]"),
  summaryGrid: document.querySelector("[data-summary-grid]"),
  filterList: document.querySelector("[data-filter-list]"),
  accordionList: document.querySelector("[data-accordion-list]"),
  commandMenu: document.querySelector("[data-command-menu]"),
  commandSearch: document.querySelector("[data-command-search]"),
  commandList: document.querySelector("[data-command-list]")
};

const ui = {
  data: null,
  scanMode: "quick",
  activeDimension: "All",
  openDimensions: new Set(["Prompt Injection"]),
  doneSteps: new Set(),
  verifyState: "idle"
};

const scanModes = [
  {
    id: "quick",
    name: "Quick Scan",
    tier: "passive",
    copy: "DOM, headers, request metadata, and static client hints. Default safe scan."
  },
  {
    id: "active",
    name: "Active Probe",
    tier: "consent",
    copy: "Would type benign canary prompts as the signed-in user. Never auto-runs."
  },
  {
    id: "deep",
    name: "Deep Scan",
    tier: "debugger",
    copy: "Would request debugger permission for response-body inspection. TODO only here."
  }
];

const dimensionRules = [
  {
    name: "Prompt Injection",
    categories: ["untrusted-input", "missing-control"],
    steps: [
      "Wrap retrieved and user-controlled content before it reaches the model.",
      "Pin the system instruction server-side and keep it outside user-editable text.",
      "Add an output check that blocks tool requests created from untrusted text."
    ],
    snippet: "policy.intent_guard = required\\npolicy.untrusted_input = wrapped\\npolicy.output_tools = deny_unless_signed"
  },
  {
    name: "Excessive Agency",
    categories: ["money-movement", "privilege-change"],
    steps: [
      "Require explicit approval before state-changing or money-moving tools execute.",
      "Scope tool permissions to the current task and signed plan.",
      "Record a hold-for-approval state before calling the external service."
    ],
    snippet: "tool.refund_customer.approval_threshold = 100\\ntool.update_user_plan.requires_human = true"
  },
  {
    name: "PII Egress",
    categories: ["external-communication", "pii-access"],
    steps: [
      "Strip customer identifiers before any analytics, email, or third-party request.",
      "Set a CSP connect-src allowlist for known destinations.",
      "Block outbound messages that include customer profile fields."
    ],
    snippet: "csp.connect_src = ['self', 'api.yourapp.example']\\npii.egress = block_external"
  },
  {
    name: "Output Hygiene",
    categories: ["output"],
    steps: [
      "Keep generated replies as drafts until a reviewer confirms them.",
      "Check final customer-facing text for accidental policy or PII leakage.",
      "Re-run the same live-site probe after the output filter changes."
    ],
    snippet: "reply.mode = draft\\nreply.review_required = true"
  }
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
    else if (value !== undefined && value !== null) node.setAttribute(key, value);
  });
  children.forEach((child) => node.append(child));
  return node;
}

function ruleForFinding(finding) {
  return dimensionRules.find((rule) => rule.categories.includes(finding.category)) || dimensionRules[3];
}

function findingsForDimension(dimension) {
  if (dimension === "All") return ui.data.findings;
  const rule = dimensionRules.find((item) => item.name === dimension);
  return ui.data.findings.filter((finding) => rule.categories.includes(finding.category));
}

function groupedFindings() {
  return dimensionRules.map((rule) => ({
    ...rule,
    findings: ui.data.findings.filter((finding) => rule.categories.includes(finding.category))
  })).filter((group) => group.findings.length > 0);
}

function severityTone(severity) {
  return severity || "mock";
}

function render() {
  els.sourceLine.textContent = `${ui.data.source_status} - ${ui.data.project_id} / ${ui.data.run_id}`;
  renderScanCards();
  renderSummary();
  renderFilters();
  renderAccordions();
  renderCommands();
}

function renderScanCards() {
  els.scanCards.replaceChildren();
  scanModes.forEach((mode) => {
    const card = h("button", {
      class: "scan-card",
      type: "button",
      "data-scan-mode": mode.id,
      "data-active": ui.scanMode === mode.id ? "true" : "false"
    }, [
      h("span", { class: "scan-card-title", text: mode.name }),
      h("span", { class: "subtle", text: mode.copy }),
      h("span", { class: "chip", "data-tone": mode.id === "quick" ? "low" : "mock", text: mode.tier })
    ]);
    card.addEventListener("click", () => {
      ui.scanMode = mode.id;
      renderScanCards();
    });
    els.scanCards.append(card);
  });
}

function renderSummary() {
  const counts = ui.data.severity_counts;
  const cards = [
    ["Findings", String(ui.data.finding_count), "GET /api/state"],
    ["Critical", String(counts.critical || 0), "real severity count"],
    ["Needs review", String(ui.data.finding_count), "confidence absent"],
    ["Grade", "TBD", "TODO no grade field"]
  ];
  els.summaryGrid.replaceChildren(...cards.map(([label, value, note]) => h("article", { class: "metric-card" }, [
    h("span", { class: "metric-label", text: label }),
    h("span", { class: "metric-value", text: value }),
    h("span", { class: "subtle", text: note })
  ])));
}

function renderFilters() {
  const filters = ["All", ...dimensionRules.map((rule) => rule.name)];
  els.filterList.replaceChildren();
  filters.forEach((filter) => {
    const count = findingsForDimension(filter).length;
    const button = h("button", {
      class: "filter-button",
      type: "button",
      "data-active": ui.activeDimension === filter ? "true" : "false"
    }, [
      h("span", { text: filter }),
      h("span", { class: "badge", text: String(count) })
    ]);
    button.addEventListener("click", () => {
      ui.activeDimension = filter;
      if (filter !== "All") ui.openDimensions.add(filter);
      renderFilters();
      renderAccordions();
    });
    els.filterList.append(button);
  });
}

function renderAccordions() {
  const groups = groupedFindings().filter((group) => ui.activeDimension === "All" || group.name === ui.activeDimension);
  els.accordionList.replaceChildren();
  groups.forEach((group) => {
    const accordion = h("article", {
      class: "accordion",
      "data-dimension": group.name,
      "data-open": ui.openDimensions.has(group.name) ? "true" : "false"
    });
    const button = h("button", { class: "accordion-button", type: "button" }, [
      h("span", { class: "accordion-main" }, [
        h("span", { class: "dimension-dot", "data-dimension": group.name }),
        h("span", { class: "section-title", text: group.name })
      ]),
      h("span", { class: "badge", text: String(group.findings.length) }),
      h("span", { class: "chip", "data-tone": "mock", text: "Confidence TODO" })
    ]);
    button.addEventListener("click", () => toggleDimension(group.name));
    const body = h("div", { class: "accordion-body" });
    group.findings.forEach((finding) => body.append(renderFinding(group, finding)));
    accordion.append(button, body);
    els.accordionList.append(accordion);
  });
}

function renderFinding(group, finding) {
  const subject = finding.tool || finding.category;
  const card = h("article", { class: "finding-card", "data-finding-id": finding.id }, [
    h("div", { class: "finding-head" }, [
      h("span", { class: "finding-title", text: `${finding.id} - ${subject}` }),
      h("span", { class: "chip", "data-tone": severityTone(finding.severity), text: finding.severity })
    ]),
    h("div", { class: "finding-actions" }, [
      h("span", { class: "chip", "data-tone": "mock", text: "Confidence TODO" }),
      h("span", { class: "chip", text: "Evidence from risk_map" }),
      h("button", { class: "button", type: "button", "data-action": "highlight", text: "Highlight TODO" })
    ]),
    h("p", { class: "finding-copy", text: finding.detail }),
    h("div", { class: "step-list" }, group.steps.map((step, index) => renderStep(finding.id, index, step))),
    h("article", { class: "snippet-card" }, [h("code", { text: group.snippet })]),
    h("div", { class: "finding-actions" }, [
      h("button", { class: "button", type: "button", "data-action": "verify", text: verifyText(finding.id) }),
      h("span", { class: "subtle", text: "Verify by re-running the same probe after the live-site fix." })
    ])
  ]);
  card.querySelector('[data-action="highlight"]').addEventListener("click", () => {
    card.querySelector('[data-action="highlight"]').textContent = "TODO selector absent";
  });
  card.querySelector('[data-action="verify"]').addEventListener("click", () => {
    ui.verifyState = finding.id;
    renderAccordions();
  });
  return card;
}

function renderStep(findingId, index, text) {
  const id = `${findingId}:${index}`;
  const done = ui.doneSteps.has(id);
  const row = h("div", { class: "step-card" }, [
    h("div", { class: "step-row" }, [
      h("button", {
        class: "step-check",
        type: "button",
        "data-done": done ? "true" : "false",
        "aria-label": done ? "Mark step not done" : "Mark step done",
        text: done ? "Done" : String(index + 1)
      }),
      h("div", { class: "step-text" }, [
        h("span", { class: "chip", text: index === 0 ? "Inferred" : "TODO confirm" }),
        h("div", { class: "finding-copy", text })
      ])
    ])
  ]);
  row.querySelector("button").addEventListener("click", () => {
    if (ui.doneSteps.has(id)) ui.doneSteps.delete(id);
    else ui.doneSteps.add(id);
    renderAccordions();
  });
  return row;
}

function verifyText(findingId) {
  return ui.verifyState === findingId ? "Verify queued TODO" : "Verify fix";
}

function toggleDimension(name) {
  if (ui.openDimensions.has(name)) ui.openDimensions.delete(name);
  else ui.openDimensions.add(name);
  renderAccordions();
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
    ["Open Prompt Injection", "Ctrl 1", () => openOnly("Prompt Injection")],
    ["Open Excessive Agency", "Ctrl 2", () => openOnly("Excessive Agency")],
    ["Open PII Egress", "Ctrl 3", () => openOnly("PII Egress")],
    ["Expand all dimensions", "Ctrl Enter", () => {
      groupedFindings().forEach((group) => ui.openDimensions.add(group.name));
      renderAccordions();
    }]
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

function openOnly(dimension) {
  ui.activeDimension = dimension;
  ui.openDimensions.add(dimension);
  renderFilters();
  renderAccordions();
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "toggle-command") setCommandOpen(els.commandMenu.dataset.open !== "true");
});

document.addEventListener("keydown", (event) => {
  const mod = event.metaKey || event.ctrlKey;
  if (mod && event.key.toLowerCase() === "k") {
    event.preventDefault();
    setCommandOpen(els.commandMenu.dataset.open !== "true");
  }
  if (mod && event.key === "1") {
    event.preventDefault();
    openOnly("Prompt Injection");
  }
  if (mod && event.key === "2") {
    event.preventDefault();
    openOnly("Excessive Agency");
  }
  if (mod && event.key === "3") {
    event.preventDefault();
    openOnly("PII Egress");
  }
  if (mod && event.key === "Enter") {
    event.preventDefault();
    groupedFindings().forEach((group) => ui.openDimensions.add(group.name));
    renderAccordions();
  }
  if (event.key === "Escape" && els.commandMenu.dataset.open === "true") {
    event.preventDefault();
    setCommandOpen(false);
  }
});

async function init() {
  const response = await fetch(STATE_URL);
  ui.data = await response.json();
  render();
}

init().catch((error) => {
  console.error(error);
  els.accordionList.replaceChildren(h("div", { class: "finding-card", text: "State snapshot failed to load." }));
});
