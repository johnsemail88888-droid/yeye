// MOCK: replace scan cards and side-panel findings with read-only GET /api/state fields when daemon data is already available.
const scans = [
  {
    id: "quick",
    title: "Quick Scan",
    intent: "Passive browser-surface review",
    estimate: "MOCK estimate: short",
    consent: "No typing into the page. Reads DOM, headers, and request metadata only.",
    steps: ["Reading DOM", "Checking headers", "Mapping request metadata"],
    panelNote: "Quick Scan is passive. PII egress stays Possible unless a real body capture backs it."
  },
  {
    id: "active",
    title: "Active Probe",
    intent: "Benign canary prompt behavior",
    estimate: "MOCK estimate: consented",
    consent: "Consent line: We will type test messages into this page as you.",
    steps: ["Confirming consent", "Typing benign canary", "Reading streamed reply"],
    panelNote: "Active Probe observes behavior from the user's seat; root cause may still live server-side."
  },
  {
    id: "deep",
    title: "Deep Scan",
    intent: "Debugger-permission traffic review",
    estimate: "MOCK estimate: power user",
    consent: "Chrome may show a debugging banner. Traffic is read only during the scan.",
    steps: ["Requesting debugger consent", "Capturing response metadata", "Checking PII review items"],
    panelNote: "Deep Scan is opt-in and still labels unbacked observations as MOCK in this prototype."
  }
];

const scanList = document.querySelector("[data-scan-list]");
const progressBox = document.querySelector("[data-progress]");
const progressTitle = document.querySelector("[data-progress-title]");
const progressSteps = document.querySelector("[data-progress-steps]");
const sidePanel = document.querySelector("[data-side-panel]");
const miniPanel = document.querySelector("[data-mini-panel]");
const selectedMode = document.querySelector("[data-selected-mode]");
const modeNote = document.querySelector("[data-mode-note]");
const toast = document.querySelector("[data-toast]");
let selectedId = "quick";

function renderScanCards() {
  scanList.innerHTML = scans
    .map((scan) => `
      <button class="scan-card ${scan.id === selectedId ? "is-selected" : ""}" type="button" data-scan="${scan.id}">
        <span class="scan-card__top">
          <strong>${scan.title}</strong>
          <span class="chip chip--mock">MOCK</span>
        </span>
        <span class="muted">${scan.intent}</span>
        <span class="pill">${scan.estimate}</span>
        <span class="muted">${scan.consent}</span>
      </button>
    `)
    .join("");
}

function renderProgress(scan, activeIndex) {
  progressTitle.textContent = `${scan.title} MOCK progress`;
  progressSteps.innerHTML = scan.steps
    .map((step, index) => {
      const state = index < activeIndex ? "is-done" : index === activeIndex ? "is-active" : "";
      return `
        <div class="progress-step ${state}">
          <span class="dot" aria-hidden="true"></span>
          <span>${step}</span>
        </div>
      `;
    })
    .join("");
}

async function runMockScan(scan) {
  selectedId = scan.id;
  renderScanCards();
  progressBox.classList.add("is-visible");
  sidePanel.hidden = true;
  miniPanel.classList.remove("is-open");
  miniPanel.innerHTML = '<span class="pill pill--mock">MOCK scan running</span><p class="muted">Progress is local-only; no daemon or live scan endpoint was called.</p>';

  for (let index = 0; index < scan.steps.length; index += 1) {
    renderProgress(scan, index);
    await wait(220);
  }

  renderProgress(scan, scan.steps.length);
  selectedMode.textContent = scan.title;
  modeNote.textContent = scan.panelNote;
  sidePanel.hidden = false;
  miniPanel.classList.add("is-open");
  miniPanel.innerHTML = '<span class="pill pill--mock">Side panel open</span><p class="muted">The pinned results panel is now visible with MOCK findings and confidence labels.</p>';
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

scanList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-scan]");
  if (!button) return;
  const scan = scans.find((item) => item.id === button.dataset.scan);
  runMockScan(scan);
});

document.querySelectorAll("[data-panel-action]").forEach((button) => {
  button.addEventListener("click", () => {
    toast.textContent = "MOCK action recorded locally; no daemon or sponsor endpoint was called.";
    toast.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  });
});

renderScanCards();
