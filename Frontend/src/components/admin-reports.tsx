"use client";

import { CheckCircle2, Eye, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { ReportRecord } from "@/lib/api/types";

interface CommentUserRecord {
  user_id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  comment_id: number;
  comment_content: string;
  is_deleted: boolean;
}

export function AdminReports() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [inspectedUser, setInspectedUser] = useState<CommentUserRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ message?: string; data: ReportRecord[] }>(
        apiPaths.admin.reports,
      );
      setReports(response.data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolve(report: ReportRecord) {
    setWorking(`resolve-${report.report_id}`);
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.admin.resolveReport(report.report_id),
        { method: "POST" },
      );
      toast.success(response.message ?? "Report resolved.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resolve report.");
    } finally {
      setWorking(null);
    }
  }

  async function inspect(report: ReportRecord) {
    setWorking(`inspect-${report.report_id}`);
    try {
      const response = await apiRequest<{ message?: string; data: CommentUserRecord }>(
        apiPaths.admin.userByComment(report.comment_id),
      );
      setInspectedUser(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to inspect user.");
    } finally {
      setWorking(null);
    }
  }

  return (
    <section className="dashboard-section">
      <div className="toolbar">
        <div>
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            Community reports
          </p>
          <h2>Moderation reports</h2>
        </div>
        <button className="button ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {inspectedUser ? (
        <div className="inspection-card">
          <div>
            <b>{inspectedUser.name}</b>
            <p className="muted">
              User #{inspectedUser.user_id} · @{inspectedUser.username} ·{" "}
              {inspectedUser.email}
            </p>
          </div>
          <span className={`status ${inspectedUser.is_active ? "aqua" : "red"}`}>
            {inspectedUser.role} / {inspectedUser.is_active ? "Active" : "Suspended"}
          </span>
          <button className="button ghost" onClick={() => setInspectedUser(null)}>
            Close
          </button>
        </div>
      ) : null}

      <div className="report-list">
        {reports.map((report) => (
          <article className="report-card" key={report.report_id}>
            <div className="toolbar compact-toolbar">
              <div>
                <b>Report #{report.report_id}</b>
                <p className="muted">
                  @{report.reporter_username ?? "unknown"} reported @
                  {report.reported_username ?? "unknown"}
                </p>
              </div>
              <span
                className={`status ${report.status === "PENDING" ? "red" : "aqua"}`}
              >
                {report.status}
              </span>
            </div>
            <blockquote>
              {report.comment_content || "Comment content unavailable."}
            </blockquote>
            <p>
              <b>Reason:</b> {report.note || "No note provided."}
            </p>
            <small className="muted">
              Created {new Date(report.created_at).toLocaleString()}
            </small>
            <div className="actions">
              <button
                className="button ghost"
                disabled={working !== null}
                onClick={() => void inspect(report)}
              >
                {working === `inspect-${report.report_id}` ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <Eye size={17} />
                )}
                Inspect reported user
              </button>
              {report.status === "PENDING" ? (
                <button
                  className="button red"
                  disabled={working !== null}
                  onClick={() => void resolve(report)}
                >
                  {working === `resolve-${report.report_id}` ? (
                    <LoaderCircle className="spin" size={17} />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  Mark resolved
                </button>
              ) : null}
            </div>
          </article>
        ))}
        {!loading && reports.length === 0 ? (
          <div className="empty-state">No reports are available.</div>
        ) : null}
      </div>
    </section>
  );
}
