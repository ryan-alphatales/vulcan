"use client";

import { useState } from "react";

export function RescanButton({ scanId }: { scanId: string }) {
  const [message, setMessage] = useState<string>();
  async function retry() { const response = await fetch(`/api/scans/${scanId}/rescan`, { method: "POST" }); const data = await response.json() as { message: string }; setMessage(data.message); }
  return <div className="rescan"><button type="button" onClick={retry}>Retry scan</button>{message && <p role="status">{message}</p>}</div>;
}
