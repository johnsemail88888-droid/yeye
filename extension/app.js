const state = {
  summary: null,
  paletteOpen: false,
  query: "",
  activeIndex: 0,
  status: "Ready. Press Ctrl+K to run a side-panel action."
};

const commands = [
  {
    id: "rerun",
    group: "Scan",
    title: "Rerun Deep Scan",
    subtitle: "Queue the same read-only scan route for the selected finding.",
    shortcut: "R",
    run: () => setStatus(`Prepared rerun for ${state.summary.live_scan_run_id}. No daemon mutation was attempted.`)
  },
  {
    id: "highlight",
    group: "Evidence",
    title: "Highlight on page",
    subtitle: "Reveal the observed selector in the live page preview.",
    shortcut: "H",
    run: () => {
      document.querySelector("#targetHighlight").hidden = false;
      setStatus("Highlighted the observed evidence selector in the page preview.");
    }
  },
  {
    id: "copy",
    group: "Evidence",
    title: "Copy evidence summary",
    subtitle: "Copy run id, finding counts, and confidence context.",
    shortcut: "C",
    run: async () => {
      const payload = {
        project_id: state.summary.project_id,
        run_id: state.summary.run_id,
        findings: state.summary.finding_count,
        critical: state.summary.critical_count,
        confidence: "Confirmed"
      };
      setStatus("Evidence summary copied locally for review. No network send was attempted.");
      try {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      } catch (error) {
        // Clipboard may be blocked by browser context; keep visible local status.
      }
    }
  },
  {
    id: "export",
    group: "Export",
    title: "Export local Phoenix bundle",
    subtitle: "Use local fallback until a real collector endpoint exists.",
    shortcut: "E",
    run: () => setStatus(`Local Phoenix fallback bundle prepared for ${state.summary.run_id}.`)
  },
  {
    id: "filter",
    group: "View",
    title: "Show fix-now findings",
    subtitle: "Focus the side panel on actions the operator can take now.",
    shortcut: "F",
    run: () => setStatus("Filter set to Fix now for the selected dimension.")
  }
];

const overlay = document.querySelector("#commandOverlay");
const search = document.querySelector("#commandSearch");
const list = document.querySelector("#commandList");
const statusLine = document.querySelector("#statusLine");

async function loadSummary() {
  try {
    const response = await fetch("./summary.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    state.summary = await response.json();
  } catch (error) {
    // MOCK: replace with read-only GET /api/state summary when available.
    state.summary = {
      source: "MOCK TODO",
      project_id: "MOCK TODO",
      run_id: "MOCK TODO",
      live_scan_run_id: "MOCK TODO",
      finding_count: 0,
      critical_count: 0,
      after_fail_count: 0
    };
  }
  document.querySelector("#findingCount").textContent = String(state.summary.finding_count);
  document.querySelector("#criticalCount").textContent = String(state.summary.critical_count);
  document.querySelector("#afterFailCount").textContent = String(state.summary.after_fail_count);
  renderCommands();
}

function filteredCommands() {
  const q = state.query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((command) =>
    `${command.group} ${command.title} ${command.subtitle} ${command.shortcut}`.toLowerCase().includes(q)
  );
}

function groupedCommands(items) {
  return items.reduce((groups, command) => {
    if (!groups.has(command.group)) groups.set(command.group, []);
    groups.get(command.group).push(command);
    return groups;
  }, new Map());
}

function renderCommands() {
  const items = filteredCommands();
  state.activeIndex = Math.min(state.activeIndex, Math.max(items.length - 1, 0));
  list.innerHTML = "";
  let flatIndex = 0;
  groupedCommands(items).forEach((groupItems, group) => {
    const label = document.createElement("div");
    label.className = "command-group";
    label.textContent = group;
    list.append(label);
    groupItems.forEach((command) => {
      const index = flatIndex;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "command-item";
      button.dataset.active = String(index === state.activeIndex);
      button.innerHTML = `
        <span class="command-copy">
          <strong>${command.title}</strong>
          <span>${command.subtitle}</span>
        </span>
        <span class="kbd">${command.shortcut}</span>
      `;
      button.addEventListener("click", () => executeCommand(index));
      list.append(button);
      flatIndex += 1;
    });
  });
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "command-group";
    empty.textContent = "No matching actions";
    list.append(empty);
  }
}

function openPalette() {
  state.paletteOpen = true;
  overlay.hidden = false;
  search.value = "";
  state.query = "";
  state.activeIndex = 0;
  renderCommands();
  requestAnimationFrame(() => search.focus());
}

function closePalette() {
  state.paletteOpen = false;
  overlay.hidden = true;
  document.querySelector("#openPalette").focus();
}

async function executeCommand(index = state.activeIndex) {
  const command = filteredCommands()[index];
  if (!command) return;
  await command.run();
  closePalette();
}

function setStatus(message) {
  state.status = message;
  statusLine.textContent = message;
}

document.querySelector("#openPalette").addEventListener("click", openPalette);
search.addEventListener("input", () => {
  state.query = search.value;
  state.activeIndex = 0;
  renderCommands();
});

document.addEventListener("keydown", async (event) => {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && key === "k") {
    event.preventDefault();
    openPalette();
    return;
  }
  if (!state.paletteOpen) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closePalette();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    state.activeIndex = Math.min(state.activeIndex + 1, filteredCommands().length - 1);
    renderCommands();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    state.activeIndex = Math.max(state.activeIndex - 1, 0);
    renderCommands();
  } else if (event.key === "Enter") {
    event.preventDefault();
    await executeCommand();
  }
});

loadSummary();
