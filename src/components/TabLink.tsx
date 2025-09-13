
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabLink({ href, label }: { href: string; label: string }) {
  let pathname = "";
  if (typeof window !== "undefined") {
    pathname = window.location.pathname;
  }
  try {
    pathname = usePathname() || pathname;
  } catch {}
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
