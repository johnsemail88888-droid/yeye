import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Static scanner: walks a local repo, finds the agent's tool definitions and
// classifies their risk, then checks whether a runtime guard is wired in.
// Emits risk_map.json. (P0 = targeted at JS/TS agent apps.)

interface Finding {
  id: string;
  tool?: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
  file?: string;
}

const TOOL_RISK: Record<string, { category: string; severity: Finding["severity"]; detail: string }> = {
  refund_customer: { category: "money-movement", severity: "critical", detail: "moves money — must require approval above a threshold" },
  send_email: { category: "external-communication", severity: "critical", detail: "can exfiltrate data to an external recipient" },
  update_user_plan: { category: "privilege-change", severity: "high", detail: "changes account state / entitlements" },
  lookup_customer: { category: "pii-access", severity: "high", detail: "reads customer PII (name/email/phone)" },
  read_ticket: { category: "untrusted-input", severity: "medium", detail: "reads attacker-controllable ticket text" },
  create_support_reply: { category: "output", severity: "low", detail: "drafts a customer-facing reply" },
};

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "runs") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|js|tsx|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

const target = process.argv[2] || "examples/vulnerable-support-agent";
const files = walk(target);
const allText = files.map((f) => readFileSync(f, "utf8")).join("\n");

const foundTools = Object.keys(TOOL_RISK).filter((t) => new RegExp(`["'\`]?${t}["'\`]?\\s*[:=(]`).test(allText));
const findings: Finding[] = [];
let i = 1;
for (const t of foundTools) {
  const r = TOOL_RISK[t];
  findings.push({ id: `F${i++}`, tool: t, category: r.category, severity: r.severity, detail: r.detail });
}

const guardWired = /safeInvoke|capturePlan|intent_guard|tool_proxy/.test(allText);
if (!guardWired) {
  findings.push({ id: `F${i++}`, category: "missing-control", severity: "critical", detail: "no runtime intent guard: untrusted ticket text can trigger any tool, incl. money movement & PII exfiltration" });
}
const hasApprovalGate = /approval|hold_for_approval|threshold/.test(allText);
if (!hasApprovalGate) {
  findings.push({ id: `F${i++}`, category: "missing-control", severity: "high", detail: "no approval gate for high-impact tools (refund / plan change)" });
}

const riskMap = {
  target,
  scanned_files: files.length,
  tools: foundTools,
  high_impact_tools: foundTools.filter((t) => ["critical", "high"].includes(TOOL_RISK[t].severity)),
  untrusted_input_sources: ["support ticket text (read_ticket)"],
  guard_present: guardWired,
  approval_gate_present: hasApprovalGate,
  findings,
};

writeFileSync("risk_map.json", JSON.stringify(riskMap, null, 2));
console.log(`scanned ${files.length} files in ${target}`);
console.log(`tools: ${foundTools.join(", ")}`);
console.log(`findings: ${findings.length} (${findings.filter((f) => f.severity === "critical").length} critical)`);
for (const f of findings) console.log(`  [${f.severity.toUpperCase()}] ${f.tool ?? f.category}: ${f.detail}`);
console.log("\nrisk_map.json written");
