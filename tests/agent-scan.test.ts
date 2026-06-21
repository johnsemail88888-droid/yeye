import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  resolveWithinRoot,
  listFilesTool,
  readFileTool,
  grepTool,
  coerceReport,
  assembleRiskMap,
  mergeRiskMaps,
  loadDotenv,
  type ModelReport,
  type RiskMap,
} from "../src/agent-scan";

// Pure helpers only — the LLM loop is non-deterministic and not exercised here.

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "vs-scan-"));
  mkdirSync(join(root, "sub"), { recursive: true });
  writeFileSync(join(root, "agent.ts"), "function refund_customer(){}\nconst x = 1;\n");
  writeFileSync(join(root, "sub", "tools.ts"), "export const send_email = () => {};\n");
  return root;
}

describe("resolveWithinRoot (path-traversal guard)", () => {
  it("accepts in-root paths", () => {
    const root = fixture();
    expect(resolveWithinRoot(root, "agent.ts")).not.toBeNull();
    expect(resolveWithinRoot(root, "sub/tools.ts")).not.toBeNull();
    rmSync(root, { recursive: true, force: true });
  });

  it("rejects parent traversal and absolute-outside paths", () => {
    const root = fixture();
    expect(resolveWithinRoot(root, "../secret")).toBeNull();
    expect(resolveWithinRoot(root, "../../etc/passwd")).toBeNull();
    expect(resolveWithinRoot(root, "/etc/passwd")).toBeNull();
    rmSync(root, { recursive: true, force: true });
  });

  it("rejects symlink escapes", () => {
    const root = fixture();
    const outside = mkdtempSync(join(tmpdir(), "vs-out-"));
    writeFileSync(join(outside, "secret.txt"), "top secret");
    let created = true;
    try {
      symlinkSync(join(outside, "secret.txt"), join(root, "link.txt"));
    } catch {
      created = false; // symlinks not permitted in this env — skip the assertion
    }
    if (created) expect(resolveWithinRoot(root, "link.txt")).toBeNull();
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });
});

describe("file tools (read-only, sandboxed)", () => {
  it("listFilesTool returns relative source paths", () => {
    const root = fixture();
    const out = listFilesTool(root);
    expect(out).toContain("agent.ts");
    expect(out).toContain(join("sub", "tools.ts"));
    rmSync(root, { recursive: true, force: true });
  });

  it("readFileTool reads in-root files and refuses out-of-root", () => {
    const root = fixture();
    const ok = readFileTool(root, "agent.ts");
    expect(ok.ok).toBe(true);
    expect(ok.content).toContain("refund_customer");
    const bad = readFileTool(root, "../../etc/passwd");
    expect(bad.ok).toBe(false);
    rmSync(root, { recursive: true, force: true });
  });

  it("grepTool returns path:line matches and reports misses", () => {
    const root = fixture();
    const hit = grepTool(root, "send_email");
    expect(hit).toContain("tools.ts");
    expect(hit).toMatch(/:\d+:/);
    expect(grepTool(root, "nonexistent_xyz")).toBe("(no matches)");
    rmSync(root, { recursive: true, force: true });
  });
});

