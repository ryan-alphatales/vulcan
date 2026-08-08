import Link from "next/link";
import { RiShieldLine } from "react-icons/ri";

export function VulcanBrand() {
  return <Link href="/workspace" className="vulcan-brand" aria-label="Vulcan workspace"><RiShieldLine aria-hidden="true" /><span>VULCAN</span></Link>;
}
