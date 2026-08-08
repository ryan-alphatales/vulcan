export type ScanFailureReason = "repository_access" | "provider" | "ai_service" | "timeout" | "internal";

const reasonCopy: Record<ScanFailureReason, string> = {
  repository_access: "Vulcan could not access this repository. Check the repository connection and permissions, then retry.",
  provider: "Vulcan could not reach the Git provider. Please retry shortly.",
  ai_service: "Vulcan's analysis service was unavailable. Please retry shortly.",
  timeout: "Vulcan's scan timed out before it could complete. You can safely retry the scan.",
  internal: "Vulcan could not complete this scan due to an internal error. You can safely retry the scan.",
};

export function formatScanFailureNotice(reason: ScanFailureReason): string {
  return `## Vulcan scan did not complete\n\n${reasonCopy[reason]}\n\nThis does not block merging this pull request.`;
}
