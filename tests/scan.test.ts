import { describe, it, expect } from "vitest";
import { buildRiskMap } from "../src/scan";

describe("buildRiskMap (scanner)", () => {
  it("detects high-impact tools and flags missing controls in an unguarded agent", () => {
    const text = `const tools = { refund_customer:(a)=>{}, send_email:(a)=>{}, read_ticket:()=>{}, lookup_customer:()=>{} };`;
    const rm = buildRiskMap("x", text, 1);
    expect(rm.tools).toEqual(expect.arrayContaining(["refund_customer", "send_email", "read_ticket", "lookup_customer"]));
    expect(rm.guard_present).toBe(false);
    expect(rm.approval_gate_present).toBe(false);
    expect(rm.findings.some((f) => f.category === "missing-control" && f.severity === "critical")).toBe(true);
    expect(rm.high_impact_tools).toEqual(expect.arrayContaining(["refund_customer", "send_email", "lookup_customer"]));
    expect(rm.high_impact_tools).not.toContain("read_ticket");
  });

  it("marks the guard + approval gate present when wired", () => {
    const text = `import { safeInvoke } from "./guard"; const tools={ refund_customer:()=>{} }; const t='threshold';`;
    const rm = buildRiskMap("x", text, 1);
    expect(rm.guard_present).toBe(true);
    expect(rm.approval_gate_present).toBe(true);
    expect(rm.findings.some((f) => f.category === "missing-control")).toBe(false);
  });

  it("finds no tools in unrelated code", () => {
    const rm = buildRiskMap("x", "const total = 1 + 2; export default total;", 1);
    expect(rm.tools.length).toBe(0);
  });
});
