"use client";

import { useState } from "react";

import type { TriageState } from "@/lib/contracts";

export function FindingTriageControls({ findingId, initialState }: { findingId: string; initialState: TriageState }) {
  const [state, setState] = useState(initialState); const [message, setMessage] = useState<string>();
  async function update(next: TriageState) {
    if (next === "false_positive" && !window.confirm("Mark this finding as a false positive? This may hide a real security issue.")) return;
    const response = await fetch(`/api/findings/${findingId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: next, confirmation: next !== "false_positive" || true }) });
    const data = await response.json() as { message?: string }; if (response.ok) { setState(next); setMessage("Triage state saved."); } else setMessage(data.message ?? "Triage state could not be saved.");
  }
  return <div className="triage"><span>State: {state.replace("_", " ")}</span><div><button type="button" onClick={() => update("open")}>Open</button><button type="button" onClick={() => update("fixed")}>Fixed</button><button type="button" onClick={() => update("false_positive")}>False positive</button></div>{message && <p role="status">{message}</p>}</div>;
}
