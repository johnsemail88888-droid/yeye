import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// Static scanner: finds the agent's tool definitions, classifies their risk, and
// checks whether a runtime guard is wired in. Core logic is a pure, exported,
// unit-tested function; the script `main()` does the file I/O.

export interface Finding {
  id: string;
  tool?: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
  file?: string;
}

export const TOOL_RISK: Record<string, { category: string; severity: Finding["severity"]; detail: string }> = {
  refund_customer: { category: "money-movement", severity: "critical", detail: "moves money — must require approval above a threshold" },
  send_email: { category: "external-communication", severity: "critical", detail: "can exfiltrate data to an external recipient" },
  update_user_plan: { category: "privilege-change", severity: "high", detail: "changes account state / entitlements" },
  lookup_customer: { category: "pii-access", severity: "high", detail: "reads customer PII (name/email/phone)" },
  read_ticket: { category: "untrusted-input", severity: "medium", detail: "reads attacker-controllable ticket text" },
  create_support_reply: { category: "output", severity: "low", detail: "drafts a customer-facing reply" },
};

export function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "runs") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|js|tsx|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

// Pure: given the concatenated source text, produce the risk map.
export function buildRiskMap(target: string, allText: string, scannedFiles: number) {
  const foundTools = Object.keys(TOOL_RISK).filter((t) => new RegExp(`["'\`]?${t}["'\`]?\\s*[:=(]`).test(allText));
  const findings: Finding[] = [];
  let i = 1;
  for (const t of foundTools) {
    const r = TOOL_RISK[t]!;
    findings.push({ id: `F${i++}`, tool: t, category: r.category, severity: r.severity, detail: r.detail });
  }
  const guard_present = /safeInvoke|capturePlan|intent_guard|tool_proxy/.test(allText);
  if (!guard_present) {
    findings.push({ id: `F${i++}`, category: "missing-control", severity: "critical", detail: "no runtime intent guard: untrusted ticket text can trigger any tool, incl. money movement & PII exfiltration" });
  }
  const approval_gate_present = /approval|hold_for_approval|threshold/.test(allText);
  if (!approval_gate_present) {
    findings.push({ id: `F${i++}`, category: "missing-control", severity: "high", detail: "no approval gate for high-impact tools (refund / plan change)" });
  }
  return {
    target,
    scanned_files: scannedFiles,
    tools: foundTools,
    high_impact_tools: foundTools.filter((t) => ["critical", "high"].includes(TOOL_RISK[t]!.severity)),
    untrusted_input_sources: ["support ticket text (read_ticket)"],
    guard_present,
    approval_gate_present,
    findings,
  };
}

function main() {
  const target = process.argv[2] || "examples/vulnerable-support-agent";
  const files = walk(target);
  const allText = files.map((f) => readFileSync(f, "utf8")).join("\n");
  const riskMap = buildRiskMap(target, allText, files.length);
  writeFileSync("risk_map.json", JSON.stringify(riskMap, null, 2));
  console.log(`scanned ${files.length} files in ${target}`);
  console.log(`tools: ${riskMap.tools.join(", ")}`);
  console.log(`findings: ${riskMap.findings.length} (${riskMap.findings.filter((f) => f.severity === "critical").length} critical)`);
  for (const f of riskMap.findings) console.log(`  [${f.severity.toUpperCase()}] ${f.tool ?? f.category}: ${f.detail}`);
  console.log("\nrisk_map.json written");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
