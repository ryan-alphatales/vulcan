import { ConnectionRecoveryPanel } from "@/components/connection-recovery-panel";
import { PublicAuthShell } from "@/components/public-auth-shell";

export default function ConnectionRecoveryPage() {
  return <PublicAuthShell eyebrow="Repository setup" title="Connect a repository"><p className="auth-intro">Review the connection result and safely continue your setup.</p><ConnectionRecoveryPanel /></PublicAuthShell>;
}
