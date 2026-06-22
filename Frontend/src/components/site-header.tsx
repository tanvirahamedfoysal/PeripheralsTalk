"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { roleHome, type UserRole } from "@/lib/auth/types";
import { useSession } from "@/providers/session-provider";

import { Brand } from "./brand";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const PROFILE_CLOSE_DELAY_MS = 1500;

function roleSettings(role: UserRole): string {
  if (role === "ADMIN") return "/admin/settings";
  if (role === "EDITOR") return "/editor/settings";
  return "/dashboard/settings";
}

export function SiteHeader(): React.ReactElement {
  const pathname = usePathname();
  const { session, loading, setSession } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearProfileCloseTimer(): void {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openProfileMenu(): void {
    clearProfileCloseTimer();
    setProfileOpen(true);
  }

  function scheduleProfileMenuClose(): void {
    clearProfileCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setProfileOpen(false);
      closeTimerRef.current = null;
    }, PROFILE_CLOSE_DELAY_MS);
  }

  useEffect(() => {
    return () => clearProfileCloseTimer();
  }, []);

  async function logout(): Promise<void> {
    clearProfileCloseTimer();
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    window.location.assign("/");
  }

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
          <div
            className={`profile-menu${profileOpen ? " open" : ""}`}
            onMouseEnter={openProfileMenu}
            onMouseLeave={scheduleProfileMenuClose}
            onFocusCapture={openProfileMenu}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                scheduleProfileMenuClose();
              }
            }}
          >
            <button
              type="button"
              className="profile-trigger"
              onClick={() => {
                clearProfileCloseTimer();
                setProfileOpen((value) => !value);
              }}
              aria-label="Open account menu"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              {session.user.avatarUrl ? (
                <Image
                  src={session.user.avatarUrl}
                  width={46}
                  height={46}
                  alt={`${session.user.name} profile`}
                  className="profile-trigger-image"
                />
              ) : (
                <UserRound size={22} strokeWidth={1.8} />
              )}
            </button>

            <div
              className="profile-dropdown"
              role="menu"
              onMouseEnter={clearProfileCloseTimer}
              onMouseLeave={scheduleProfileMenuClose}
            >
              <Link
                href={roleHome(session.user.role)}
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                href={roleSettings(session.user.role)}
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
              <button type="button" role="menuitem" onClick={logout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : !loading ? (
          <div className="auth-header-actions">
            <Link className="button ghost login-button" href="/login">
              <LogIn size={17} /> Login
            </Link>
            <Link className="button red register-button" href="/register">
              <UserPlus size={17} /> Register
            </Link>
          </div>
        ) : (
          <span className="header-session-placeholder" aria-hidden="true" />
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
        {navigationItems.map((item) => {
          const current =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={current ? "current" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
