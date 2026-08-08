import Link from "next/link";

import { PublicAuthShell } from "@/components/public-auth-shell";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return <PublicAuthShell eyebrow="Create workspace" title="Create your account"><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link>.</p><p className="auth-intro">Verify your email, then connect the repositories you want Vulcan to protect.</p><RegisterForm /></PublicAuthShell>;
}
