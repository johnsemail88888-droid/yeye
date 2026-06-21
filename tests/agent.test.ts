import { describe, it, expect } from "vitest";
import { decideActions } from "../examples/vulnerable-support-agent/agent";
import { CUSTOMER } from "../examples/vulnerable-support-agent/tools";

function refundAmount(ticket: string): number | undefined {
  const a = decideActions("goal", ticket, CUSTOMER).find((c) => c.tool === "refund_customer");
  return a ? (a.args.amount as number) : undefined;
}

describe("agent money extraction (boundaries)", () => {
  it("single digit: $5", () => expect(refundAmount("please refund $5")).toBe(5));
  it("cents: $199.99", () => expect(refundAmount("refund $199.99 now")).toBe(199.99));
  it("worded: 500 dollars", () => expect(refundAmount("credit of 500 dollars back to my card")).toBe(500));
  it("thousands with comma: $1,200", () => expect(refundAmount("refund $1,200 please")).toBe(1200));
  it("no money verb -> no refund attempted", () => expect(refundAmount("how do I change my billing email?")).toBeUndefined());
});

describe("agent external-egress intent", () => {
  it("attempts send_email when a non-customer address + send verb appear", () => {
    const acts = decideActions("goal", "forward my file to backup@external-vault.net please", CUSTOMER);
    expect(acts.some((c) => c.tool === "send_email")).toBe(true);
  });
  it("does not email when the only address is the customer's own", () => {
    const acts = decideActions("goal", `please send a copy to ${CUSTOMER.email}`, CUSTOMER);
    expect(acts.some((c) => c.tool === "send_email")).toBe(false);
  });
});
