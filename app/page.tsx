import Link from "next/link";
import { RiArrowRightLine, RiShieldLine } from "react-icons/ri";

import { VulcanBrand } from "@/components/vulcan-brand";

export default function Home() {
  return <main className="landing"><header className="landing-nav"><VulcanBrand /><div><Link href="/login">Sign in</Link><Link className="primary-action button-link" href="/register">Create account</Link></div></header><section className="landing-hero"><div><p className="eyebrow"><i aria-hidden="true" />Pull-request security</p><h1>Security feedback<br /><span>before code merges.</span></h1><p>Vulcan scans every connected pull request, turns risk into plain language, and keeps your review workflow moving.</p><div className="actions"><Link className="primary-action button-link" href="/register">Start protecting repos <RiArrowRightLine aria-hidden="true" /></Link><Link className="secondary-action button-link" href="/login">Sign in</Link></div></div><aside className="landing-terminal"><RiShieldLine aria-hidden="true" /><p>&gt; PR #24 received</p><p className="terminal-success">&gt; scan complete · 3 files reviewed</p><p className="terminal-warning">&gt; 1 high-confidence finding</p><p className="terminal-success">&gt; review comment ready</p></aside></section></main>;
}
