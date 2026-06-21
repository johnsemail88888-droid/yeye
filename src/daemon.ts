import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { runTicket } from "./harness";

// VibeShield local daemon. Serves the desktop control plane (app.html), the
// controlled deployed product (/demo), and the API the browser panel + desktop
// share (same project_id/run_id). Pure Node stdlib.

const ROOT = process.cwd();
const PORT = 7878;
let RUN_ID = "run-0001";

function readJson(p: string): any { return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null; }
function readRuns(rel: string): any[] {
  const d = join(ROOT, rel);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => readJson(join(d, f)));
}
function state() {
  return {
    project_id: "support-agent",
    run_id: RUN_ID,
    risk_map: readJson(join(ROOT, "risk_map.json")),
    runs_before: readRuns("runs/before"),
    runs_after: readRuns("runs/after"),
    verify: readJson(join(ROOT, "verify_results.json")),
    live_scan: readJson(join(ROOT, ".vibeshield/live_scan.json")),
  };
}
function run(cmd: string) { try { execSync(cmd, { cwd: ROOT, stdio: "ignore" }); } catch { /* surfaced via state */ } }
function bumpRun() { RUN_ID = "run-" + String((parseInt(RUN_ID.split("-")[1], 10) || 0) + 1).padStart(4, "0"); }
function body(req: any): Promise<string> {
  return new Promise((resolve) => { let b = ""; req.on("data", (c: any) => (b += c)); req.on("end", () => resolve(b)); });
}
const file = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const json = (res: any, obj: any) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
const page = (res: any, s: string) => { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(s); };

createServer(async (req, res) => {
  const url = (req.url || "/").split("?")[0];
  if (url === "/" || url === "/index.html") return page(res, file("web/app.html"));
  if (url === "/demo") return page(res, file("web/demo.html"));
  if (url === "/judge") return page(res, file("web/judge.html"));
  if (url === "/api/state") return json(res, state());
  if (url === "/api/scan" && req.method === "POST") { run("npx tsx src/scan.ts examples/vulnerable-support-agent"); return json(res, state()); }
  if (url === "/api/run" && req.method === "POST") { bumpRun(); run("npx tsx src/run.ts all"); run("npx tsx src/verify.ts"); return json(res, state()); }
  if (url === "/api/agent" && req.method === "POST") {
    const { ticket = "", guard = false } = JSON.parse((await body(req)) || "{}");
    return json(res, { run_id: RUN_ID, ...runTicket(String(ticket), !!guard) });
  }
  // browser panel drives the live loop:
  if (url === "/api/live-scan" && req.method === "POST") {
    const { scope = {} } = JSON.parse((await body(req)) || "{}");
    bumpRun();
    // fresh AFTER so the desktop shows a before-only state until the guard is installed
    rmSync(join(ROOT, "runs/after"), { recursive: true, force: true });
    rmSync(join(ROOT, ".vibeshield/traces/after"), { recursive: true, force: true });
    mkdirSync(join(ROOT, ".vibeshield"), { recursive: true });
    writeFileSync(join(ROOT, ".vibeshield/live_scan.json"),
      JSON.stringify({ source: "browser-panel", project_id: "support-agent", run_id: RUN_ID, captured_at: new Date().toISOString(), scope }, null, 2));
    run("npx tsx src/scan.ts examples/vulnerable-support-agent");
    run("npx tsx src/run.ts before");
    return json(res, state());
  }
  if (url === "/api/install-guard" && req.method === "POST") {
    run("npx tsx src/run.ts after");
    run("npx tsx src/report.ts");
    run("npx tsx src/experiment.ts");
    run("npx tsx src/verify.ts");
    return json(res, state());
  }
  res.writeHead(404); res.end("not found");
}).listen(PORT, () => console.log(`VibeShield daemon on http://localhost:${PORT}  (desktop / · product /demo)`));
