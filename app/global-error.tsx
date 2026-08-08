"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <html lang="en"><body><main className="error-screen"><div><p className="eyebrow"><i aria-hidden="true" />Vulcan recovery</p><h1>Something went wrong</h1><p>Your account and repository settings were not changed. Try again, or return to the workspace.</p><button type="button" onClick={reset}>Try again</button></div></main></body></html>;
}
