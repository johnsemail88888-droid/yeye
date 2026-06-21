const STATE_URL = "/design/data/desktop-project-intake-0947-summary.json";

const els = {
  sourceLine: document.querySelector("[data-source-line]"),
  projectList: document.querySelector("[data-project-list]"),
  sourceList: document.querySelector("[data-source-list]"),
  choiceGrid: document.querySelector("[data-choice-grid]"),
  dropZone: document.querySelector("[data-drop-zone]"),
  dropTitle: document.querySelector("[data-drop-title]"),
  dropCopy: document.querySelector("[data-drop-copy]"),
  riskGrid: document.querySelector("[data-risk-grid]"),
  statusLine: document.querySelector("[data-status-line]"),
  selectedMode: document.querySelector("[data-selected-mode]"),
  selectedModeCopy: document.querySelector("[data-selected-mode-copy]"),
  riskBadge: document.querySelector("[data-risk-badge]"),
  timeline: document.querySelector("[data-timeline]"),
  commandMenu: document.querySelector("[data-command-menu]"),
  commandSearch: document.querySelector("[data-command-search]"),
  commandList: document.querySelector("[data-command-list]")
};

const ui = {
  data: null,
  mode: "sandbox",
  source: "folder",
  imported: false,
  scanArmed: false
};

const modeOptions = [
  {
    id: "sandbox",
    title: "Sandbox copy",
    badge: "Recommended",
    copy: "Open the pre-launch app in an isolated copy. Apply stays gated and source writes remain opt-in."
  },
  {
    id: "working",
    title: "Working copy",
    badge: "Higher risk",
    copy: "Point at the current working tree. Prototype labels this as TODO because real source writes are not wired."
  }
];

const sourceOptions = [
  ["folder", "Local folder", "MOCK TODO file picker"],
  ["git", "Git URL", "MOCK TODO clone"],
  ["zip", "Zip upload", "MOCK TODO upload"]
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
  els.riskBadge.textContent = String(ui.data.finding_count);
  renderProjects();
  renderSources();
  renderChoices();
  renderDropZone();
  renderRiskGrid();
  renderTimeline();
  renderCommands();
}

function renderProjects() {
  const row = h("button", {
    class: "project-row",
    type: "button",
    "data-active": ui.imported ? "true" : "false"
  }, [
    h("span", {}, [
      h("span", { class: "title", text: ui.data.project_id }),
      h("span", { class: "subtitle", text: ui.imported ? `${modeLabel()} selected` : "Waiting for intake" })
    ]),
    h("span", { class: "badge", "data-tone": "critical", text: String(ui.data.finding_count) })
  ]);
  row.addEventListener("click", () => {
    ui.imported = true;
    render();
  });
  els.projectList.replaceChildren(row);
}

function renderSources() {
  els.sourceList.replaceChildren(
    h("span", { class: "eyebrow", text: "Import source" }),
    ...sourceOptions.map(([id, title, copy]) => {
      const row = h("button", {
        class: "source-row",
        type: "button",
        "data-source": id,
        "data-active": ui.source === id ? "true" : "false"
      }, [
        h("span", {}, [
          h("span", { class: "title", text: title }),
          h("span", { class: "subtitle", text: copy })
        ]),
        h("span", { class: "chip", "data-tone": "mock", text: "TODO" })
      ]);
      row.addEventListener("click", () => {
        ui.source = id;
        ui.scanArmed = true;
        render();
      });
      return row;
    })
  );
}

function renderChoices() {
  els.choiceGrid.replaceChildren(...modeOptions.map((option) => {
    const card = h("button", {
      class: "choice-card",
      type: "button",
      "data-mode": option.id,
      "data-active": ui.mode === option.id ? "true" : "false"
    }, [
      h("span", { class: "choice-title", text: option.title }),
      h("span", { class: "subtitle", text: option.copy }),
      h("span", { class: "choice-meta" }, [
        h("span", { class: "chip", "data-tone": option.id === "sandbox" ? "success" : "mock", text: option.badge }),
        h("span", { class: "shortcut", text: option.id === "sandbox" ? "Ctrl 1" : "Ctrl 2" })
      ])
    ]);
    card.addEventListener("click", () => {
      ui.mode = option.id;
      ui.scanArmed = true;
      render();
    });
    return card;
  }));
}

