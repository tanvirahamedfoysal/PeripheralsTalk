"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type {
  ApiEnvelope,
  CategoryRecord,
  EditorRequestRecord,
  ReportRecord,
  UserRecord,
} from "@/lib/api/types";

import { Metrics } from "./dashboard-page";

interface OverviewState {
  users: number | null;
  categories: number | null;
  reports: number | null;
  pendingEditorRequests: number | null;
}

export function AdminOverview() {
  const [state, setState] = useState<OverviewState>({
    users: null,
    categories: null,
    reports: null,
    pendingEditorRequests: null,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [users, categories, reports, requests] = await Promise.allSettled([
      apiRequest<{ users: UserRecord[] }>(apiPaths.profile.all),
      apiRequest<ApiEnvelope<CategoryRecord[]>>(apiPaths.category.list),
      apiRequest<{ data: ReportRecord[] }>(apiPaths.admin.reports),
      apiRequest<{ data: EditorRequestRecord[] }>(apiPaths.admin.editorRequests),
    ]);

    setState({
      users: users.status === "fulfilled" ? users.value.users.length : null,
      categories:
        categories.status === "fulfilled" ? categories.value.data.length : null,
      reports: reports.status === "fulfilled" ? reports.value.data.length : null,
      pendingEditorRequests:
        requests.status === "fulfilled"
          ? requests.value.data.filter((item) => item.status === "PENDING").length
          : null,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Metrics
        items={[
          {
            label: "Users",
            value: state.users === null ? "—" : String(state.users),
            note: "Registered community members",
          },
          {
            label: "Categories",
            value: state.categories === null ? "—" : String(state.categories),
            note: "Topics in the learning directory",
          },
          {
            label: "Reports",
            value: state.reports === null ? "—" : String(state.reports),
            note: "All moderation reports",
          },
          {
            label: "Pending Editors",
            value:
              state.pendingEditorRequests === null
                ? "—"
                : String(state.pendingEditorRequests),
            note: "Applications waiting for review",
          },
        ]}
      />
      <section className="dashboard-section">
        <div className="toolbar">
          <div>
            <h2>Community overview</h2>
            <p className="muted">
              Use these totals to understand current membership, learning topics,
              contributor applications and community reports.
            </p>
          </div>
          <button
            className="button ghost"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <RefreshCw size={17} />
            )}
            Refresh totals
          </button>
        </div>
      </section>
    </>
  );
}
