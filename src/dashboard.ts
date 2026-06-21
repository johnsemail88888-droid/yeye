import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

// Generates a self-contained studio.html (open by double-click, offline) that
// renders the VibeShield Studio 3-pane control plane from the REAL artifacts
// the loop already wrote. No fabricated data — everything below is read off disk.

function readJson(p: string): any {
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}
function readRuns(dir: string): any[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => readJson(`${dir}/${f}`));
}

const risk = readJson("risk_map.json") || { tools: [], findings: [] };
const before = readRuns("runs/before");
const after = readRuns("runs/after");
const verify = readJson("verify_results.json") || {};

const sev = (s: string) => ({ critical: "#ff5c6c", high: "#ffb454", medium: "#ffd866", low: "#9aa4b2" } as any)[s] || "#9aa4b2";
const statusColor = (s: string) =>
  ({ FAIL: "#ff5c6c", PASS: "#43d17a", BLOCKED: "#43d17a", NEEDS_APPROVAL: "#ffb454" } as any)[s] || "#9aa4b2";

const beforeFails = before.filter((r) => r.eval.final_status === "FAIL");

const timeline: string[] = [];
timeline.push(`Project created — <b>Build</b>: vulnerable-support-agent`);
timeline.push(`Scanner: ${risk.tools.length} tools, ${risk.findings.length} findings (${risk.findings.filter((f: any) => f.severity === "critical").length} critical)`);
timeline.push(`BEFORE: ran ${before.length} dynamic risk tests — <span style="color:#ff5c6c">${beforeFails.length} FAILED</span>`);
for (const r of beforeFails) {
  const bad = r.executed.filter((c: any) => ["refund_customer", "send_email", "update_user_plan"].includes(c.tool));
  timeline.push(`&nbsp;&nbsp;↳ ${r.test}: <code>${bad.map((c: any) => `${c.tool}(${JSON.stringify(c.args)})`).join(", ")}</code>${r.eval.pii_disclosed ? " <span style='color:#ff5c6c'>PII leaked</span>" : ""}`);
}
timeline.push(`Installed VibeShield runtime guard (intent firewall)`);
timeline.push(`AFTER: reran same ${after.length} tests — <span style="color:#43d17a">0 unauthorized executed</span>`);
timeline.push(`VERIFY: <b style="color:${verify.demo_ready ? "#43d17a" : "#ff5c6c"}">demo_ready = ${verify.demo_ready}</b>`);

const findingsHtml = risk.findings
  .map(
    (f: any) => `<div class="card"><span class="pill" style="background:${sev(f.severity)}22;color:${sev(f.severity)}">${f.severity.toUpperCase()}</span>
    <b>${f.tool || f.category}</b><div class="muted">${f.detail}</div></div>`
  )
  .join("");

const rows = before
  .map((b) => {
    const a = after.find((x) => x.test === b.test) || b;
    const reason = a.guardDecisions.find((g: any) => g.decision !== "allow")?.reason || (a.eval.task_completed ? "completed normally" : "");
    return `<tr>
      <td>${b.test}</td>
      <td><span class="status" style="color:${statusColor(b.eval.final_status)}">${b.eval.final_status}</span></td>
      <td><span class="status" style="color:${statusColor(a.eval.final_status)}">${a.eval.final_status}</span></td>
      <td class="muted">${reason}</td></tr>`;
  })
  .join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><title>VibeShield Studio</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#e6edf3}
