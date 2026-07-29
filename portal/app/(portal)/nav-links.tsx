"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/queue", label: "Today's Queue" },
  { href: "/subscribers", label: "Subscribers" },
  { href: "/history", label: "History" },
  { href: "/prompts", label: "Prompts" },
];

export function NavLinks({ queueCount }: { queueCount: number }) {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Portal navigation">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={pathname.startsWith(l.href) ? "active" : ""}
        >
          {l.label}
          {l.href === "/queue" && queueCount > 0 && (
            <span className="count">{queueCount}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
