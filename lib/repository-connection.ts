export type ConnectionFailureReason =
  | "authorization"
  | "repository_access"
  | "unknown";

export type ConnectionFailure = {
  reason: ConnectionFailureReason;
  title: string;
  description: string;
  guidance: string;
};

export type RepositoryConnectionState =
  | { status: "incomplete"; failure: ConnectionFailure }
  | { status: "connecting" }
  | { status: "connected"; repositoryName: string };

const failureCopy: Record<ConnectionFailureReason, Omit<ConnectionFailure, "reason">> = {
  authorization: {
    title: "Authorization was not completed",
    description: "Vulcan could not finish authorization with your Git provider.",
    guidance: "Retry the connection and approve the requested repository access. If the provider page was closed, start the connection again.",
  },
  repository_access: {
    title: "Repository access is unavailable",
    description: "Vulcan could not verify access to the selected repository.",
    guidance: "Confirm that you can access the repository and have permission to manage its webhook, then retry the connection.",
  },
  unknown: {
    title: "Repository connection did not complete",
    description: "The exact reason for this connection failure is unavailable.",
    guidance: "Retry the connection. If it continues to fail, confirm your provider access and try again later.",
  },
};

export function failedConnection(reason: ConnectionFailureReason = "unknown"): RepositoryConnectionState {
  return { status: "incomplete", failure: { reason, ...failureCopy[reason] } };
}

export function retryConnection(state: RepositoryConnectionState): RepositoryConnectionState {
  return state.status === "incomplete" ? { status: "connecting" } : state;
}

export function completedConnection(repositoryName: string): RepositoryConnectionState {
  const trimmedRepositoryName = repositoryName.trim();
  if (!trimmedRepositoryName) throw new Error("A repository name is required to complete a connection.");
  return { status: "connected", repositoryName: trimmedRepositoryName };
}
