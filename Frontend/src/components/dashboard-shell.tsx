"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  FilePlus2,
  Flag,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
} from "lucide-react";

import type { AuthSession, UserRole } from "@/lib/auth/types";

import { Brand } from "./brand";

const navs: Record<UserRole, { href: string; label: string; icon: typeof Home }[]> = {
  USER: [
    { href: "/dashboard/profile", label: "Profile", icon: UserCog },
    { href: "/dashboard/bookmarks", label: "Saved articles", icon: Bookmark },
    { href: "/dashboard/comments", label: "Discussions", icon: MessageSquare },
    { href: "/dashboard/editor-request", label: "Editor request", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  EDITOR: [
    { href: "/editor/articles", label: "Articles", icon: BookOpen },
    { href: "/editor/articles/new", label: "Write article", icon: FilePlus2 },
    { href: "/editor/moderation", label: "Community standards", icon: Flag },
    { href: "/editor/settings", label: "Settings", icon: Settings },
  ],
  ADMIN: [
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/articles", label: "Articles", icon: BookOpen },
    { href: "/admin/articles/new", label: "Write article", icon: FilePlus2 },
    { href: "/admin/editor-requests", label: "Editor requests", icon: ShieldCheck },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export function DashboardShell({
  session,
  role,
  children,
}: {
  session: AuthSession;
  role: UserRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeHref = [...navs[role]]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.href;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  return (
    <div className="dashboard-layout">
      <aside className="dash-side">
        <Link href="/">
          <Brand light />
        </Link>
        <div className="dash-role">
          <div className="dash-user-row">
            {session.user.avatarUrl ? (
              <Image
                src={session.user.avatarUrl}
                width={42}
                height={42}
                alt=""
                className="avatar"
              />
            ) : (
              <span className="avatar avatar-fallback">
                {session.user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <b>{session.user.name}</b>
              <br />
              <small>{session.user.role} workspace</small>
            </div>
          </div>
        </div>

        <nav className="dash-nav">
          {navs[role].map((item) => {
            const Icon = item.icon;
            const active = item.href === activeHref;
            return (
              <Link className={active ? "active" : ""} href={item.href} key={item.href}>
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button className="button ghost dash-logout" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="dash-main">
        <header className="dash-top">
          <span className="eyebrow muted">PeripheralsTalk / {role}</span>
          <Link href="/" className="button ghost">
            <Home size={17} /> View site
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
