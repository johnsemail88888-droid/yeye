const findings = [
  {
    id: "token",
    title: "MOCK token is shaped like production state",
    line: "MOCK line 20",
    severity: "MOCK high",
    confidence: "MOCK likely",
    summary: "A demo token appears in component state. Treat this as a product-design placeholder, not a real scan result.",
    diagnosis:
      "Diagnosis: the sign-in surface mixes a demo credential with live-looking control flow, so reviewers cannot tell what is safe to ship.",
    fix: "Fix: move the placeholder into an explicit mock adapter and gate it behind a clearly named demo mode.",
    verify:
      "Verify: run the imported app with demo mode disabled and confirm the token path cannot render in the sign-in surface.",
    snippet:
      "const sessionToken = getSessionToken({\n  source: \"server-only\",\n  mockMode: false\n});"
  },
  {
    id: "form",
    title: "MOCK form action bypasses review boundary",
    line: "MOCK line 22",
    severity: "MOCK medium",
    confidence: "MOCK plausible",
    summary: "The form action looks like a direct API path. The card turns that into a readable next action for a builder.",
    diagnosis:
      "Diagnosis: the submit path does not explain whether validation happens before the request leaves the client.",
    fix: "Fix: add a validation function next to the submit handler and surface failure copy before the request.",
    verify:
      "Verify: submit empty, malformed, and valid mock values; each state should show one clear message.",
    snippet:
      "const result = validateLoginDraft(formValues);\nif (!result.ok) {\n  setInlineMessage(result.reason);\n  return;\n}"
  },
  {
    id: "button",
    title: "MOCK CTA copy hides the security step",
    line: "MOCK line 24",
    severity: "MOCK medium",
    confidence: "MOCK directional",
    summary: "The copy makes a risky path sound casual. The fix section proposes concrete safer language.",
    diagnosis:
      "Diagnosis: the button text suggests progress without telling the user a server-side check is still required.",
    fix: "Fix: change the action label and add a helper line that names the verification boundary.",
    verify:
      "Verify: zoom to 150 percent and confirm the button, helper text, and message stay readable without overlap.",
    snippet:
      "<button>Continue with server check</button>\n<p>We verify this step before creating a session.</p>"
  }
];

const list = document.querySelector("[data-finding-list]");
const statusNode = document.querySelector("[data-status]");
const applyButton = document.querySelector("[data-apply]");
const commandMenu = document.querySelector("[data-command-menu]");
let selectedId = findings[0].id;
const checked = new Set();

function sectionTemplate(finding, type, text) {
  const label = type[0].toUpperCase() + type.slice(1);
  const isFix = type === "fix";
  return `
    <details class="remediation-section" open data-section="${type}">
      <summary>${label}</summary>
      <div class="section-body">
        <p>${text}</p>
        ${
          isFix
            ? `<div class="copy-row">
                <pre class="snippet"><code>${escapeHtml(finding.snippet)}</code></pre>
                <button class="copy-button" type="button" data-copy="${finding.id}" aria-label="Copy MOCK ${label} snippet">
                  <span class="button-icon" aria-hidden="true">[]</span>
                  Copy
                </button>
              </div>`
            : ""
        }
        <label class="step-check">
          <input type="checkbox" data-check="${finding.id}:${type}" ${checked.has(`${finding.id}:${type}`) ? "checked" : ""}>
          <span>${label} reviewed for this MOCK finding</span>
        </label>
      </div>
    </details>
  `;
}

function render() {
  list.innerHTML = findings
    .map((finding) => {
      const doneCount = ["diagnosis", "fix", "verify"].filter((type) => checked.has(`${finding.id}:${type}`)).length;
      return `
        <article class="${finding.id === selectedId ? "remediation-card" : "finding-card"} ${finding.id === selectedId ? "" : "finding-card-button"}" data-card="${finding.id}" tabindex="0">
          <div class="${finding.id === selectedId ? "remediation-card__header" : "finding-card__head"}">
            <div>
              <h3>${finding.title}</h3>
              <p class="muted">${finding.summary}</p>
            </div>
            <span class="finding-card__line">${finding.line}</span>
          </div>
          <div class="card-meta">
            <span class="pill pill--mock">MOCK</span>
            <span class="pill severity">${finding.severity}</span>
            <span class="pill confidence">${finding.confidence}</span>
          </div>
          ${
            finding.id === selectedId
              ? `<div class="completion-row">
                  <span class="completion-pill ${doneCount > 0 ? "is-done" : ""}">Diagnosis</span>
                  <span class="completion-pill ${doneCount > 1 ? "is-done" : ""}">Fix</span>
                  <span class="completion-pill ${doneCount > 2 ? "is-done" : ""}">Verify</span>
                </div>
                ${sectionTemplate(finding, "diagnosis", finding.diagnosis)}
                ${sectionTemplate(finding, "fix", finding.fix)}
                ${sectionTemplate(finding, "verify", finding.verify)}`
              : `<span class="visually-muted">Select for copyable Diagnosis - Fix - Verify steps</span>`
          }
        </article>
      `;
    })
    .join("");

  const selectedComplete = ["diagnosis", "fix", "verify"].every((type) => checked.has(`${selectedId}:${type}`));
  applyButton.disabled = !selectedComplete;
  statusNode.textContent = selectedComplete
    ? "Selected MOCK remediation is ready to draft as a suggested patch."
    : "Draft patch is disabled until every Verify checkbox is complete.";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function copyText(text, button) {
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
  button.dataset.copied = "true";
  button.innerHTML = '<span class="button-icon" aria-hidden="true">OK</span> Copied MOCK';
}

list.addEventListener("click", (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    const finding = findings.find((item) => item.id === copyButton.dataset.copy);
    copyText(finding.snippet, copyButton);
    return;
  }

  const checkbox = event.target.closest("[data-check]");
  if (checkbox) {
    if (checkbox.checked) {
      checked.add(checkbox.dataset.check);
    } else {
      checked.delete(checkbox.dataset.check);
    }
    render();
    return;
  }

  const card = event.target.closest("[data-card]");
  if (card && card.dataset.card !== selectedId) {
    selectedId = card.dataset.card;
    render();
  }
});

list.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  const card = event.target.closest("[data-card]");
  if (card) {
    event.preventDefault();
    selectedId = card.dataset.card;
    render();
  }
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

document.querySelector("[data-copy-selected]").addEventListener("click", (event) => {
  const finding = findings.find((item) => item.id === selectedId);
  copyText(`${finding.diagnosis}\n\n${finding.fix}\n\n${finding.verify}`, event.currentTarget);
});

document.querySelector("[data-reveal]").addEventListener("click", () => {
  document.querySelector(".hotspot").scrollIntoView({ block: "center", inline: "nearest" });
  statusNode.textContent = "Selected MOCK source line is centered in the read-only editor.";
});

applyButton.addEventListener("click", () => {
  statusNode.textContent = "Draft patch prepared as MOCK handoff copy; no source files were changed.";
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && key === "k") {
    event.preventDefault();
    commandMenu.classList.add("is-open");
    commandMenu.querySelector("input").focus();
  }
  if (event.key === "Escape") {
    commandMenu.classList.remove("is-open");
  }
});

render();
