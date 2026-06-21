const state = {
  selectedScan: "deep",
  summary: null,
  historyCleared: false
};

const scanLabels = {
  quick: "Quick Scan",
  active: "Active Probe",
  deep: "Deep Scan"
};

const historyStrip = document.querySelector("#historyStrip");
const shell = document.querySelector(".extension-shell");
const activeConsent = document.querySelector("#activeConsent");
const deepConsent = document.querySelector("#deepConsent");
const clearHistory = document.querySelector("#clearHistory");
const dataSourceChip = document.querySelector("#dataSourceChip");

async function loadSummary() {
  try {
    const response = await fetch("./state-summary.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }
    state.summary = await response.json();
  } catch (error) {
    // MOCK: replace with read-only GET /api/state summary when the daemon is available.
    state.summary = {
      source: "MOCK TODO",
      captured_at_local: "unavailable",
      project_id: "MOCK TODO",
      run_id: "MOCK TODO",
      target: "MOCK TODO",
      finding_count: 0,
      critical_count: 0,
      high_count: 0,
      before_fail_count: 0,
      after_fail_count: 0,
      demo_ready: false,
      report_audit_pass: false,
      live_scan_source: "MOCK TODO",
      live_scan_run_id: "MOCK TODO",
      live_scan_captured_at: "MOCK TODO"
    };
    dataSourceChip.textContent = "MOCK TODO";
    dataSourceChip.dataset.tone = "mock";
  }
  renderAll();
}

function acknowledgementFor(scan) {
  if (scan === "quick") return "No extra acknowledgement";
  if (scan === "active") return activeConsent.checked ? "Consent complete" : "Consent required";
  return deepConsent.checked ? "Debugger warning accepted" : "Debugger acknowledgement required";
}

function sourceTone() {
  return state.summary?.source?.includes("/api/state") ? "live" : "mock";
}

function currentHistory() {
  const summary = state.summary;
  const resultText = summary
    ? `${summary.finding_count} findings, ${summary.critical_count} critical, ${summary.after_fail_count} after-fail`
    : "Loading";
  return [
    {
      id: "current",
      title: scanLabels[state.selectedScan],
      meta: acknowledgementFor(state.selectedScan),
      source: sourceTone() === "live" ? "LIVE /api/state snapshot" : "MOCK TODO",
      result: resultText,
      active: true,
      tone: sourceTone()
    },
    {
      id: "slot-active",
      title: "Active Probe slot",
      meta: "Awaiting real history persistence",
      source: "MOCK TODO",
      result: "No stored artifact yet",
      active: false,
      tone: "mock"
    },
    {
      id: "slot-quick",
      title: "Quick Scan slot",
      meta: "Awaiting real history persistence",
      source: "MOCK TODO",
      result: "No stored artifact yet",
      active: false,
      tone: "mock"
    }
  ].filter((item) => item.id === "current" || !state.historyCleared);
}

function renderHistory() {
  historyStrip.innerHTML = "";
  currentHistory().forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.dataset.active = String(item.active);
    button.dataset.tone = item.tone;
    button.innerHTML = `
      <span class="history-kicker">${item.source}</span>
      <strong>${item.title}</strong>
      <span>${item.meta}</span>
      <em>${item.result}</em>
    `;
    button.addEventListener("click", () => {
      if (item.id === "current") return;
      state.historyCleared = false;
      renderHistory();
    });
    historyStrip.append(button);
  });
}

function renderSummary() {
  const summary = state.summary;
  document.querySelector("#panelTitle").textContent = `${scanLabels[state.selectedScan]} history snapshot`;
  document.querySelector("#findingCount").textContent = String(summary.finding_count);
  document.querySelector("#criticalCount").textContent = String(summary.critical_count);
  document.querySelector("#afterFailCount").textContent = String(summary.after_fail_count);
  document.querySelector("#promptCopy").textContent =
    `${summary.before_fail_count} before-guard failures are present in ${summary.run_id}; this row is backed by ${summary.source}.`;
  document.querySelector("#agencyCopy").textContent =
    `${summary.critical_count} critical findings and ${summary.high_count} high findings are summarized from the risk map for ${summary.project_id}.`;
  document.querySelector("#piiCopy").textContent =
    `After-guard failures are ${summary.after_fail_count}; audit pass is ${summary.report_audit_pass ? "true" : "false"}.`;
}

function updateRunStates() {
  document.querySelector('[data-run="active"]').disabled = !activeConsent.checked;
  document.querySelector('[data-run="deep"]').disabled = !deepConsent.checked;
}

function selectScan(scan) {
  state.selectedScan = scan;
  shell.dataset.view = scan;
  document.querySelectorAll(".scan-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.scan === scan);
  });
  renderAll();
}

function renderAll() {
  updateRunStates();
  renderHistory();
  if (state.summary) renderSummary();
}

document.querySelectorAll("[data-run]").forEach((button) => {
  button.addEventListener("click", () => {
    selectScan(button.dataset.run);
  });
});

activeConsent.addEventListener("change", renderAll);
deepConsent.addEventListener("change", renderAll);
clearHistory.addEventListener("click", () => {
  state.historyCleared = true;
  renderHistory();
});

loadSummary();
