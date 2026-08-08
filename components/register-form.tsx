"use client";

import { useState, type FormEvent } from "react";

export function RegisterForm() {
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setMessage(undefined);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password"), displayName: data.get("displayName") || undefined }) });
    const payload = await response.json() as { message: string };
    setPending(false); setMessage(payload.message);
  }

  return <form className="form-card" onSubmit={submit}>
    <label>Name <input name="displayName" autoComplete="name" /></label>
    <label>Email <input name="email" type="email" autoComplete="email" required /></label>
    <label>Password <input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
    <p className="form-hint">Use at least 12 characters. We’ll send a verification link before activating your account.</p>
    <button disabled={pending} type="submit">{pending ? "Creating account…" : "Create account"}</button>
    {message && <p role="status" className="form-message">{message}</p>}
  </form>;
}
