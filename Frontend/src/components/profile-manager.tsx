"use client";

import Image from "next/image";
import { ImageUp, LoaderCircle, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { ApiEnvelope, ProfileRecord, UploadImageResponse } from "@/lib/api/types";
import { useSession } from "@/providers/session-provider";

export function ProfileManager({
  showDangerZone = false,
}: {
  showDangerZone?: boolean;
}) {
  const { refresh } = useSession();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await apiRequest<ApiEnvelope<ProfileRecord>>(apiPaths.profile.me);
      setProfile(payload.data);
      setName(payload.data.name);
      setUsername(payload.data.username);
      setImageUrl(payload.data.image_url);
      setImagePublicId(payload.data.image_public_id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await apiRequest<UploadImageResponse>(
        apiPaths.utility.uploadImage,
        { method: "POST", body: form },
      );
      setImageUrl(result.url);
      setImagePublicId(result.public_id);
      toast.success("Image uploaded. Save the profile to apply it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest(apiPaths.profile.me, {
        method: "PUT",
        body: {
          name: name.trim(),
          username: username.trim(),
          image_url: imageUrl,
          image_public_id: imagePublicId,
        },
      });
      toast.success("Profile updated.");
      await Promise.all([load(), refresh()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    try {
      await apiRequest(apiPaths.profile.me, { method: "DELETE" });
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Account deletion failed.");
    }
  }

  if (loading)
    return (
      <div className="loading-panel">
        <LoaderCircle className="spin" size={24} /> Loading profile…
      </div>
    );
  if (!profile)
    return <div className="error-box">Profile information is unavailable.</div>;

  return (
    <>
      <section className="dashboard-section">
        <div className="profile-editor-head">
          {imageUrl ? (
            <Image
              src={imageUrl}
              width={92}
              height={92}
              alt="Profile"
              className="profile-avatar"
            />
          ) : (
            <span className="profile-avatar avatar-fallback">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <h2>{profile.name}</h2>
            <p className="muted">
              {profile.email} · {profile.role}
            </p>
            <label className="button ghost file-button">
              {uploading ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <ImageUp size={17} />
              )}
              {uploading ? "Uploading…" : "Upload profile image"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
            </label>
          </div>
        </div>

        <form onSubmit={save} className="form-grid" style={{ marginTop: 28 }}>
          <div className="field">
            <label className="label" htmlFor="profile-name">
              Full name
            </label>
            <input
              id="profile-name"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="profile-username">
              Username
            </label>
            <input
              id="profile-username"
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div className="full">
            <button className="button red" disabled={saving}>
              {saving ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Save size={17} />
              )}{" "}
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>

      {showDangerZone ? (
        <section className="dashboard-section danger-zone">
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            Danger zone
          </p>
          <h2>Delete account permanently</h2>
          <p className="muted">
            This action permanently removes your account and cannot be undone. Review
            your decision carefully before continuing.
          </p>
          <div className="danger-confirm-row">
            <input
              className="input"
              placeholder="Type DELETE"
              value={deleteConfirm}
              onChange={(event) => setDeleteConfirm(event.target.value)}
            />
            <button
              className="button danger"
              disabled={deleteConfirm !== "DELETE"}
              onClick={() => void deleteAccount()}
            >
              <Trash2 size={17} /> Delete account
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
