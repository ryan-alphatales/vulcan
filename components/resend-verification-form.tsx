"use client";

import { useState, type FormEvent } from "react";

export function ResendVerificationForm() {
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(undefined);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/verification/resend", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: data.get("email") }) });
      const body = await response.json() as { message?: string };
      setMessage(body.message ?? "We could not request a verification link. Please try again.");
    } catch {
      setMessage("We could not request a verification link. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }
  return <form onSubmit={submit} className="form-card resend"><h2>Send a new link</h2><label>Email <input name="email" type="email" autoComplete="email" required /></label><button type="submit" disabled={pending}>{pending ? "Sending…" : "Send a new link"}</button>{message && <p role="status">{message}</p>}</form>;
}
