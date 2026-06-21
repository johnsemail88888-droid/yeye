// MOCK: replace scan metadata and side-panel findings with read-only GET /api/state fields when daemon data is already available.
const scans = [
  {
    id: "quick",
    title: "Quick Scan",
    intent: "Passive browser-surface review",
    status: "Ready",
    consentLabel: "",
    detail: "Passive checks can run without typing into the page or requesting debugger permission.",
    permissions: ["Read rendered DOM", "Inspect response headers", "Map request metadata"],
    disabledCopy: "Quick Scan needs no extra acknowledgement.",
    progress: "Quick Scan ran locally with MOCK DOM/header/request checks.",
    result: "Passive browser-surface review completed with MOCK findings."
  },
  {
    id: "active",
    title: "Active Probe",
    intent: "Benign canary prompt behavior",
    status: "Consent required",
    consentLabel: "I consent to VibeShield typing benign test messages into this page as me.",
    detail: "Active Probe is disabled until the user accepts the literal consent line.",
    permissions: ["Type benign canary prompts", "Read streamed DOM replies", "Score behavior from the user's seat"],
    disabledCopy: "Run stays disabled until the consent checkbox is selected.",
    progress: "Active Probe ran locally after consent; no live scan endpoint was called.",
    result: "Benign canary behavior review completed as a MOCK local action."
  },
  {
    id: "deep",
    title: "Deep Scan",
    intent: "Debugger-permission traffic review",
    status: "Debugger warning required",
    consentLabel: "I understand Chrome may show a debugging banner and traffic is read only during the scan.",
    detail: "Deep Scan is disabled until the debugger warning is acknowledged.",
    permissions: ["Request debugger permission", "Capture response metadata", "Review PII egress candidates"],
    disabledCopy: "Run stays disabled until the debugger warning checkbox is selected.",
    progress: "Deep Scan ran locally after debugger-warning acknowledgement; no debugger API was called.",
    result: "Debugger-permission path completed as a MOCK local action."
  }
];

const acknowledgements = {
  quick: true,
  active: false,
  deep: false
};

let selectedId = "quick";

const scanList = document.querySelector("[data-scan-list]");
const detailTitle = document.querySelector("[data-detail-title]");
const detailCopy = document.querySelector("[data-detail-copy]");
const permissionList = document.querySelector("[data-permission-list]");
const stateBox = document.querySelector("[data-state-box]");
const stateTitle = document.querySelector("[data-state-title]");
const stateCopy = document.querySelector("[data-state-copy]");
const progressBox = document.querySelector("[data-progress]");
const progressTitle = document.querySelector("[data-progress-title]");
const progressCopy = document.querySelector("[data-progress-copy]");
const sidePanel = document.querySelector("[data-side-panel]");
const selectedMode = document.querySelector("[data-selected-mode]");
const modeNote = document.querySelector("[data-mode-note]");
const resultCopy = document.querySelector("[data-result-copy]");
const evidence = document.querySelector("[data-evidence]");
const toast = document.querySelector("[data-toast]");

function selectedScan() {
  return scans.find((scan) => scan.id === selectedId) || scans[0];
}

function render() {
  scanList.innerHTML = scans.map(scanCard).join("");
  const scan = selectedScan();
  detailTitle.textContent = scan.title;
  detailCopy.textContent = scan.detail;
  permissionList.innerHTML = scan.permissions
    .map((permission) => `
      <div class="permission-row">
        <span class="permission-dot" aria-hidden="true"></span>
        <span>${permission}</span>
      </div>
    `)
    .join("");

  const ready = acknowledgements[scan.id];
  stateBox.classList.toggle("is-ready", ready);
  stateBox.classList.toggle("is-blocked", !ready);
  stateTitle.textContent = ready ? "Ready to run" : "Acknowledgement required";
  stateCopy.textContent = ready ? "The selected scan can run now." : scan.disabledCopy;
}

function scanCard(scan) {
  const ready = acknowledgements[scan.id];
  const selected = scan.id === selectedId;
  const consent = scan.consentLabel
    ? `
      <label class="check-row consent-box is-required">
        <input type="checkbox" data-ack="${scan.id}" ${ready ? "checked" : ""}>
        <span>${scan.consentLabel}</span>
      </label>
    `
    : `
      <div class="consent-box">
        <span class="pill pill--ready">No extra acknowledgement</span>
        <span class="muted">Passive review only.</span>
      </div>
    `;

  return `
    <section class="scan-card ${selected ? "is-selected" : ""}" data-card="${scan.id}">
      <div class="scan-card__top">
        <h3>${scan.title}</h3>
        <span class="chip chip--mock">MOCK</span>
      </div>
      <span class="muted">${scan.intent}</span>
      <span class="pill ${ready ? "pill--ready" : "pill--mock"}">${ready ? "Ready" : scan.status}</span>
      ${consent}
      <button class="primary-button" type="button" data-run="${scan.id}" ${ready ? "" : "disabled"}>Run ${scan.title}</button>
    </section>
  `;
}

scanList.addEventListener("click", (event) => {
  const ack = event.target.closest("[data-ack]");
  if (ack) {
    acknowledgements[ack.dataset.ack] = ack.checked;
    selectedId = ack.dataset.ack;
    render();
    return;
  }

  const runButton = event.target.closest("[data-run]");
  if (runButton) {
    runScan(runButton.dataset.run);
    return;
  }

  const card = event.target.closest("[data-card]");
  if (card) {
    selectedId = card.dataset.card;
    render();
  }
});

function runScan(scanId) {
  selectedId = scanId;
  const scan = selectedScan();
  if (!acknowledgements[scan.id]) {
    render();
    return;
  }

  progressBox.classList.add("is-visible");
  progressTitle.textContent = `${scan.title} MOCK progress`;
  progressCopy.textContent = scan.progress;
  selectedMode.textContent = scan.title;
  modeNote.textContent = scan.detail;
  resultCopy.textContent = scan.result;
  evidence.textContent = `Evidence: ${scan.title} local UI state, MOCK only`;
  sidePanel.hidden = false;
  render();
}

document.querySelectorAll("[data-panel-action]").forEach((button) => {
  button.addEventListener("click", () => {
    toast.textContent = "MOCK action recorded locally; no daemon or sponsor endpoint was called.";
    toast.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  });
});

render();
