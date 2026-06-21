import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";

// Arize / Phoenix integration. Builds a before/after Experiment over one stable
// dataset and exports OpenInference-shaped OTel spans (the exact format Phoenix
// ingests). If PHOENIX_COLLECTOR_ENDPOINT is set, POST the spans; otherwise the
// canonical local files are the source of truth. No fabricated data.

const J = (p: string): any => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const runs = (rel: string): any[] => (existsSync(rel) ? readdirSync(rel).filter((f) => f.endsWith(".json")).map((f) => J(`${rel}/${f}`)) : []);
const traceFiles = (phase: string): any[] => runs(`.vibeshield/traces/${phase}`);

const before = runs("runs/before");
const after = runs("runs/after");
const byName = (a: any[], n: string) => a.find((r) => r.test === n);

// --- before/after Experiment over the same dataset ---
const examples = before.map((b) => {
  const a = byName(after, b.test);
  return {
    example_id: b.test,
    input: { user_goal: b.userGoal, untrusted_ticket: b.ticket },
    before: { status: b.eval.final_status, unauthorized_executed: b.eval.unauthorized_tool_call_executed, pii_disclosed: b.eval.pii_disclosed, trace: `.vibeshield/traces/before/${b.test}.json` },
    after: a ? { status: a.eval.final_status, unauthorized_executed: a.eval.unauthorized_tool_call_executed, pii_disclosed: a.eval.pii_disclosed, trace: `.vibeshield/traces/after/${b.test}.json` } : null,
  };
});
const experiment = {
  dataset_id: "support-agent-risk-v1",
  experiment: "guard_before_after",
  metrics: {
    before_failures: before.filter((b) => b.eval.final_status === "FAIL").length,
    after_failures: after.filter((a) => a.eval.final_status === "FAIL").length,
    mutations_blocked: after.filter((a) => a.test.startsWith("paraphrased_injection_mutation") && a.eval.final_status !== "FAIL").length,
  },
  examples,
};
mkdirSync(".vibeshield/experiments", { recursive: true });
writeFileSync(".vibeshield/experiments/before_after.json", JSON.stringify(experiment, null, 2));

// --- OpenInference-shaped OTel spans (what Phoenix ingests) ---
function toOtel(phase: string) {
  const out: any[] = [];
  for (const t of traceFiles(phase)) {
    for (const s of t.spans || []) {
      out.push({
        name: s.span,
        trace_id: t.traceId,
        span_kind: s.span === "tool_call_attempted" ? "TOOL" : s.span === "agent_decision" ? "AGENT" : s.span === "guard_decision" ? "GUARDRAIL" : s.span === "evaluation_result" ? "EVALUATOR" : "CHAIN",
        attributes: {
          "openinference.span.kind": s.span === "tool_call_attempted" ? "TOOL" : "CHAIN",
          "vibeshield.phase": phase,
          "vibeshield.span": s.span,
          ...s.data,
        },
      });
    }
  }
  return out;
}
const spans = [...toOtel("before"), ...toOtel("after")];
mkdirSync(".vibeshield/traces/otel", { recursive: true });
writeFileSync(".vibeshield/traces/otel/openinference.jsonl", spans.map((s) => JSON.stringify(s)).join("\n"));

// --- optional: ship to a real Phoenix collector if configured ---
const endpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT;
let phoenix_shipped = false;
if (endpoint && /^https?:\/\//.test(endpoint)) {
  try {
    const payload = readFileSync(".vibeshield/traces/otel/openinference.jsonl", "utf8");
    const resp = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: payload });
    phoenix_shipped = resp.ok;
  } catch {
    phoenix_shipped = false;
  }
}

writeFileSync(".vibeshield/experiments/phoenix_status.json", JSON.stringify({
  local_experiment: true,
  openinference_spans: spans.length,
  phoenix_endpoint_configured: !!endpoint,
  phoenix_shipped,
  label: endpoint ? (phoenix_shipped ? "Phoenix integrated" : "Phoenix configured (ship failed) — using local") : "local OpenInference experiment (Phoenix-ready)",
}, null, 2));

console.log(`experiment: ${examples.length} examples · ${spans.length} OpenInference spans · phoenix_endpoint=${!!endpoint} shipped=${phoenix_shipped}`);
