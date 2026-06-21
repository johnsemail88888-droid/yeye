// MOCK: replace with read-only GET /api/state fields when daemon state is already running.
const dimensions = [
  {
    id: "prompt",
    title: "Prompt Injection",
    score: "MOCK needs review",
    badge: "MOCK 2",
    open: false,
    findings: [
      {
        id: "canary",
        title: "MOCK canary prompt changed the agent tone",
        severity: "MOCK Serious",
        confidence: "Likely",
        type: "review",
        evidence: "DOM reply: data-testid=agent-stream, canary phrase observed in visible output.",
        why: "The extension can observe the symptom from the user's seat, but not the server prompt root cause.",
        steps: [
          "Add a gateway policy check before retrieved or user-supplied content reaches the model.",
          "Pin system instructions server-side and strip user content that asks the agent to ignore policy.",
          "Verify by re-running the same benign canary prompt."
        ]
      }
    ]
  },
  {
    id: "agency",
    title: "Excessive Agency",
    score: "MOCK fix now",
    badge: "MOCK 1",
    open: false,
    findings: [
      {
        id: "tool-scope",
        title: "MOCK state-changing tool appears reachable",
        severity: "MOCK Serious",
        confidence: "Likely",
        type: "now",
        evidence: "Static client source mentions tool: updateCustomerAddress.",
        why: "The page exposes a clue that a high-impact support action exists; server-side confirmation still has to be verified.",
        steps: [
          "Require user confirmation before any state-changing support action.",
          "Scope tool permissions server-side to the logged-in account and current ticket.",
          "Re-run Active Probe and confirm the tool is never invoked without confirmation."
        ]
      }
    ]
  },
  {
    id: "pii",
    title: "PII Egress",
    score: "MOCK possible",
    badge: "MOCK 1",
    open: false,
    findings: [
      {
        id: "analytics",
        title: "MOCK third-party endpoint may receive transcript data",
        severity: "MOCK Moderate",
        confidence: "Possible",
        type: "review",
        evidence: "Request metadata: https://analytics.example.test/collect",
        why: "Quick Scan sees request metadata, not response bodies. Treat this as a review item until Deep Scan or server logs confirm it.",
        steps: [
          "Add a CSP connect-src allowlist for approved telemetry hosts.",
          "Strip PII from transcript analytics before export.",
          "Verify with request metadata and, if consented, Deep Scan body capture."
        ]
      }
    ]
  }
];

const stack = document.querySelector("[data-accordion-stack]");
const toast = document.querySelector("[data-toast]");
let activeFilter = "all";

function render() {
  stack.innerHTML = dimensions
    .map((dimension) => {
      const findings = dimension.findings.filter((finding) => activeFilter === "all" || finding.type === activeFilter);
      return `
        <details class="dimension" ${dimension.open ? "open" : ""} data-dimension="${dimension.id}">
          <summary>
            <span class="accordion-title">
              ${dimension.title}
              <span class="chip chip--mock">${dimension.badge}</span>
            </span>
            <span class="pill">${dimension.score}</span>
          </summary>
          <div class="dimension-body">
            ${
              findings.length
                ? findings.map(findingTemplate).join("")
                : '<div class="finding"><strong>No MOCK rows in this filter.</strong><span class="muted">Switch filters to see the remaining review items.</span></div>'
            }
          </div>
        </details>
      `;
    })
    .join("");
}

function findingTemplate(finding) {
  const confidenceClass = finding.confidence === "Likely" ? "confidence-likely" : "confidence-possible";
  const severityClass = finding.severity.includes("Serious") ? "severity-high" : "severity-medium";
  return `
    <article class="finding" data-finding="${finding.id}">
      <h3 class="finding-title">${finding.title}</h3>
      <div class="finding-meta">
        <span class="chip chip--mock">MOCK</span>
        <span class="chip ${severityClass}">${finding.severity}</span>
        <span class="chip ${confidenceClass}">Confidence: ${finding.confidence}</span>
        <span class="chip">${finding.type === "now" ? "Fix now" : "Needs review"}</span>
      </div>
      <p class="muted">${finding.why}</p>
      <div class="evidence">${finding.evidence}</div>
      <ol class="steps">
        ${finding.steps.map((step) => `<li>${step}</li>`).join("")}
      </ol>
      <div class="evidence-row">
        <button class="link-button" type="button" data-highlight="${finding.id}">Highlight on page</button>
        <button class="link-button" type="button" data-copy="${finding.id}">Copy fix steps</button>
      </div>
    </article>
  `;
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

stack.addEventListener("toggle", (event) => {
  if (!event.target.matches("[data-dimension]")) return;
  const dimension = dimensions.find((item) => item.id === event.target.dataset.dimension);
  if (dimension) dimension.open = event.target.open;
}, true);

stack.addEventListener("click", async (event) => {
  const highlightButton = event.target.closest("[data-highlight]");
  if (highlightButton) {
    const target = document.querySelector("[data-highlight-target]");
    target.classList.add("highlight-target");
    target.scrollIntoView({ block: "center", inline: "nearest" });
    showToast("MOCK highlight applied to the visible page element.");
    return;
  }

  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    const finding = dimensions.flatMap((dimension) => dimension.findings).find((item) => item.id === copyButton.dataset.copy);
    const text = finding.steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    copyButton.textContent = "Copied MOCK steps";
    showToast("MOCK fix steps copied.");
  }
});

document.querySelector("[data-export]").addEventListener("click", () => {
  showToast("MOCK export queued locally; no sponsor or daemon call was made.");
});

document.querySelector("[data-rerun]").addEventListener("click", () => {
  showToast("MOCK re-run requested; prototype did not call a live scan endpoint.");
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

render();
