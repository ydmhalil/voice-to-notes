"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function TabLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={
        "px-4 py-2 rounded-md font-medium text-sm border transition-colors " +
        (isActive
          ? "bg-black text-white border-black pointer-events-none"
          : "bg-white text-black border-black hover:bg-gray-100")
      }
    >
      {label}
    </Link>
  );
}

export default function HeaderNav() {
  return (
    <nav className="flex gap-2">
      <TabLink href="/" label="Ana Sayfa" />
      <TabLink href="/notes" label="Notlarım" />
    </nav>
  );
}