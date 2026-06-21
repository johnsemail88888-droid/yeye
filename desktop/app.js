// MOCK: replace this array with read-only GET /api/state risk fields when daemon data is already available.
const findings = [
  {
    id: "server-check",
    title: "MOCK missing server validation gate",
    file: "MOCK routes/login.tsx:40",
    dimension: "Excessive agency",
    severity: "MOCK high",
    summary: "The draft flow calls submitLogin before showing a clear validation boundary.",
    diff: [
      [" ", "function LoginGate({ formValues }) {"],
      [" ", "  const [message, setMessage] = useState(\"\");"],
      ["-", "  const result = submitLogin(formValues);"],
      ["+", "  const validation = validateLoginDraft(formValues);"],
      ["+", "  if (!validation.ok) {"],
      ["+", "    setMessage(validation.reason);"],
      ["+", "    return <InlineWarning>{validation.reason}</InlineWarning>;"],
      ["+", "  }"],
      ["+", "  const result = submitLogin(formValues);"],
      [" ", "  if (result.ok) return <Dashboard />;"],
      [" ", "}"]
    ]
  },
  {
    id: "cta-copy",
    title: "MOCK CTA copy hides verification",
    file: "MOCK routes/login.tsx:42",
    dimension: "Prompt injection",
    severity: "MOCK medium",
    summary: "The action label implies progress without naming the server-side check.",
    diff: [
      [" ", "return ("],
      ["-", "  <button>Continue without server check</button>"],
      ["+", "  <button>Continue with server check</button>"],
      ["+", "  <p>We verify this step before creating a session.</p>"],
      [" ", ");"]
    ]
  },
  {
    id: "preview-state",
    title: "MOCK preview lacks rejected state",
    file: "MOCK components/agent.tsx:18",
    dimension: "PII egress",
    severity: "MOCK low",
    summary: "Rejected patches need a durable label so the builder understands no edit landed.",
    diff: [
      [" ", "<PatchPreview"],
      [" ", "  mode=\"read-only\""],
      ["-", "  state={selectedPatch.state}"],
      ["+", "  state={selectedPatch.rejected ? \"rejected\" : selectedPatch.state}"],
      ["+", "  badge={selectedPatch.rejected ? \"Rejected MOCK\" : \"Preview MOCK\"}"],
      [" ", "/>"]
    ]
  }
];

const suggestionList = document.querySelector("[data-suggestions]");
const drawer = document.querySelector("[data-drawer]");
const diffNode = document.querySelector("[data-diff]");
const titleNode = document.querySelector("[data-drawer-title]");
const summaryNode = document.querySelector("[data-drawer-summary]");
const commandMenu = document.querySelector("[data-command-menu]");
let selectedId = findings[0].id;
const rejected = new Set();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function selectedFinding() {
  return findings.find((finding) => finding.id === selectedId) || findings[0];
}

function renderSuggestions() {
  suggestionList.innerHTML = findings
    .map((finding) => {
      const selected = finding.id === selectedId;
      const isRejected = rejected.has(finding.id);
      return `
        <button class="suggestion-card ${selected ? "is-selected" : ""}" type="button" data-select="${finding.id}">
          <div>
            <h3>${finding.title}</h3>
            <p class="muted">${finding.summary}</p>
          </div>
          <div class="card-meta">
            <span class="pill pill--mock">MOCK</span>
            <span class="pill">${finding.dimension}</span>
            <span class="pill">${finding.severity}</span>
            <span class="pill">${finding.file}</span>
            ${isRejected ? '<span class="pill">Rejected</span>' : '<span class="pill pill--accent">Preview ready</span>'}
          </div>
        </button>
      `;
    })
    .join("");
}

function renderDrawer() {
  const finding = selectedFinding();
  titleNode.textContent = finding.title;
  summaryNode.textContent = `${finding.file} - ${finding.summary}`;
  diffNode.innerHTML = finding.diff
    .map(([sign, text]) => {
      const className = sign === "+" ? "is-add" : sign === "-" ? "is-remove" : "is-context";
      return `<code class="diff-line ${className}"><span class="sign">${sign}</span><span>${escapeHtml(text)}</span></code>`;
    })
    .join("");
}

function openDrawer() {
  renderDrawer();
  drawer.hidden = false;
}

function closeDrawer() {
  drawer.hidden = true;
}

async function copyDiff(button) {
  const finding = selectedFinding();
  const text = finding.diff.map(([sign, line]) => `${sign} ${line}`).join("\n");
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
  button.textContent = "Copied MOCK diff";
}

suggestionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-select]");
  if (!button) return;
  selectedId = button.dataset.select;
  renderSuggestions();
  renderDrawer();
});

document.querySelectorAll("[data-open-drawer]").forEach((button) => {
  button.addEventListener("click", openDrawer);
});

document.querySelectorAll("[data-close-drawer]").forEach((button) => {
  button.addEventListener("click", closeDrawer);
});

document.querySelectorAll("[data-copy-diff]").forEach((button) => {
  button.addEventListener("click", () => copyDiff(button));
});

document.querySelectorAll("[data-reject]").forEach((button) => {
  button.addEventListener("click", () => {
    rejected.add(selectedId);
    closeDrawer();
    renderSuggestions();
  });
});

document.querySelectorAll("[data-command-trigger]").forEach((button) => {
  button.addEventListener("click", () => {
    commandMenu.classList.add("is-open");
    commandMenu.querySelector("input").focus();
  });
});

document.querySelector("[data-close-command]").addEventListener("click", () => {
  commandMenu.classList.remove("is-open");
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && key === "k") {
    event.preventDefault();
    commandMenu.classList.add("is-open");
    commandMenu.querySelector("input").focus();
  }
  if (event.key === "Escape") {
    commandMenu.classList.remove("is-open");
    closeDrawer();
  }
});

renderSuggestions();
renderDrawer();
