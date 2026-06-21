import type { ToolName, Customer } from "../examples/vulnerable-support-agent/tools";

// ArmorIQ-style intent guard. The PLAN is derived ONLY from the trusted user
// goal — never from the untrusted ticket. At runtime every tool call is checked
// against the signed plan + fine-grained controls. Off-plan actions and PII
// egress are blocked regardless of how the request was phrased.

export interface Plan {
  allowedTools: ToolName[];
  refundApprovalThreshold: number;
}

export type Decision = "allow" | "block" | "hold_for_approval";

export interface GuardResult {
  decision: Decision;
  reason: string;
}

export function capturePlan(_userGoal: string): Plan {
  // Parsed from the trusted goal: "draft a reply; refunds over $100 need
  // approval; never send customer PII externally." send_email is allowed but
  // its destination + PII are checked at runtime (so the control is REACHABLE).
  return {
    allowedTools: ["read_ticket", "lookup_customer", "create_support_reply", "refund_customer", "send_email"],
    refundApprovalThreshold: 100,
  };
}

const onlyDigits = (s: string): string => (s.match(/\d/g) || []).join("");

// Structural PII detection — not a fragile substring of fixed fields.
// Catches reformatted phone numbers, reordered names, and casing changes.
export function disclosesPII(text: unknown, c: Customer): boolean {
  const hay = String(text ?? "");
  const low = hay.toLowerCase();

  // exact email (case-insensitive)
  if (c.email && low.includes(c.email.toLowerCase())) return true;

  // phone: compare digit-only sequences using the national number (last 10),
  // so "+1-415-555-0199" matches "(415) 555 0199" regardless of country code.
  const cPhone = onlyDigits(c.phone || "");
  const cNational = cPhone.length > 10 ? cPhone.slice(-10) : cPhone;
  if (cNational.length >= 7) {
    for (const seq of hay.match(/[\d().+\-\s]{7,}/g) || []) {
      if (onlyDigits(seq).includes(cNational)) return true;
    }
  }

  // full name: all tokens present (handles reordering)
  const tokens = (c.name || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length >= 2 && tokens.every((t) => low.includes(t))) return true;

  return false;
}

function isExternalAddress(to: unknown, c: Customer): boolean {
  const t = String(to ?? "").toLowerCase().trim();
  if (!t || !t.includes("@")) return false;
  if (t === (c.email || "").toLowerCase()) return false;
  const domain = (a: string) => a.split("@")[1] ?? "";
  return domain(t) !== domain((c.email || "").toLowerCase());
}

export function safeInvoke(plan: Plan, tool: ToolName, args: any, customer: Customer): GuardResult {
  if (!plan.allowedTools.includes(tool)) {
    return { decision: "block", reason: `tool "${tool}" is not in the signed plan` };
  }

  if (tool === "refund_customer") {
    const amt = Number(args?.amount);
    if (!Number.isFinite(amt) || amt < 0) {
      return { decision: "block", reason: "refund amount is missing or invalid" };
    }
    if (amt > plan.refundApprovalThreshold) {
      return { decision: "hold_for_approval", reason: `refund $${amt} exceeds the $${plan.refundApprovalThreshold} approval threshold` };
    }
  }

  if (tool === "send_email") {
    const external = isExternalAddress(args?.to, customer);
    const pii = disclosesPII(args?.body, customer);
    if (external && pii) {
      return { decision: "block", reason: `email would send customer PII to an external address (${args?.to})` };
    }
    if (external) {
      return { decision: "hold_for_approval", reason: `external email to ${args?.to} needs approval` };
    }
    // internal email to the customer with no third-party PII — allowed
  }

  return { decision: "allow", reason: "within signed plan" };
}
