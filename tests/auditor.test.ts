import { describe, it, expect } from "vitest";
import { auditReport, type AuditArgs } from "../src/auditor";

const FAIL = { eval: { final_status: "FAIL" } };
const PASS = { eval: { final_status: "PASS" } };
const finding = (id: string) => ({
  finding_id: id,
  source_ids: ["OWASP-LLM01"],
  limitations: "deterministic stand-in; synthetic data",
  observed_evidence: [{ path: "a" }, { path: "b" }],
  after_evidence: [{ path: "c" }],
});
const base: AuditArgs = {
  summary: { before_failures: 2, after_failures: 0 },
  before: [FAIL, FAIL, PASS],
  after: [PASS, PASS, PASS],
  findings: [finding("VS-F-001"), finding("VS-F-002")],
  founderText: "Privacy risk indicator for developer or legal review; not legal advice.",
  devText: "patch applied at the tool boundary.",
  reportLimitations: ["TypeScript/Node only"],
};
const allExist = () => true;

describe("auditReport (the honesty gate)", () => {
  it("passes a clean, evidence-backed report (score 100)", () => {
    const a = auditReport(base, allExist);
    expect(a.pass).toBe(true);
    expect(a.score).toBe(100);
  });
  it("FAILS when report numbers don't match the run files", () => {
    const a = auditReport({ ...base, summary: { before_failures: 5, after_failures: 0 } }, allExist);
    expect(a.pass).toBe(false);
    expect(a.must_fix).toContain("numbers_from_artifacts");
  });
  it("FAILS when a critical finding's evidence file is missing", () => {
    const a = auditReport(base, (p) => p !== "b");
    expect(a.pass).toBe(false);
    expect(a.must_fix).toContain("criticals_have_reproduced_evidence");
  });
  it("FAILS on an absolute legal claim", () => {
    const a = auditReport({ ...base, founderText: base.founderText + " This app is illegal." }, allExist);
    expect(a.must_fix).toContain("legal_claims_safe");
  });
  it("FAILS without the 'not legal advice' disclaimer", () => {
    const a = auditReport({ ...base, founderText: "some risk indicators" }, allExist);
    expect(a.must_fix).toContain("legal_claims_safe");
  });
  it("FAILS on a fabricated sponsor integration claim", () => {
    const a = auditReport({ ...base, devText: "ArmorIQ integrated fully" }, allExist);
    expect(a.must_fix).toContain("integration_authenticity");
  });
  it("FAILS and reports a finding with no source", () => {
    const a = auditReport({ ...base, findings: [{ ...finding("VS-F-003"), source_ids: [] }] }, allExist);
    expect(a.must_fix).toContain("sources_present");
    expect(a.missing_sources).toContain("VS-F-003");
  });
});
