import Link from "next/link";

import { VulcanBrand } from "@/components/vulcan-brand";
import { SignOutButton } from "@/components/sign-out-button";

type NavigationKey = "workspace" | "repositories" | "history" | "findings";

const navigation: Array<{ key: NavigationKey; label: string; href: string }> = [
  { key: "workspace", label: "Workspace", href: "/workspace" },
  { key: "repositories", label: "Repositories", href: "/connect" },
  { key: "history", label: "Scan history", href: "/history" },
  { key: "findings", label: "Findings", href: "/history" },
];

export function AppNavigation({ active, name, repositoryCount }: { active: NavigationKey; name?: string | null; repositoryCount?: number }) {
  const initials = (name?.trim() || "V").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <header className="app-nav"><VulcanBrand /><nav aria-label="Primary navigation">{navigation.map((item) => <Link key={item.key} href={item.href} className={item.key === active ? "nav-link active" : "nav-link"}>{item.label}</Link>)}</nav><div className="nav-actions">{repositoryCount !== undefined ? <span className="repository-status"><i aria-hidden="true" />{repositoryCount === 1 ? "1 repository connected" : repositoryCount ? `${repositoryCount} repositories connected` : "No repositories connected"}</span> : null}<SignOutButton /><span className="user-avatar" aria-label="Account menu">{initials}</span></div></header>;
}