describe("loadDotenv", () => {
  it("loads KEY=VALUE from a file without overriding real env vars", () => {
    const dir = mkdtempSync(join(tmpdir(), "vs-env-"));
    const a = join(dir, ".env");
    const b = join(dir, ".env.local");
    writeFileSync(a, '# comment\nVS_TEST_KEY=secret123\nVS_QUOTED="q v"\n');
    const existing = "VS_TEST_EXISTING";
    process.env[existing] = "fromreal";
    writeFileSync(b, `${existing}=fromfile\nVS_TEST_KEY=should_not_override\n`);
    try {
      const set = loadDotenv([a, b]);
      expect(process.env.VS_TEST_KEY).toBe("secret123"); // first file wins
      expect(process.env.VS_QUOTED).toBe("q v"); // quotes stripped
      expect(process.env[existing]).toBe("fromreal"); // real env wins
      expect(set).toContain("VS_TEST_KEY");
      expect(set).not.toContain(existing);
    } finally {
      delete process.env.VS_TEST_KEY;
      delete process.env.VS_QUOTED;
      delete process.env[existing];
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("coerceReport", () => {
  it("coerces nulls to undefined and normalizes severities", () => {
    const r = coerceReport({
      tools: ["t"],
      high_impact_tools: [],
      untrusted_input_sources: [],
      guard_present: false,
      approval_gate_present: false,
      findings: [
        { tool: null, category: "x", severity: "BOGUS", detail: "d", file: null, evidence: "e", suggested_fix: "s" },
      ],
    });
    expect(r.findings[0].tool).toBeUndefined();
    expect(r.findings[0].file).toBeUndefined();
    expect(r.findings[0].severity).toBe("medium"); // unknown → medium
  });
});

const sampleReport: ModelReport = {
  tools: ["refund_customer", "send_email"],
  high_impact_tools: ["refund_customer"],
  untrusted_input_sources: ["ticket text"],
  guard_present: false,
  approval_gate_present: false,
  findings: [
    { tool: "refund_customer", category: "money-movement", severity: "critical", detail: "moves money", file: "agent.ts" },
    { category: "missing-control", severity: "critical", detail: "no runtime guard" },
  ],
};

describe("assembleRiskMap", () => {
  it("assigns sequential ids, sets target/scanned_files, stamps engine=agent", () => {
    const m = assembleRiskMap("examples/x", 4, sampleReport);
    expect(m.target).toBe("examples/x");
    expect(m.scanned_files).toBe(4);
    expect(m.findings.map((f) => f.id)).toEqual(["F1", "F2"]);
    expect(m.findings.every((f) => f.engine === "agent")).toBe(true);
    expect(m.tools).toContain("send_email");
  });
});

describe("mergeRiskMaps", () => {
  it("returns the agent map unchanged when there is no deterministic baseline", () => {
    const a = assembleRiskMap("x", 1, sampleReport);
    expect(mergeRiskMaps(null, a)).toEqual(a);
  });

  it("dedups overlapping findings, labels engines, ORs gates, unions tools", () => {
    const agent = assembleRiskMap("x", 4, sampleReport);
    const deterministic: RiskMap = {
      target: "x",
      scanned_files: 4,
      tools: ["refund_customer", "lookup_customer"],
      high_impact_tools: ["lookup_customer"],
      untrusted_input_sources: ["read_ticket"],
      guard_present: true,
      approval_gate_present: false,
      findings: [
        // same tool|category|detail as the agent's money-movement finding → should dedup
        { id: "F1", tool: "refund_customer", category: "money-movement", severity: "critical", detail: "moves money", engine: "deterministic" },
        { id: "F2", tool: "lookup_customer", category: "pii-access", severity: "high", detail: "reads PII", engine: "deterministic" },
      ],
    };
    const merged = mergeRiskMaps(deterministic, agent);

    expect(merged.findings.length).toBe(3); // money (deduped) + pii + missing-control
    const keys = merged.findings.map((f) => `${f.tool ?? ""}|${f.category}`);
    expect(keys).toContain("refund_customer|money-movement");
    expect(keys).toContain("lookup_customer|pii-access");
    expect(keys).toContain("|missing-control");

    expect(merged.findings.map((f) => f.id)).toEqual(["F1", "F2", "F3"]); // ids reassigned
    expect(merged.guard_present).toBe(true); // OR of (true, false)
    expect(merged.tools).toEqual(expect.arrayContaining(["refund_customer", "lookup_customer", "send_email"]));
    expect(merged.findings.find((f) => f.category === "missing-control")?.engine).toBe("agent");
    expect(merged.findings.find((f) => f.category === "pii-access")?.engine).toBe("deterministic");
  });
});
