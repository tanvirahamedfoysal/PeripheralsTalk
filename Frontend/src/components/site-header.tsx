"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";

import { roleHome } from "@/lib/auth/types";
import { useSession } from "@/providers/session-provider";

import { Brand } from "./brand";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { session, loading } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="topbar">
      <Link href="/" aria-label="PeripheralsTalk home">
        <Brand />
      </Link>

      <nav className="nav" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const current =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={current ? "current" : undefined}
              aria-current={current ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="header-actions">
        {!loading && session ? (
          <Link className="button" href={roleHome(session.user.role)}>
            <UserRound size={17} /> Dashboard
          </Link>
        ) : (
          <Link className="button red" href="/login">
            <LogIn size={17} /> Login
          </Link>
        )}

        <button
          type="button"
          className="icon-button mobile-nav-button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      <nav
        className={`mobile-nav-panel${mobileOpen ? " open" : ""}`}
        aria-label="Mobile navigation"
      >
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
