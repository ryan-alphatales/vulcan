"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(undefined);
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), redirect: false });
    if (result?.ok) router.push("/workspace");
    else { setPending(false); setError("We couldn’t sign you in with those credentials. Check them and try again."); }
  }
  return <form className="login-form" onSubmit={submit}>
    <label>Email <input name="email" type="email" autoComplete="email" required /></label>
    <label>Password <input name="password" type="password" autoComplete="current-password" required /></label>
    <div className="login-options"><label className="check-label"><input type="checkbox" defaultChecked /> <span>Stay signed in</span></label><a href="mailto:support@parichay4.online">Forgot password?</a></div>
    <button className="primary-action" disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</button>
    {error && <p role="alert" className="form-message error">{error}</p>}
  </form>;
}
