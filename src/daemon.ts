import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync, renameSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { runTicket } from "./harness";

const execFileP = promisify(execFile);
const ROOT = process.cwd();
const PORT = 7878;
const HOST = "127.0.0.1"; // localhost only — not LAN-exposed
const MAX_BODY = 64 * 1024; // 64 KB request cap
const CMD_TIMEOUT = 90_000; // ms
let RUN_ID = "run-0001";

// Resolve the tsx CLI so we can run scripts via `node <tsx-cli>` — cross-platform
// (execFile("npx", …) ENOENTs on Windows because it won't resolve the .cmd shim).
const localRequire = createRequire(import.meta.url);
let TSX_CLI: string;
try {
  TSX_CLI = localRequire.resolve("tsx/cli");
} catch {
  TSX_CLI = join(ROOT, "node_modules", "tsx", "dist", "cli.mjs");
}

process.on("unhandledRejection", (e) => console.error("[daemon] unhandledRejection:", e));
process.on("uncaughtException", (e) => console.error("[daemon] uncaughtException:", e));

// Serialize file-mutating endpoints so concurrent requests never clobber runs/.
let chain: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn) as Promise<T>;
  chain = next.catch(() => undefined);
  return next;
}

function readJson(p: string): unknown {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  } catch {
    return null;
  }
}
function readRuns(rel: string): unknown[] {
  const d = join(ROOT, rel);
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson(join(d, f)))
    .filter((x) => x !== null);
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
async function runCmd(args: string[], timeoutMs: number = CMD_TIMEOUT): Promise<void> {
  // Throws on failure so the endpoint returns 500 (never 200 + stale state).
  try {
    await execFileP(process.execPath, [TSX_CLI, ...args], { cwd: ROOT, timeout: timeoutMs, windowsHide: true });
  } catch (e) {
    console.error("[daemon] cmd failed:", args.join(" "), (e as Error).message);
    throw new Error(`command failed: ${args.join(" ")}`);
  }
}
function bumpRun() {
  RUN_ID = "run-" + String((parseInt(RUN_ID.split("-")[1] ?? "0", 10) || 0) + 1).padStart(4, "0");
}
function readBody(req: IncomingMessage, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let b = "";
    let len = 0;
    req.on("data", (c: Buffer) => {
      len += c.length;
      if (len > max) {
        reject(new Error("body too large"));
        req.destroy();
      } else b += c;
    });
    req.on("end", () => resolve(b));
    req.on("error", reject);
  });
}

const SAFE_PAGES: Record<string, string> = {
  "/": "web/app.html",
  "/index.html": "web/app.html",
  "/demo": "web/demo.html",
  "/judge": "web/judge.html",
};
function servePage(res: ServerResponse, rel: string) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) {
    res.writeHead(404);
    return res.end("not found");
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(readFileSync(p, "utf8"));
}
const json = (res: ServerResponse, code: number, obj: unknown) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(obj));
};

// Same-origin / DNS-rebinding guard for state-changing requests.
const ALLOWED_HOSTS = new Set(["127.0.0.1:7878", "localhost:7878"]);
function originOk(req: IncomingMessage): boolean {
  if (!ALLOWED_HOSTS.has(req.headers.host || "")) return false;
  const origin = req.headers.origin;
  return !origin || /^https?:\/\/(127\.0\.0\.1|localhost):7878$/.test(origin);
}

// Persist only known, bounded scope fields from the (untrusted) browser panel.
function sanitizeScope(raw: unknown): Record<string, string> {
  const s = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  return { url: str(s.url, 300), feature: str(s.feature, 80), captured_at: new Date().toISOString() };
}

export function createDaemon() {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = (req.url || "/").split("?")[0];
    const m = req.method || "GET";

    if (m === "POST" && !originOk(req)) return json(res, 403, { error: "forbidden origin" });

    if (m === "GET" && SAFE_PAGES[url]) return servePage(res, SAFE_PAGES[url]);
    if (m === "GET" && url === "/api/state") return json(res, 200, state());

    if (m === "POST" && url === "/api/scan") {
      return json(res, 200, await serialize(async () => {
        await runCmd(["src/scan.ts", "examples/vulnerable-support-agent"]);
        return state();
      }));
    }
    if (m === "POST" && url === "/api/agent-scan") {
      // BYOK LLM agent scan. The subprocess loads ANTHROPIC_API_KEY from .env itself
      // (loadDotenv) and merges its findings into risk_map.json. Long timeout: live
      // model calls are slow. Throws → 500 if the key is missing or the call fails.
      return json(res, 200, await serialize(async () => {
        await runCmd(["src/agent-scan.ts", "examples/vulnerable-support-agent", "--no-verify"], 240_000);
        return state();
      }));
    }
    if (m === "POST" && url === "/api/run") {
      return json(res, 200, await serialize(async () => {
        bumpRun();
        await runCmd(["src/run.ts", "all"]);
        await runCmd(["src/verify.ts"]);
        return state();
      }));
    }
    if (m === "POST" && url === "/api/agent") {
      const body = await readBody(req, MAX_BODY);
      let p: any;
      try { p = JSON.parse(body || "{}"); } catch { return json(res, 400, { error: "invalid JSON" }); }
      if (typeof p !== "object" || p === null) return json(res, 400, { error: "expected an object" });
      const ticket = typeof p.ticket === "string" ? p.ticket.slice(0, 8000) : "";
      return json(res, 200, { run_id: RUN_ID, ...runTicket(ticket, !!p.guard) });
    }
    if (m === "POST" && url === "/api/live-scan") {
      const body = await readBody(req, MAX_BODY);
      let p: any;
      try { p = JSON.parse(body || "{}"); } catch { return json(res, 400, { error: "invalid JSON" }); }
      const scope = sanitizeScope(p.scope);
      return json(res, 200, await serialize(async () => {
        bumpRun();
        rmSync(join(ROOT, "runs/after"), { recursive: true, force: true });
        rmSync(join(ROOT, ".vibeshield/traces/after"), { recursive: true, force: true });
        mkdirSync(join(ROOT, ".vibeshield"), { recursive: true });
        const tmp = join(ROOT, ".vibeshield/live_scan.json.tmp");
        writeFileSync(tmp, JSON.stringify({ source: "browser-panel", project_id: "support-agent", run_id: RUN_ID, scope }, null, 2));
        renameSync(tmp, join(ROOT, ".vibeshield/live_scan.json")); // atomic, no half-write
        await runCmd(["src/scan.ts", "examples/vulnerable-support-agent"]);
        await runCmd(["src/run.ts", "before"]);
        return state();
      }));
    }
    if (m === "POST" && url === "/api/install-guard") {
      return json(res, 200, await serialize(async () => {
        await runCmd(["src/run.ts", "after"]);
        await runCmd(["src/report.ts"]);
        await runCmd(["src/experiment.ts"]);
        await runCmd(["src/verify.ts"]);
        return state();
      }));
    }

    res.writeHead(404);
    res.end("not found");
  } catch (e) {
    console.error("[daemon] handler error:", (e as Error).message);
    if (!res.headersSent) json(res, 500, { error: "internal" });
    else res.end();
  }
  });
}

function main() {
  const server = createDaemon();
  server.listen(PORT, HOST, () => console.log(`VibeShield daemon on http://${HOST}:${PORT}  (desktop / · product /demo · judge /judge)`));
  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