function renderDropZone() {
  els.dropZone.dataset.armed = String(ui.scanArmed);
  els.dropTitle.textContent = ui.imported ? `${ui.data.project_id} added locally` : `Ready for ${sourceLabel()}`;
  els.dropCopy.textContent = ui.imported
    ? `${modeLabel()} is active. Next: run a risk scan in the guided demo surface.`
    : `This is MOCK TODO local intake for ${sourceLabel()}; no files are read or written.`;
  els.statusLine.textContent = ui.imported
    ? `${ui.data.finding_count} existing findings can be reviewed after scan.`
    : `${modeLabel()} selected. Import action is local UI only.`;
  els.selectedMode.textContent = modeLabel();
  els.selectedModeCopy.textContent = ui.mode === "sandbox"
    ? "Edits stay isolated until explicitly applied."
    : "Prototype warns before touching the working tree; no writes are wired here.";
}

function renderRiskGrid() {
  const counts = ui.data.severity_counts;
  const cards = [
    ["Findings", String(ui.data.finding_count), "risk_map.findings"],
    ["Files scanned", String(ui.data.risk_map.scanned_files), "risk_map.scanned_files"],
    ["High-impact tools", String(ui.data.risk_map.high_impact_tool_count), "risk_map tools"],
    ["Guard present", String(ui.data.risk_map.guard_present), "risk_map.guard_present"],
    ["Critical", String(counts.critical || 0), "real severity count"],
    ["Desktop ready", String(ui.data.verify.desktop_connected), "verify.desktop_connected"]
  ];
  els.riskGrid.replaceChildren(...cards.map(([label, value, note]) => h("article", { class: "metric-card" }, [
    h("span", { class: "metric-label", text: label }),
    h("span", { class: "metric-value", text: value }),
    h("span", { class: "subtitle", text: note })
  ])));
}

function renderTimeline() {
  const steps = [
    ["Choose isolation", "done", `${modeLabel()} selected before import.`],
    ["Add project", ui.imported ? "done" : "active", ui.imported ? "Project row is active in the rail." : "Waiting on MOCK TODO import action."],
    ["Run scan", ui.imported ? "active" : "idle", "Next action would scan the guided demo project."],
    ["Review fixable spots", "idle", "Real file spans are not exposed by /api/state yet."]
  ];
  els.timeline.replaceChildren(...steps.map(([title, state, copy]) => h("article", { class: "timeline-step", "data-state": state }, [
    h("span", { class: "step-dot", "aria-hidden": "true" }),
    h("span", {}, [
      h("span", { class: "title", text: title }),
      h("span", { class: "subtitle", text: copy })
    ])
  ])));
}

function renderCommands() {
  const commands = [
    ["Use Sandbox copy", "Ctrl 1", () => { ui.mode = "sandbox"; ui.scanArmed = true; render(); }],
    ["Use Working copy", "Ctrl 2", () => { ui.mode = "working"; ui.scanArmed = true; render(); }],
    ["Add project locally", "Enter", () => addProject()],
    ["Arm folder source", "Ctrl F", () => { ui.source = "folder"; ui.scanArmed = true; render(); }]
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

function modeLabel() {
  return modeOptions.find((option) => option.id === ui.mode).title;
}

function sourceLabel() {
  return sourceOptions.find(([id]) => id === ui.source)[1];
}

function addProject() {
  ui.imported = true;
  ui.scanArmed = true;
  render();
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
  if (action === "toggle-command") setCommandOpen(els.commandMenu.dataset.open !== "true");
  if (action === "add-project") addProject();
});

document.addEventListener("keydown", (event) => {
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.key.toLowerCase() === "k") {
    event.preventDefault();
    setCommandOpen(els.commandMenu.dataset.open !== "true");
  }
  if (mod && event.key === "1") {
    event.preventDefault();
    ui.mode = "sandbox";
    ui.scanArmed = true;
    render();
  }
  if (mod && event.key === "2") {
    event.preventDefault();
    ui.mode = "working";
    ui.scanArmed = true;
    render();
  }
  if (mod && event.key.toLowerCase() === "f") {
    event.preventDefault();
    ui.source = "folder";
    ui.scanArmed = true;
    render();
  }
  if (event.key === "Enter" && els.commandMenu.dataset.open === "true") {
    event.preventDefault();
    addProject();
    setCommandOpen(false);
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
  document.querySelector(".workspace-main").replaceChildren(
    h("article", { class: "next-card", text: "Unable to load local state snapshot." })
  );
});