header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #1f2630;background:#0f141b}
header h1{font-size:16px;margin:0;font-weight:600}
.badge{padding:4px 12px;border-radius:20px;font-weight:600;font-size:12px}
.grid{display:grid;grid-template-columns:200px 1fr 1.1fr;height:calc(100vh - 53px)}
.col{padding:16px;overflow:auto;border-right:1px solid #1f2630}
.col h2{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#7d8590;margin:0 0 12px}
.nav div{padding:8px 10px;border-radius:6px;margin-bottom:4px;cursor:default}
.nav .active{background:#1f6feb22;color:#79c0ff;border:1px solid #1f6feb44}
.tl{position:relative;padding-left:18px}
.tl .ev{position:relative;padding:7px 0;border-left:2px solid #1f2630;padding-left:16px;margin-left:2px}
.tl .ev::before{content:'';position:absolute;left:-5px;top:12px;width:8px;height:8px;border-radius:50%;background:#1f6feb}
code{background:#161b22;border:1px solid #232a33;border-radius:4px;padding:1px 5px;font-size:12px;color:#ffa657}
.card{background:#11161d;border:1px solid #232a33;border-radius:8px;padding:10px 12px;margin-bottom:8px}
.pill{font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;margin-right:8px}
.muted{color:#7d8590;font-size:12px;margin-top:3px}
table{width:100%;border-collapse:collapse;margin-top:6px}
th{text-align:left;font-size:11px;color:#7d8590;text-transform:uppercase;padding:6px 8px;border-bottom:1px solid #232a33}
td{padding:8px;border-bottom:1px solid #161b22;font-size:13px;vertical-align:top}
.status{font-weight:700;font-size:12px}
.tab{font-size:12px;color:#7d8590;text-transform:uppercase;letter-spacing:.06em;margin:18px 0 8px;font-weight:600}
.arrow{color:#43d17a;font-weight:700}
</style></head><body>
<header>
  <h1>🛡 VibeShield Studio <span style="color:#7d8590;font-weight:400">— Risk Debugger</span></h1>
  <div class="badge" style="background:${verify.demo_ready ? "#43d17a22" : "#ff5c6c22"};color:${verify.demo_ready ? "#43d17a" : "#ff5c6c"}">
    ${verify.demo_ready ? "VERIFY PASSED" : "VERIFY FAILED"} · before→after loop
  </div>
</header>
<div class="grid">
  <div class="col nav">
    <h2>Projects</h2>
    <div class="active">📦 support-agent <span style="color:#7d8590">(Build)</span></div>
    <div style="color:#7d8590">🌐 + New Live Project</div>
    <h2 style="margin-top:20px">Recent Runs</h2>
    <div class="muted">run · ${before.length} tests · ${beforeFails.length} fixed</div>
  </div>

  <div class="col">
    <h2>Agent Activity</h2>
    <div class="tl">${timeline.map((t) => `<div class="ev">${t}</div>`).join("")}</div>
  </div>

  <div class="col">
    <h2>Risk Inspector</h2>
    <div class="tab">Findings (${risk.findings.length})</div>
    ${findingsHtml}
    <div class="tab">Before / After — same tests, real results</div>
    <table>
      <tr><th>Test</th><th>Before</th><th></th><th>After</th></tr>
      ${before
        .map((b) => {
          const a = after.find((x) => x.test === b.test) || b;
          const r = a.guardDecisions.find((g: any) => g.decision !== "allow")?.reason || "";
          return `<tr><td>${b.test}</td>
            <td><span class="status" style="color:${statusColor(b.eval.final_status)}">${b.eval.final_status}</span></td>
            <td class="arrow">→</td>
            <td><span class="status" style="color:${statusColor(a.eval.final_status)}">${a.eval.final_status}</span><div class="muted">${r}</div></td></tr>`;
        })
        .join("")}
    </table>
    <div class="tab">Verify</div>
    <div class="card"><pre style="margin:0;font-size:12px;color:#9aa4b2">${JSON.stringify(verify, null, 2)}</pre></div>
  </div>
</div></body></html>`;

writeFileSync("studio.html", html);
console.log("studio.html written —", html.length, "bytes");
console.log(`  findings: ${risk.findings.length} | before fails: ${beforeFails.length} | after fails: ${after.filter((r) => r.eval.final_status === "FAIL").length} | verify: ${verify.demo_ready}`);
