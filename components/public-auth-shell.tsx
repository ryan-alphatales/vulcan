import type { ReactNode } from "react";

import { RiShieldLine } from "react-icons/ri";

import { VulcanBrand } from "@/components/vulcan-brand";

export function PublicAuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <main className="auth-layout"><section className="auth-story"><VulcanBrand /><div className="auth-story-copy"><p className="eyebrow"><i aria-hidden="true" />Vulcan security</p><h1>Every pull request,<br /><span>scanned before it merges.</span></h1><p>Find security risks early, understand the impact clearly, and keep your code review moving.</p></div><div className="scan-terminal" aria-label="Vulcan scan status"><p>&gt; changed files queued for scan</p><p className="terminal-success">&gt; repository access protected</p><p className="terminal-warning">&gt; findings explained in plain language</p></div></section><section className="auth-panel"><div className="auth-panel-inner"><p className="eyebrow"><i aria-hidden="true" />{eyebrow}</p><h1>{title}</h1>{children}</div><RiShieldLine className="auth-side-mark" aria-hidden="true" /></section></main>;
}
