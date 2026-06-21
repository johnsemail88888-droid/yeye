export function getSponsorStatus(summary) {
  const phoenixLive = Boolean(summary.phoenix_collector_endpoint);
  return {
    phoenix: {
      label: phoenixLive ? "Phoenix live" : "Phoenix local fallback",
      tone: phoenixLive ? "live" : "fallback",
      canSend: phoenixLive,
      reason: phoenixLive
        ? "Collector endpoint is configured; production code should send traces server-side."
        : "PHOENIX_COLLECTOR_ENDPOINT is absent, so this prototype only exports the local OpenInference artifact list."
    },
    armor: {
      label: summary.demo_ready && summary.report_audit_pass ? "ArmorIQ-compatible guard evidence" : "Guard evidence unavailable",
      tone: summary.demo_ready && summary.report_audit_pass ? "live" : "fallback"
    }
  };
}
