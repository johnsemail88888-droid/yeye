// MOCK: replace with real findings from risk_map.json or GET /api/state when daemon data is available.
const findings = [
  {
    id: "refund",
    dimension: "agency",
    title: "Refund call needs an approval gate",
    severity: "Critical",
    file: "agent.ts:19",
    body: "State-changing tool execution should pause for explicit approval before money movement.",
    diff: [
      "- await refund_customer(plan.customerId, plan.amount)",
      '+ await requireApproval("refund", plan.customerId, plan.amount)',
      "+ await refund_customer(plan.customerId, plan.amount)",
    ],
    metadata: "auto-fixable: yes - MOCK",
  },
  {
    id: "pii",
    dimension: "pii",
    title: "Customer profile egress needs a trusted sink",
    severity: "High",
    file: "agent.ts:21",
    body: "External email should not receive the full customer profile without a destination allowlist.",
    diff: [
      "- await send_email(externalAddress, customer.profile)",
      "+ await send_email(allowlistedAddress, redactProfile(customer.profile))",
    ],
    metadata: "auto-fixable: partial - MOCK",
  },
];

const suggestionRoot = document.querySelector("[data-suggestions]");
const editor = document.querySelector("[data-editor]");
const diff = document.querySelector("[data-diff]");
const preview = document.querySelector("[data-preview]");
const previewCard = document.querySelector("[data-preview-card]");
const command = document.querySelector("[data-command]");
const autofix = document.querySelector("[data-autofix]");

let selectedFindingId = "refund";
let activeFilter = "all";

function visibleFindings() {
  return findings.filter((finding) => activeFilter === "all" || finding.dimension === activeFilter);
}

function renderSuggestions() {
  suggestionRoot.innerHTML = visibleFindings()
    .map((finding) => {
      const selected = finding.id === selectedFindingId;
      return `
        <article class="suggestion ${selected ? "is-selected" : ""}" data-card-id="${finding.id}">
          <div class="suggestion-head">
            <strong>${finding.title}</strong>
            <span class="chip-row">
              <span class="chip ${finding.dimension}">${finding.dimension}</span>
              <span class="chip critical">${finding.severity}</span>
              <span class="chip mock">MOCK</span>
            </span>
          </div>
          <p>${finding.file} - ${finding.body}</p>
          <div class="mini-diff" aria-label="Mock proposed diff">
            ${finding.diff.map((line) => `<span class="${line.startsWith("-") ? "diff-row remove" : "diff-row add"}">${line}</span>`).join("")}
          </div>
          <div class="suggestion-actions">
            <button type="button" data-apply="${finding.id}">Apply</button>
            <button type="button">Dismiss</button>
            <button type="button">Explain</button>
          </div>
        </article>
      `;
    })
    .join("");

  suggestionRoot.querySelectorAll("[data-card-id]").forEach((card) => {
    card.addEventListener("click", () => selectFinding(card.dataset.cardId));
  });
  suggestionRoot.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      selectFinding(button.dataset.apply);
      showDiff();
    });
  });
  const selected = findings.find((finding) => finding.id === selectedFindingId);
  autofix.textContent = selected ? selected.metadata : "MOCK";
}

function selectFinding(id) {
  selectedFindingId = id;
  editor.querySelectorAll("[data-finding-id]").forEach((line) => {
    const selected = line.dataset.findingId === id;
    line.classList.toggle("is-selected", selected);
    if (selected) line.scrollIntoView({ block: "nearest" });
  });
  renderSuggestions();
}

function showDiff() {
  diff.hidden = false;
  previewCard.classList.add("is-applied");
  previewCard.querySelector("strong").textContent = "Inline diff previewed";
  previewCard.querySelector("span:last-child").textContent = "Apply remains gated; this prototype does not write source.";
}

editor.querySelectorAll("[data-finding-id]").forEach((line) => {
  line.addEventListener("click", () => selectFinding(line.dataset.findingId));
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
    const first = visibleFindings()[0];
    if (first) selectedFindingId = first.id;
    renderSuggestions();
  });
});

document.querySelector("[data-toggle-panel]").addEventListener("click", () => {
  document.querySelector(".suggestions-pane").classList.toggle("is-collapsed");
});

document.querySelector("[data-toggle-preview]").addEventListener("click", () => {
  preview.hidden = !preview.hidden;
});

document.querySelectorAll("[data-command-open]").forEach((button) => {
  button.addEventListener("click", () => {
    command.hidden = false;
    command.querySelector("input").focus();
  });
});

document.querySelectorAll("[data-command-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.commandAction;
    if (action === "apply") showDiff();
    if (action === "refund" || action === "pii") selectFinding(action);
    command.hidden = true;
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && key === "k") {
    event.preventDefault();
    command.hidden = false;
    command.querySelector("input").focus();
  }
  if (event.key === "Escape") {
    command.hidden = true;
  }
  if (event.key === "Tab" && !command.hidden) {
    event.preventDefault();
    showDiff();
    command.hidden = true;
  }
});

renderSuggestions();
