const scanData = {
  permissions: {
    title: "Agent permissions",
    findings: [
      {
        title: "Refund tool can execute before intent proof",
        detail: "The prototype should surface approval and signed-plan gaps before showing any fix.",
        risk: "critical",
        confidence: "high",
      },
      {
        title: "High-impact tools need separate review state",
        detail: "Refund, plan change, and outbound email actions should not share one generic status.",
        risk: "high",
        confidence: "medium",
      },
    ],
    steps: [
      ["Add intent gate", "Require a trusted goal signature before high-impact tool calls."],
      ["Separate approval holds", "Show refund thresholds as a distinct review lane."],
      ["Rerun same attack", "Keep the before ticket visible until after proof is attached."],
    ],
  },
  egress: {
    title: "Data egress",
    findings: [
      {
        title: "PII sink needs a destination label",
        detail: "Every outbound email preview should identify whether the recipient is trusted.",
        risk: "critical",
        confidence: "high",
      },
      {
        title: "Payload diff is missing from review",
        detail: "The fix path needs a narrow before/after payload view, not only a summary.",
        risk: "high",
        confidence: "medium",
      },
    ],
    steps: [
      ["Name the sink", "Display internal, customer, or external destination state next to payloads."],
      ["Highlight sensitive fields", "Inline mark customer profile fields that would leave the app."],
      ["Attach proof", "Store the blocked egress attempt with the final recommendation."],
    ],
  },
  runtime: {
    title: "Runtime guard",
    findings: [
      {
        title: "Guard state should sit beside the finding",
        detail: "Users need to see whether a finding is unguarded, held, blocked, or verified.",
        risk: "high",
        confidence: "medium",
      },
      {
        title: "After-run proof needs its own finish state",
        detail: "The flow should end on verified repair evidence, not the installation moment.",
        risk: "medium",
        confidence: "medium",
      },
    ],
    steps: [
      ["Install compatible guard", "Show the local adapter label unless a real SDK artifact exists."],
      ["Run identical attack", "Compare before and after status without changing the ticket."],
      ["Run mutation", "Keep paraphrased attack proof in the same repair thread."],
    ],
  },
};

const modeButtons = document.querySelectorAll("[data-mode]");
const panels = document.querySelectorAll("[data-panel]");
const choiceButtons = document.querySelectorAll("[data-choice]");
const findingList = document.querySelector("#finding-list");
const stepList = document.querySelector("#step-list");
const repairTitle = document.querySelector("#repair-title");
const riskTitle = document.querySelector("#risk-title");
const runScan = document.querySelector("[data-run-scan]");
const commandMenu = document.querySelector("[data-command-menu]");
const commandButtons = document.querySelectorAll("[data-command]");
const commandOpener = document.querySelector(".primary-action");

let activeChoice = "permissions";

function setMode(mode) {
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === mode);
  });
}

function renderChoice(choice) {
  // MOCK: replace findings with GET /api/state.risk_map when a running daemon is available.
  const data = scanData[choice];
  activeChoice = choice;
  choiceButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.choice === choice);
  });
  riskTitle.textContent = data.title;
  repairTitle.textContent = `${data.title} fix path`;
  findingList.innerHTML = data.findings
    .map(
      (finding) => `
      <article class="finding-row">
        <div>
          <h3>${finding.title}</h3>
          <p>${finding.detail}</p>
        </div>
        <div class="tag-stack" aria-label="Finding labels">
          <span class="tag ${finding.risk === "critical" ? "red" : "amber"}">${finding.risk}</span>
          <span class="tag blue">confidence ${finding.confidence}</span>
          <span class="tag green">MOCK</span>
        </div>
      </article>
    `,
    )
    .join("");
  stepList.innerHTML = data.steps
    .map(
      ([title, detail]) => `
      <li>
        <div>
          <strong>${title}</strong>
          <span>${detail}</span>
        </div>
      </li>
    `,
    )
    .join("");
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => renderChoice(button.dataset.choice));
});

runScan.addEventListener("click", () => {
  const choices = Object.keys(scanData);
  const next = choices[(choices.indexOf(activeChoice) + 1) % choices.length];
  renderChoice(next);
});

function openCommandMenu() {
  commandMenu.hidden = false;
  commandMenu.querySelector("input").focus();
}

function closeCommandMenu() {
  commandMenu.hidden = true;
}

function runCommand(command) {
  if (command === "site") {
    setMode("site");
  }
  if (command === "desktop") {
    setMode("desktop");
  }
  if (command === "runtime") {
    setMode("site");
    renderChoice("runtime");
  }
  closeCommandMenu();
}

commandOpener.addEventListener("click", openCommandMenu);
commandButtons.forEach((button) => {
  button.addEventListener("click", () => runCommand(button.dataset.command));
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && key === "k") {
    event.preventDefault();
    openCommandMenu();
  }
  if (event.key === "Escape") {
    closeCommandMenu();
  }
  if (event.ctrlKey && event.key === "2") {
    event.preventDefault();
    setMode("desktop");
  }
  if (event.ctrlKey && event.key === "3") {
    event.preventDefault();
    setMode("site");
    renderChoice("runtime");
  }
});

renderChoice(activeChoice);
