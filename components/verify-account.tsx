"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function VerifyAccount() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);
  const token = searchParams.get("token");

  async function verify() {
    if (!token) return;
    setPending(true); setMessage(undefined);
    const response = await fetch("/api/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await response.json() as { message: string };
    if (response.ok) router.push("/workspace");
    else { setPending(false); setMessage(data.message); }
  }

  return <section className="form-card"><h2>Verify your email</h2>{token ? <><p>Confirm your email to activate your account and open your workspace.</p><button type="button" onClick={verify} disabled={pending}>{pending ? "Verifying…" : "Verify and continue"}</button></> : <p className="form-message error">This verification link is invalid or incomplete. Use the “Send a new link” form below with the email you used to register.</p>}{message && <p role="alert" className="form-message error">{message}</p>}</section>;
}
