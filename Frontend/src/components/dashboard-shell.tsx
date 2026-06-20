"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  Boxes,
  ChartNoAxesCombined,
  CircleGauge,
  FileClock,
  FilePlus2,
  Flag,
  FolderKanban,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  UserCog,
  Users,
} from "lucide-react";
import type { AuthSession, UserRole } from "@/lib/auth/types";
import { Brand } from "./brand";
const navs: Record<UserRole, { href: string; label: string; icon: typeof Home }[]> = {
  USER: [
    { href: "/dashboard", label: "Overview", icon: CircleGauge },
    { href: "/dashboard/profile", label: "Profile", icon: UserCog },
    { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: "/dashboard/comments", label: "My comments", icon: MessageSquare },
    {
      href: "/dashboard/editor-request",
      label: "Editor request",
      icon: ShieldCheck,
    },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  EDITOR: [
    { href: "/editor", label: "Overview", icon: CircleGauge },
    { href: "/editor/articles", label: "Articles", icon: BookOpen },
    { href: "/editor/articles/new", label: "Write article", icon: FilePlus2 },
    { href: "/editor/moderation", label: "Moderation", icon: Flag },
    { href: "/editor/media", label: "Media", icon: FolderKanban },
    { href: "/editor/settings", label: "Settings", icon: Settings },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: CircleGauge },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/articles", label: "Articles", icon: BookOpen },
    {
      href: "/admin/editor-requests",
      label: "Editor requests",
      icon: ShieldCheck,
    },
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
  const path = usePathname();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.assign("/login");
  }
  return (
    <div className="dashboard-layout">
      <aside className="dash-side">
        <Link href="/">
          <Brand light />
        </Link>
        <div className="dash-role">
          <b>{session.user.name}</b>
          <br />
          <small>{session.user.role} workspace</small>
        </div>
        <nav className="dash-nav">
          {navs[role].map((n) => {
            const I = n.icon;
            const active =
              path === n.href ||
              (n.href !== `/${role.toLowerCase()}` && path.startsWith(n.href + "/"));
            return (
              <Link className={active ? "active" : ""} href={n.href} key={n.href}>
                <I size={19} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          className="button ghost dash-logout"
          style={{ color: "#fff", borderColor: "rgba(255,255,255,.15)" }}
          onClick={logout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
      <main className="dash-main">
        <header className="dash-top">
          <div>
            <span className="eyebrow muted">PeripheralsTalk / {role}</span>
          </div>
          <div className="header-actions">
            <Link href="/" className="button ghost">
              <Home size={17} />
              View site
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
