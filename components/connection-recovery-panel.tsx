"use client";

import { useState } from "react";

import {
  completedConnection,
  failedConnection,
  retryConnection,
  type ConnectionFailureReason,
  type RepositoryConnectionState,
} from "@/lib/repository-connection";

const failureReasons: Array<{ value: ConnectionFailureReason; label: string }> = [
  { value: "authorization", label: "Authorization was not completed" },
  { value: "repository_access", label: "Repository access is unavailable" },
  { value: "unknown", label: "The reason is unavailable" },
];

export function ConnectionRecoveryPanel() {
  const [reason, setReason] = useState<ConnectionFailureReason>("authorization");
  const [state, setState] = useState<RepositoryConnectionState>(
    failedConnection("authorization"),
  );

  if (state.status === "connected") {
    return <section className="panel success" aria-live="polite">
      <p className="eyebrow">Connection complete</p>
      <h2>{state.repositoryName} is connected</h2>
      <p>Repository access has been confirmed. Vulcan can now continue with the next setup step.</p>
    </section>;
  }

  if (state.status === "connecting") {
    return <section className="panel" aria-live="polite">
      <p className="eyebrow">Retry in progress</p>
      <h2>Finish the connection with your Git provider</h2>
      <p>Vulcan is waiting for an approved connection outcome. It will not mark a repository as connected until access succeeds.</p>
      <button type="button" onClick={() => setState(completedConnection("acme/example-repository"))}>
        Confirm successful connection
      </button>
    </section>;
  }

  return <section className="panel failure" aria-live="polite">
    <p className="eyebrow">Connection incomplete</p>
    <h2>{state.failure.title}</h2>
    <p>{state.failure.description}</p>
    <p className="guidance">{state.failure.guidance}</p>
    <button type="button" onClick={() => setState(retryConnection(state))}>Retry connection</button>
    <label className="simulation-control">
      Preview a different available failure result
      <select value={reason} onChange={(event) => {
        const nextReason = event.target.value as ConnectionFailureReason;
        setReason(nextReason);
        setState(failedConnection(nextReason));
      }}>
        {failureReasons.map((failureReason) => <option key={failureReason.value} value={failureReason.value}>{failureReason.label}</option>)}
      </select>
    </label>
  </section>;
}
