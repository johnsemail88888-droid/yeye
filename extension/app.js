const scans = {
  quick: {
    label: "Quick Scan",
    consent: "Passive only: DOM, headers, and request metadata. MOCK evidence until bound to GET /api/state.",
  },
  active: {
    label: "Active Probe",
    consent: "Consent required: this flow would type benign canary prompts as the logged-in user. MOCK evidence.",
  },
  deep: {
    label: "Deep Scan",
    consent: "Debugger permission required: this flow would read traffic only during the scan. MOCK evidence.",
  },
};

// MOCK: replace with GET /api/state.risk_map plus observed browser canary evidence when daemon data is available.
const dimensions = [
  {
    id: "prompt",
    name: "Prompt Injection",
    dot: "",
    count: "MOCK",
    open: true,
    findings: [
      {
        title: "Canary prompt appears to override the task boundary",
        severity: "critical",
        confidence: "Likely",
        evidence: "DOM selector: [data-agent-output] - canary response shown in side panel",
        why: "A live-site audit can observe the symptom from the user's seat, but server-side root cause remains inferred.",
        type: "fix-now",
        steps: [
          "Wrap retrieved or user-authored content in a gateway policy before it reaches the model.",
          "Pin the trusted system instruction server-side and reject tool calls that are not in the signed plan.",
          "Verify by rerunning the same canary probe after deployment.",
        ],
      },
    ],
  },
  {
    id: "agency",
    name: "Excessive Agency",
    dot: "warn",
    count: "MOCK",
    open: false,
    findings: [
      {
        title: "State-changing action lacks a visible confirmation step",
        severity: "warning",
        confidence: "Possible",
        evidence: "Request metadata indicates a state-changing route; source is not visible to the extension.",
        why: "Mode 1 can flag observable behavior and guide infra controls, not prove the implementation path.",
        type: "review",
        steps: [
          "Require confirmation before destructive or money-moving tools.",
          "Scope tool permissions server-side by route and user role.",
          "Add a hold state for actions that exceed the allowed threshold.",
        ],
      },
    ],
  },
  {
    id: "pii",
    name: "PII Egress",
    dot: "pii",
    count: "MOCK",
    open: false,
    findings: [
      {
        title: "Third-party connection may receive sensitive content",
        severity: "pii",
        confidence: "Possible",
        evidence: "Request URL observed; response body is unavailable without Deep Scan permission.",
        why: "PII egress is inferred unless the browser captured the body, so the UI keeps confidence separate from severity.",
        type: "infra",
        steps: [
          "Add a CSP connect-src allowlist for approved agent and analytics endpoints.",
          "Strip customer profile fields before analytics or support exports.",
          "Verify by rerunning Deep Scan only after explicit consent.",
        ],
      },
    ],
  },
];

const scanCards = document.querySelectorAll("[data-scan]");
const modeLabel = document.querySelector("[data-mode-label]");
const consent = document.querySelector("[data-consent]");
const dimensionsRoot = document.querySelector("[data-dimensions]");
const popup = document.querySelector("[data-popup]");
const targetBubble = document.querySelector("[data-highlight-target]");

let activeScan = "quick";
let activeFilter = "all";

function chipClass(severity) {
  if (severity === "pii") return "pii";
  if (severity === "warning") return "warning";
  return "critical";
}

function renderDimensions() {
  dimensionsRoot.innerHTML = dimensions
    .map((dimension) => {
      const findings = dimension.findings.filter((finding) => activeFilter === "all" || finding.type === activeFilter);
      return `
        <details class="dimension" ${dimension.open ? "open" : ""}>
          <summary class="dimension-summary">
            <span class="dimension-name">
              <span class="score-dot ${dimension.dot}" aria-hidden="true"></span>
              <strong>${dimension.name}</strong>
            </span>
            <span class="count-badge">${findings.length ? dimension.count : "0"}</span>
          </summary>
          <div class="finding-list">
            ${findings.length ? findings.map(renderFinding).join("") : `<div class="finding-row"><span class="finding-why">No MOCK findings in this filter.</span></div>`}
          </div>
        </details>
      `;
    })
    .join("");

  document.querySelectorAll("[data-highlight]").forEach((button) => {
    button.addEventListener("click", () => {
      targetBubble.classList.add("is-highlighted");
      setTimeout(() => targetBubble.classList.remove("is-highlighted"), 900);
    });
  });
}

function renderFinding(finding) {
  return `
    <article class="finding-row">
      <div class="finding-header">
        <span class="finding-title">${finding.title}</span>
        <span class="chip-row">
          <span class="chip ${chipClass(finding.severity)}">${finding.severity}</span>
          <span class="chip confidence">${finding.confidence}</span>
          <span class="u-mock">MOCK</span>
        </span>
      </div>
      <div class="evidence-box">
        <span class="finding-evidence">${finding.evidence}</span>
        <button class="highlight-button" type="button" data-highlight>Highlight on page</button>
      </div>
      <p class="finding-why">${finding.why}</p>
      <ol class="fix-list">
        ${finding.steps.map((step) => `<li class="fix-step"><span>${step}</span></li>`).join("")}
      </ol>
    </article>
  `;
}

scanCards.forEach((card) => {
  card.addEventListener("click", () => {
    activeScan = card.dataset.scan;
    scanCards.forEach((item) => item.classList.toggle("is-selected", item === card));
    modeLabel.textContent = scans[activeScan].label;
    consent.textContent = scans[activeScan].consent;
  });
});

document.querySelector("[data-run-scan]").addEventListener("click", () => {
  popup.classList.add("is-hidden");
  document.querySelectorAll(".progress-step").forEach((step, index) => {
    step.classList.toggle("is-active", index === 2);
  });
});

document.querySelector("[data-command='toggle-popup']").addEventListener("click", () => {
  popup.classList.toggle("is-hidden");
});

document.querySelectorAll("[data-filter]").forEach((filter) => {
  filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === filter));
    renderDimensions();
  });
});

renderDimensions();
