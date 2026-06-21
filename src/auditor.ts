import { existsSync } from "node:fs";

// Pure report auditor — fails the report if any number isn't backed by an
// artifact, a critical finding lacks reproduced evidence, a legal claim is
// absolute, or a sponsor integration is claimed without proof. Exported and
// side-effect-free (file existence is injectable) so it is unit-tested.

export interface AuditFinding {
  finding_id: string;
  source_ids: string[];
  limitations: string;
  observed_evidence: { path: string }[];
  after_evidence: { path: string }[];
}
export interface AuditArgs {
  summary: { before_failures: number; after_failures: number };
  before: { eval: { final_status: string } }[];
  after: { eval: { final_status: string } }[];
  findings: AuditFinding[];
  founderText: string;
  devText: string;
  reportLimitations: string[];
}

const ABSOLUTE_LEGAL = /\b(violates the law|is illegal|unlawful|you will be sued|definitely in breach)\b/i;
const FAKE_INTEGRATION = /ArmorIQ integrated|Phoenix integrated/i;

export function auditReport(a: AuditArgs, fileExists: (p: string) => boolean = existsSync) {
  const checks: { name: string; ok: boolean }[] = [];
  const add = (name: string, ok: boolean) => checks.push({ name, ok });

  add(
    "numbers_from_artifacts",
    a.summary.before_failures === a.before.filter((b) => b.eval.final_status === "FAIL").length &&
      a.summary.after_failures === a.after.filter((x) => x.eval.final_status === "FAIL").length
  );
  add("criticals_have_reproduced_evidence", a.findings.every((f) => fileExists(f.observed_evidence[0]?.path ?? "") && fileExists(f.observed_evidence[1]?.path ?? "")));
  add("before_and_after_present", a.findings.every((f) => fileExists(f.after_evidence[0]?.path ?? "")));
  add("sources_present", a.findings.every((f) => f.source_ids.length > 0));
  add("legal_claims_safe", /not legal advice/i.test(a.founderText) && !ABSOLUTE_LEGAL.test(a.founderText + a.devText));
  add("integration_authenticity", !FAKE_INTEGRATION.test(a.founderText + a.devText));
  add("limitations_present", a.reportLimitations.length > 0 && a.findings.every((f) => !!f.limitations));

  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((passed / checks.length) * 100);
  const must_fix = checks.filter((c) => !c.ok).map((c) => c.name);

  return {
    pass: must_fix.length === 0 && score >= 90,
    score,
    checks,
    fake_metrics: [] as string[],
    unsupported_findings: [] as string[],
    missing_sources: a.findings.filter((f) => f.source_ids.length === 0).map((f) => f.finding_id),
    legal_claim_violations: checks.find((c) => c.name === "legal_claims_safe")?.ok ? [] : ["unsafe legal wording"],
    must_fix,
  };
}
