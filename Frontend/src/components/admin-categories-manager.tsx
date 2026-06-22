"use client";

import { LoaderCircle, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { ApiEnvelope, CategoryRecord } from "@/lib/api/types";
import { notifyCategoryUpdate } from "@/lib/category-events";

export function AdminCategoriesManager() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest<ApiEnvelope<CategoryRecord[]>>(
        apiPaths.category.list,
      );
      setCategories([...(response.data ?? [])].sort((a, b) => a.id - b.id));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) return;
    setWorking("create");
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.category.create,
        {
          method: "POST",
          body: { name: newName.trim() },
        },
      );
      toast.success(response.message ?? "Category created.");
      setNewName("");
      await load();
      notifyCategoryUpdate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create category.",
      );
    } finally {
      setWorking(null);
    }
  }

  async function update(category: CategoryRecord) {
    if (!editingName.trim()) return;
    setWorking(`update-${category.id}`);
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.category.update(category.id),
        { method: "PUT", body: { name: editingName.trim() } },
      );
      toast.success(response.message ?? "Category updated.");
      setEditingId(null);
      await load();
      notifyCategoryUpdate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update category.",
      );
    } finally {
      setWorking(null);
    }
  }

  async function remove(category: CategoryRecord) {
    if (
      !window.confirm(
        `Delete ${category.name}? Categories connected to published learning content may need to be kept.`,
      )
    ) {
      return;
    }

    setWorking(`delete-${category.id}`);
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.category.remove(category.id),
        { method: "DELETE" },
      );
      toast.success(response.message ?? "Category deleted.");
      await load();
      notifyCategoryUpdate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete category.",
      );
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="workspace-stack">
      <section className="dashboard-section">
        <div className="toolbar">
          <div>
            <p className="eyebrow" style={{ color: "var(--red)" }}>
              Create peripheral type
            </p>
            <h2>Add a category</h2>
          </div>
          <Plus size={28} color="var(--teal)" />
        </div>
        <form onSubmit={create} className="inline-form">
          <input
            className="input"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Peripheral name"
            required
          />
          <button className="button red" disabled={working !== null || !newName.trim()}>
            {working === "create" ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Plus size={17} />
            )}
            Add category
          </button>
        </form>
        <p className="muted" style={{ marginBottom: 0 }}>
          Use a short, clear category name that learners can recognize immediately.
        </p>
      </section>

      <section className="dashboard-section">
        <div className="toolbar">
          <div>
            <p className="eyebrow muted">Current learning categories</p>
            <h2>{categories.length} categories</h2>
          </div>
          <button
            className="button ghost"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw size={17} /> Refresh
          </button>
        </div>

        <div className="category-admin-list">
          {categories.map((category, index) => (
            <div className="category-admin-row" key={category.id}>
              <span className="category-admin-id">
                {String(index + 1).padStart(2, "0")}
              </span>
              {editingId === category.id ? (
                <input
                  className="input"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  autoFocus
                />
              ) : (
                <b>{category.name}</b>
              )}
              <div className="actions compact">
                {editingId === category.id ? (
                  <>
                    <button
                      className="icon-button"
                      title="Save"
                      disabled={working !== null}
                      onClick={() => void update(category)}
                    >
                      {working === `update-${category.id}` ? (
                        <LoaderCircle className="spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                    </button>
                    <button
                      className="icon-button"
                      title="Cancel"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    className="icon-button"
                    title="Rename"
                    onClick={() => {
                      setEditingId(category.id);
                      setEditingName(category.name);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  className="icon-button danger-icon"
                  title="Delete"
                  disabled={working !== null}
                  onClick={() => void remove(category)}
                >
                  {working === `delete-${category.id}` ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
          {loading ? (
            <div className="loading-panel">
              <LoaderCircle className="spin" size={22} /> Loading categories…
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
