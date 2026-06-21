"use client";

import Image from "next/image";
import { Copy, ImageUp, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { UploadImageResponse } from "@/lib/api/types";

export function MediaUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadImageResponse | null>(null);
  const [uploading, setUploading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await apiRequest<UploadImageResponse>(
        apiPaths.utility.uploadImage,
        { method: "POST", body: form },
      );
      setResult(response);
      toast.success("Image uploaded to Cloudinary.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard.");
  }

  return (
    <section className="dashboard-section">
      <div className="toolbar">
        <div>
          <h2>Cloudinary media upload</h2>
          <p className="muted">
            The backend accepts multipart form data using the field name{" "}
            <code>file</code>.
          </p>
        </div>
        <ImageUp size={28} color="var(--teal)" />
      </div>
      <form onSubmit={submit} className="upload-form">
        <label className="upload-dropzone">
          <ImageUp size={32} />
          <b>{file ? file.name : "Choose an image"}</b>
          <span className="muted">
            PNG, JPG, WEBP or another image format accepted by the backend uploader
          </span>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <button className="button red" disabled={!file || uploading}>
          {uploading ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <ImageUp size={17} />
          )}{" "}
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      </form>

      {result ? (
        <div className="upload-result">
          <Image
            src={result.url}
            width={320}
            height={220}
            alt="Uploaded media"
            className="uploaded-preview"
          />
          <div className="field">
            <label className="label">URL</label>
            <div className="input-action-row">
              <input className="input" readOnly value={result.url} />
              <button className="icon-button" onClick={() => void copy(result.url)}>
                <Copy size={16} />
              </button>
            </div>
          </div>
          <div className="field">
            <label className="label">Public ID</label>
            <div className="input-action-row">
              <input className="input" readOnly value={result.public_id} />
              <button
                className="icon-button"
                onClick={() => void copy(result.public_id)}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
