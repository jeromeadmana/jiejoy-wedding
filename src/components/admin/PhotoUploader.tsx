"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import type { Photo } from "@/lib/types/gallery";

type QueueItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number; // 0..1
  error?: string;
};

type Props = {
  albumSlug: string;
  onPhotoUploaded: (photo: Photo) => void;
};

const MAX_PARALLEL = 4;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic";

export function PhotoUploader({ albumSlug, onPhotoUploaded }: Props) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(0);
  const queueRef = useRef<QueueItem[]>([]);
  queueRef.current = queue;

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const drainQueue = useCallback(async () => {
    while (inFlight.current < MAX_PARALLEL) {
      const next = queueRef.current.find((q) => q.status === "pending");
      if (!next) break;

      inFlight.current++;
      updateItem(next.id, { status: "uploading", progress: 0 });

      uploadOne(next, albumSlug, onPhotoUploaded, updateItem)
        .catch((err) => {
          updateItem(next.id, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
        })
        .finally(() => {
          inFlight.current--;
          drainQueue();
        });
    }
  }, [albumSlug, onPhotoUploaded]);

  const enqueueFiles = useCallback(
    (files: FileList | File[]) => {
      const items: QueueItem[] = Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file: f,
          status: "pending",
          progress: 0,
        }));

      if (items.length === 0) return;
      setQueue((prev) => [...prev, ...items]);
      // queueRef is updated synchronously above; drain on the next tick so
      // the new items are visible to drainQueue's reads.
      setTimeout(() => drainQueue(), 0);
    },
    [drainQueue],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) enqueueFiles(e.dataTransfer.files);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) enqueueFiles(e.target.files);
    e.target.value = "";
  };

  const clearDone = () => {
    setQueue((prev) => prev.filter((q) => q.status !== "done"));
  };

  const doneCount = queue.filter((q) => q.status === "done").length;
  const errorCount = queue.filter((q) => q.status === "error").length;
  const activeCount = queue.filter((q) => q.status === "uploading" || q.status === "pending").length;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-12 transition-colors cursor-pointer"
        style={{
          borderColor: dragOver
            ? "var(--color-sage, #D4849A)"
            : "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)",
          backgroundColor: dragOver
            ? "color-mix(in srgb, var(--color-sage, #D4849A) 8%, transparent)"
            : "var(--color-surface, #FFFFFF)",
        }}
      >
        <Upload size={32} style={{ color: "var(--color-warm-gray, #6B6B6B)" }} />
        <p className="font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
          Drop photos here or click to browse
        </p>
        <p className="text-sm" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
          JPEG, PNG, WebP, AVIF, HEIC — multiple files OK
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleFilePick}
        />
      </button>

      {queue.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
              {activeCount > 0 && `${activeCount} uploading · `}
              {doneCount > 0 && `${doneCount} done · `}
              {errorCount > 0 && `${errorCount} failed`}
            </span>
            {doneCount > 0 && (
              <button
                onClick={clearDone}
                className="text-xs underline cursor-pointer"
                style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
              >
                Clear completed
              </button>
            )}
          </div>

          <ul className="flex flex-col gap-1.5">
            {queue.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{
                  backgroundColor:
                    item.status === "error"
                      ? "color-mix(in srgb, var(--color-dusty-rose, #C86464) 8%, transparent)"
                      : "var(--color-surface, #FFFFFF)",
                  border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 10%, transparent)",
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: "var(--color-charcoal, #2C2C2C)" }}
                    >
                      {item.file.name}
                    </p>
                    {item.status === "error" && (
                      <AlertCircle
                        size={14}
                        style={{ color: "var(--color-dusty-rose-dark, #A85050)" }}
                      />
                    )}
                  </div>
                  {item.status === "uploading" && (
                    <div
                      className="mt-1 h-1 overflow-hidden rounded"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 15%, transparent)" }}
                    >
                      <div
                        className="h-full transition-all duration-200"
                        style={{
                          width: `${Math.round(item.progress * 100)}%`,
                          backgroundColor: "var(--color-sage, #D4849A)",
                        }}
                      />
                    </div>
                  )}
                  {item.status === "error" && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-dusty-rose-dark, #A85050)" }}
                    >
                      {item.error}
                    </p>
                  )}
                </div>
                <span className="text-xs" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
                  {item.status === "done"
                    ? "Done"
                    : item.status === "uploading"
                      ? `${Math.round(item.progress * 100)}%`
                      : item.status === "pending"
                        ? "Queued"
                        : "Failed"}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="cursor-pointer"
                  style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                  aria-label="Remove from queue"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

async function uploadOne(
  item: QueueItem,
  albumSlug: string,
  onPhotoUploaded: (photo: Photo) => void,
  updateItem: (id: string, patch: Partial<QueueItem>) => void,
) {
  // 1. Get a signature for this album's folder
  const sigRes = await fetch("/api/admin/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ albumSlug }),
  });
  if (!sigRes.ok) throw new Error("Could not sign upload");
  const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

  // 2. Upload to Cloudinary directly using XHR for progress tracking
  const fd = new FormData();
  fd.append("file", item.file);
  fd.append("api_key", apiKey);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("folder", folder);

  const cloudinaryResp = await new Promise<{ public_id: string; width: number; height: number }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          updateItem(item.id, { progress: e.loaded / e.total });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error("Bad Cloudinary response"));
          }
        } else {
          let msg = `Upload failed (${xhr.status})`;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed?.error?.message) msg = parsed.error.message;
          } catch {}
          reject(new Error(msg));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(fd);
    },
  );

  // 3. Register the photo in our DB
  const regRes = await fetch(`/api/admin/albums/${albumSlug}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cloudinary_public_id: cloudinaryResp.public_id,
      width: cloudinaryResp.width,
      height: cloudinaryResp.height,
    }),
  });
  if (!regRes.ok) {
    const { error } = await regRes.json().catch(() => ({}));
    throw new Error(error || "Could not register photo");
  }

  const photo: Photo = await regRes.json();
  updateItem(item.id, { status: "done", progress: 1 });
  onPhotoUploaded(photo);
}
