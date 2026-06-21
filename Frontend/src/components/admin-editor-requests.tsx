"use client";

import { CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { EditorRequestRecord } from "@/lib/api/types";

export function AdminEditorRequests() {
  const [requests, setRequests] = useState<EditorRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{
        message?: string;
        data: EditorRequestRecord[];
      }>(apiPaths.admin.editorRequests);
      setRequests(response.data ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load Editor requests.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(request: EditorRequestRecord) {
    setWorking(request.application_id);
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.admin.makeEditor(request.user_id),
        { method: "POST" },
      );
      toast.success(response.message ?? "User promoted to Editor.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to approve request.",
      );
    } finally {
      setWorking(null);
    }
  }

  return (
    <section className="dashboard-section">
      <div className="toolbar">
        <div>
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            Editor applications
          </p>
          <h2>Review access requests</h2>
        </div>
        <button className="button ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="request-grid">
        {requests.map((request) => (
          <article className="request-card" key={request.application_id}>
            <div className="toolbar compact-toolbar">
              <div>
                <b>{request.name}</b>
                <p className="muted">
                  @{request.username} · {request.email}
                </p>
              </div>
              <span
                className={`status ${request.status === "PENDING" ? "red" : "aqua"}`}
              >
                {request.status}
              </span>
            </div>
            <p>{request.note || "No application note was provided."}</p>
            <small className="muted">
              Submitted {new Date(request.created_at).toLocaleString()}
            </small>
            {request.status === "PENDING" ? (
              <button
                className="button red"
                disabled={working !== null}
                onClick={() => void approve(request)}
              >
                {working === request.application_id ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <ShieldCheck size={17} />
                )}
                Promote to Editor
              </button>
            ) : (
              <div className="success-inline">
                <CheckCircle2 size={17} /> Reviewed
              </div>
            )}
          </article>
        ))}
        {!loading && requests.length === 0 ? (
          <div className="empty-state">No Editor applications are available.</div>
        ) : null}
      </div>

      <div className="notice" style={{ marginTop: 24 }}>
        Approve applicants who demonstrate subject knowledge, clear communication and a
        constructive approach to community learning.
      </div>
    </section>
  );
}
