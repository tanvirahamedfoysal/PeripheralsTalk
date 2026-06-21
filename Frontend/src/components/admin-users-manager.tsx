"use client";

import Image from "next/image";
import {
  Ban,
  CheckCircle2,
  Copy,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldMinus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { UserRecord } from "@/lib/api/types";

interface UsersResponse {
  is_successful?: boolean;
  total_users?: number;
  users: UserRecord[];
}

export function AdminUsersManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<{
    userId: number;
    password: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest<UsersResponse>(apiPaths.profile.all);
      setUsers(response.users ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      [user.name, user.username, user.email, user.role, String(user.id)]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, users]);

  async function act(
    key: string,
    path: string,
    successFallback: string,
  ): Promise<void> {
    setWorking(key);
    try {
      const response = await apiRequest<{ message?: string }>(path, {
        method: "POST",
      });
      toast.success(response.message ?? successFallback);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The action failed.");
    } finally {
      setWorking(null);
    }
  }

  async function resetPassword(user: UserRecord): Promise<void> {
    if (!window.confirm(`Generate a new random password for ${user.username}?`)) {
      return;
    }

    setWorking(`password-${user.id}`);
    try {
      const response = await apiRequest<{
        message?: string;
        data?: { user_id: number; new_password: string };
      }>(apiPaths.admin.resetPassword(user.id), { method: "POST" });

      if (!response.data?.new_password) {
        throw new Error("A new password could not be generated.");
      }

      setGeneratedPassword({
        userId: response.data.user_id,
        password: response.data.new_password,
      });
      toast.success("Password reset. Copy the generated password now.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed.");
    } finally {
      setWorking(null);
    }
  }

  async function copyPassword(): Promise<void> {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword.password);
    toast.success("Password copied.");
  }

  return (
    <section className="dashboard-section">
      <div className="toolbar">
        <div>
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            Community members
          </p>
          <h2>Registered users</h2>
        </div>
        <button className="button ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="search-field">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, username, email, role or ID"
        />
      </div>

      {generatedPassword ? (
        <div className="generated-password-box">
          <div>
            <b>New password for user #{generatedPassword.userId}</b>
            <p>
              This plaintext password is returned only by this response. Copy it and
              send it securely to the user.
            </p>
          </div>
          <code>{generatedPassword.password}</code>
          <button className="button aqua" onClick={() => void copyPassword()}>
            <Copy size={17} /> Copy password
          </button>
          <button className="button ghost" onClick={() => setGeneratedPassword(null)}>
            Close
          </button>
        </div>
      ) : null}

      <div className="responsive-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const isSelf = String(user.id) === String(currentUserId);
              return (
                <tr key={user.id}>
                  <td>
                    <div className="table-user">
                      {user.image_url ? (
                        <Image
                          src={user.image_url}
                          width={38}
                          height={38}
                          alt=""
                          className="avatar"
                        />
                      ) : (
                        <span className="avatar avatar-fallback">
                          {user.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <b>{user.name}</b>
                        <small>
                          #{user.id} · @{user.username} {isSelf ? "· You" : ""}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status ${user.role === "ADMIN" ? "red" : ""}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${user.is_active ? "aqua" : "red"}`}>
                      {user.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td>
                    <div className="actions compact wrap">
                      {user.role === "USER" ? (
                        <button
                          className="icon-button"
                          title="Promote to Editor"
                          disabled={working !== null}
                          onClick={() =>
                            void act(
                              `editor-${user.id}`,
                              apiPaths.admin.makeEditor(user.id),
                              "User promoted to Editor.",
                            )
                          }
                        >
                          {working === `editor-${user.id}` ? (
                            <LoaderCircle className="spin" size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                        </button>
                      ) : null}

                      {user.role === "EDITOR" ? (
                        <button
                          className="icon-button"
                          title="Revoke Editor role"
                          disabled={working !== null}
                          onClick={() =>
                            void act(
                              `revoke-${user.id}`,
                              apiPaths.admin.revokeEditor(user.id),
                              "Editor role revoked.",
                            )
                          }
                        >
                          {working === `revoke-${user.id}` ? (
                            <LoaderCircle className="spin" size={16} />
                          ) : (
                            <ShieldMinus size={16} />
                          )}
                        </button>
                      ) : null}

                      {user.is_active ? (
                        <button
                          className="icon-button danger-icon"
                          title={
                            isSelf ? "You cannot suspend yourself" : "Suspend user"
                          }
                          disabled={working !== null || isSelf}
                          onClick={() =>
                            void act(
                              `suspend-${user.id}`,
                              apiPaths.admin.suspend(user.id),
                              "User suspended.",
                            )
                          }
                        >
                          {working === `suspend-${user.id}` ? (
                            <LoaderCircle className="spin" size={16} />
                          ) : (
                            <Ban size={16} />
                          )}
                        </button>
                      ) : (
                        <button
                          className="icon-button"
                          title="Unsuspend user"
                          disabled={working !== null}
                          onClick={() =>
                            void act(
                              `unsuspend-${user.id}`,
                              apiPaths.admin.unsuspend(user.id),
                              "User reactivated.",
                            )
                          }
                        >
                          {working === `unsuspend-${user.id}` ? (
                            <LoaderCircle className="spin" size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                        </button>
                      )}

                      <button
                        className="icon-button"
                        title="Generate a new password"
                        disabled={working !== null}
                        onClick={() => void resetPassword(user)}
                      >
                        {working === `password-${user.id}` ? (
                          <LoaderCircle className="spin" size={16} />
                        ) : (
                          <KeyRound size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">No matching users.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {loading ? (
        <div className="loading-panel">
          <LoaderCircle className="spin" size={22} /> Loading users…
        </div>
      ) : null}
    </section>
  );
}
