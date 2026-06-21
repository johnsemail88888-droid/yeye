import { getSponsorStatus } from "../ui-next/sponsors.js";

const state = {
  summary: null,
  copied: false,
  exported: false
};

async function loadSummary() {
  try {
    const response = await fetch("./summary.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    state.summary = await response.json();
  } catch (error) {
    // MOCK: replace with read-only GET /api/state summary when available.
    state.summary = {
      source: "MOCK TODO",
      captured_at_local: "unavailable",
      project_id: "MOCK TODO",
      run_id: "MOCK TODO",
      finding_count: 0,
      critical_count: 0,
      after_fail_count: 0,
      demo_ready: false,
      report_audit_pass: false,
      phoenix_or_local_experiment_present: false,
      phoenix_collector_endpoint: "",
      live_scan_source: "MOCK TODO",
      live_scan_run_id: "MOCK TODO",
      evidence_files: []
    };
  }
  render();
}

function render() {
  const summary = state.summary;
  const sponsor = getSponsorStatus(summary);
  document.querySelector("#findingCount").textContent = String(summary.finding_count);
  document.querySelector("#criticalCount").textContent = String(summary.critical_count);
  document.querySelector("#afterFailCount").textContent = String(summary.after_fail_count);
  document.querySelector("#runId").textContent = `${summary.project_id} / ${summary.run_id}`;
  document.querySelector("#evidenceFiles").textContent = summary.evidence_files.join(", ") || "MOCK TODO";
  document.querySelector("#auditState").textContent =
    `demo_ready=${summary.demo_ready}; report_audit_pass=${summary.report_audit_pass}`;
  document.querySelector("#phoenixChip").textContent = sponsor.phoenix.label;
  document.querySelector("#phoenixChip").dataset.tone = sponsor.phoenix.tone;
  document.querySelector("#exportMode").textContent = sponsor.phoenix.canSend ? "Phoenix live" : "Local fallback";
  document.querySelector("#exportMode").dataset.tone = sponsor.phoenix.tone;
  document.querySelector("#exportReason").textContent = sponsor.phoenix.reason;
  document.querySelector("#sendPhoenix").disabled = !sponsor.phoenix.canSend;
  document.querySelector("#sourceChip").textContent = summary.source.includes("/api/state") ? "LIVE /api/state" : "MOCK TODO";
  document.querySelector("#sourceChip").dataset.tone = summary.source.includes("/api/state") ? "live" : "fallback";

  const status = document.querySelector("#statusLine");
  if (state.copied) {
    status.textContent = "Payload summary copied locally for review. No network send was attempted.";
  } else if (state.exported) {
    status.textContent = `Local export bundle references ${summary.evidence_files.length} artifact groups for ${summary.run_id}.`;
  } else {
    status.textContent = "No export action yet.";
  }
}

document.querySelector("#exportLocal").addEventListener("click", () => {
  state.exported = true;
  state.copied = false;
  render();
});

document.querySelector("#copyPayload").addEventListener("click", async () => {
  const summary = state.summary;
  const payload = {
    project_id: summary.project_id,
    run_id: summary.run_id,
    finding_count: summary.finding_count,
    critical_count: summary.critical_count,
    after_fail_count: summary.after_fail_count,
    evidence_files: summary.evidence_files,
    destination: summary.phoenix_collector_endpoint ? "phoenix" : "local fallback"
  };
  state.copied = true;
  state.exported = false;
  render();
  try {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  } catch (error) {
    // Clipboard can be blocked in file-like contexts; the UI still records the local action.
  }
});

loadSummary();
