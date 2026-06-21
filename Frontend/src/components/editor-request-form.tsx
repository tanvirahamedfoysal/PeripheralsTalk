"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";

export function EditorRequestForm() {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiRequest<{ message?: string }>(
        apiPaths.profile.requestEditor,
        { method: "POST", body: { note: note.trim() || null } },
      );
      toast.success(result.message ?? "Editor application submitted.");
      setNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Application failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dashboard-section">
      <h2>Request Editor access</h2>
      <p className="muted">
        Explain how you can contribute reliable peripheral content. Only one pending
        request is allowed.
      </p>
      <form onSubmit={submit} style={{ marginTop: 22 }}>
        <div className="field">
          <label className="label" htmlFor="editor-note">
            Application note
          </label>
          <textarea
            id="editor-note"
            className="textarea"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Describe your hardware knowledge and editing experience."
          />
        </div>
        <button className="button red" disabled={submitting} style={{ marginTop: 16 }}>
          {submitting ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Send size={17} />
          )}{" "}
          Submit application
        </button>
      </form>
    </section>
  );
}
