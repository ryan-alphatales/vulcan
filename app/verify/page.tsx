import { Suspense } from "react";

import { PublicAuthShell } from "@/components/public-auth-shell";
import { VerifyAccount } from "@/components/verify-account";
import { ResendVerificationForm } from "@/components/resend-verification-form";

export default function VerifyPage() {
  return <PublicAuthShell eyebrow="Account activation" title="Activate your account"><p className="auth-intro">One confirmation and your secure workspace is ready to use.</p><Suspense fallback={<p className="auth-intro">Loading verification link…</p>}><VerifyAccount /></Suspense><ResendVerificationForm /></PublicAuthShell>;
}
