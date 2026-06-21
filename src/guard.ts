import type { ToolName, Customer } from "../examples/vulnerable-support-agent/tools";

// ArmorIQ-style intent guard. The PLAN is derived ONLY from the trusted user
// goal — never from the untrusted ticket. At runtime every tool call is checked
// against the signed plan. Off-plan actions are blocked regardless of how the
// request was phrased — so it is injection-AGNOSTIC (no keyword matching of the
// attack). This is the real engineering the demo rests on.

export interface Plan {
  allowedTools: ToolName[];
  refundApprovalThreshold: number;
  allowExternalEmail: boolean;
}

export type Decision = "allow" | "block" | "hold_for_approval";

export interface GuardResult {
  decision: Decision;
  reason: string;
}

export function capturePlan(_userGoal: string): Plan {
  // Parsed from the trusted goal: "draft a reply; refunds over $100 need
  // approval; never send customer PII externally."
  return {
    allowedTools: ["read_ticket", "lookup_customer", "create_support_reply", "refund_customer"],
    refundApprovalThreshold: 100,
    allowExternalEmail: false,
  };
}

function containsPII(text: string, c: Customer): boolean {
  const hay = String(text).toLowerCase();
  return [c.email, c.phone, c.name].some((p) => hay.includes(p.toLowerCase()));
}

export function safeInvoke(plan: Plan, tool: ToolName, args: any, customer: Customer): GuardResult {
  if (!plan.allowedTools.includes(tool)) {
    return { decision: "block", reason: `tool "${tool}" is not in the signed plan` };
  }
  if (tool === "refund_customer" && Number(args?.amount) > plan.refundApprovalThreshold) {
    return {
      decision: "hold_for_approval",
      reason: `refund $${args?.amount} exceeds the $${plan.refundApprovalThreshold} approval threshold`,
    };
  }
  if (tool === "send_email") {
    if (!plan.allowExternalEmail) return { decision: "block", reason: "external email is not part of the signed plan" };
    if (containsPII(args?.body || "", customer)) return { decision: "block", reason: "message would disclose customer PII" };
  }
  return { decision: "allow", reason: "within signed plan" };
}
