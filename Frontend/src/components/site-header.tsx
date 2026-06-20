"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, Menu, Search, UserRound, X } from "lucide-react";

import { Brand } from "./brand";

interface HeaderSessionUser {
  role?: string;
}

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader(): React.ReactElement {
  const pathname = usePathname();
  const [user, setUser] = useState<HeaderSessionUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setUser(data.session?.user ?? null);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "EDITOR"
        ? "/editor"
        : "/dashboard";

  return (
    <header className="topbar">
      <Link href="/" aria-label="PeripheralsTalk home">
        <Brand />
      </Link>

      <nav className="nav" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "current" : undefined}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        {user ? (
          <Link className="button" href={dashboardHref}>
            <UserRound size={17} aria-hidden="true" />
            Dashboard
          </Link>
        ) : (
          <Link className="button red" href="/login">
            <LogIn size={17} aria-hidden="true" />
            Login
          </Link>
        )}

        <button
          type="button"
          className="icon-button mobile-nav-button"
          onClick={() => setMobileOpen((current) => !current)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? (
            <X size={19} aria-hidden="true" />
          ) : (
            <Menu size={19} aria-hidden="true" />
          )}
        </button>
      </div>

      <nav
        className={`mobile-nav-panel${mobileOpen ? " open" : ""}`}
        aria-label="Mobile navigation"
      >
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "current" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
