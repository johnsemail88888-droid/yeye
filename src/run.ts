import { runAll, type RunRecord } from "./harness";

function printTable(records: RunRecord[], label: string) {
  console.log(`\n=== ${label} ===`);
  for (const r of records) {
    console.log(`  ${r.eval.final_status.padEnd(14)} ${r.test}`);
    if (r.eval.unauthorized_tool_call_executed) {
      const bad = r.executed.filter((c) => c.tool === "refund_customer" || c.tool === "send_email" || c.tool === "update_user_plan");
      console.log(`       -> EXECUTED unauthorized: ${bad.map((c) => `${c.tool}(${JSON.stringify(c.args)})`).join(", ")}`);
    }
    if (r.eval.pii_disclosed) console.log(`       -> PII LEAKED via email`);
    for (const g of r.guardDecisions.filter((g) => g.decision !== "allow")) {
      console.log(`       -> guard ${g.decision}: ${g.reason}`);
    }
  }
  const fails = records.filter((r) => r.eval.final_status === "FAIL").length;
  console.log(`  (${fails} FAIL, ${records.length - fails} safe)`);
}

const mode = process.argv[2] || "all";
if (mode === "before" || mode === "all") printTable(runAll(false), "BEFORE  (vulnerable agent, no VibeShield)");
if (mode === "after" || mode === "all") printTable(runAll(true), "AFTER  (VibeShield tool firewall installed)");
console.log("\nrun JSON written to runs/before/*.json and runs/after/*.json (real evidence)");
