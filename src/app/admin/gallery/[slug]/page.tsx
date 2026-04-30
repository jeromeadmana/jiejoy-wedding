"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import type { Album, Photo } from "@/lib/types/gallery";

type AlbumWithPhotos = Album & { photos: Photo[] };

export default function AdminAlbumEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [album, setAlbum] = useState<AlbumWithPhotos | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMeta, setEditingMeta] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchAlbum = useCallback(async () => {
    const res = await fetch(`/api/admin/albums/${slug}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (res.status === 404) {
      router.push("/admin/gallery");
      return;
    }
    const data: AlbumWithPhotos = await res.json();
    setAlbum(data);
    setTitleDraft(data.title);
    setDescDraft(data.description ?? "");
    setLoading(false);
  }, [slug, router]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  const handlePhotoUploaded = (photo: Photo) => {
    setAlbum((prev) => (prev ? { ...prev, photos: [...prev.photos, photo] } : prev));
  };

  const handleSaveMeta = async () => {
    if (!album) return;
    const res = await fetch(`/api/admin/albums/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleDraft.trim() || album.title,
        description: descDraft.trim() || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setAlbum({ ...album, ...updated });
      setEditingMeta(false);
    }
  };

  const handleTogglePublished = async () => {
    if (!album) return;
    const res = await fetch(`/api/admin/albums/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !album.is_published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setAlbum({ ...album, ...updated });
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;
    if (!confirm(`Delete "${album.title}" and all ${album.photos.length} photos? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/albums/${slug}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/gallery");
  };

  const handleSetCover = async (photo: Photo) => {
    if (!album) return;
    const res = await fetch(`/api/admin/albums/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cover_public_id: photo.cloudinary_public_id }),
    });
    if (res.ok) {
      const updated = await res.json();
      setAlbum({ ...album, ...updated });
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!album) return;
    if (!confirm("Delete this photo?")) return;
    const res = await fetch(`/api/admin/albums/${slug}/photos/${photo.id}`, { method: "DELETE" });
    if (res.ok) {
      setAlbum({
        ...album,
        photos: album.photos.filter((p) => p.id !== photo.id),
        cover_public_id:
          album.cover_public_id === photo.cloudinary_public_id ? null : album.cover_public_id,
      });
    }
  };

  const handleSaveCaption = async (photoId: string, caption: string) => {
    if (!album) return;
    const res = await fetch(`/api/admin/albums/${slug}/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: caption.trim() || null }),
    });
    if (res.ok) {
      const updated: Photo = await res.json();
      setAlbum({
        ...album,
        photos: album.photos.map((p) => (p.id === photoId ? updated : p)),
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!album) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = album.photos.findIndex((p) => p.id === active.id);
    const newIndex = album.photos.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(album.photos, oldIndex, newIndex).map((p, i) => ({
      ...p,
      sort_order: (i + 1) * 10,
    }));
    setAlbum({ ...album, photos: reordered });

    await fetch(`/api/admin/albums/${slug}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reordered.map((p) => ({ id: p.id, sort_order: p.sort_order })),
      }),
    });
  };

  if (loading || !album) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--color-cream, #FDF8F8)" }}
      >
        <p style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>Loading album...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream, #FDF8F8)" }}>
      <header className="shadow-sm" style={{ backgroundColor: "var(--color-surface, #FFFFFF)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.push("/admin/gallery")}
              className="cursor-pointer transition-colors"
              style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
              aria-label="Back to gallery list"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              {editingMeta ? (
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  className="font-serif text-2xl font-bold focus:outline-none"
                  style={{
                    color: "var(--color-charcoal, #2C2C2C)",
                    backgroundColor: "transparent",
                    borderBottom: "1px solid var(--color-sage, #D4849A)",
                  }}
                />
              ) : (
                <h1
                  className="truncate font-serif text-2xl font-bold"
                  style={{ color: "var(--color-charcoal, #2C2C2C)" }}
                >
                  {album.title}
                </h1>
              )}
              <p className="text-xs" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
                /gallery/{album.slug}
              </p>
            </div>
            <Badge variant={album.is_published ? "success" : "danger"}>
              {album.is_published ? "Published" : "Draft"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {editingMeta ? (
              <>
                <Button size="sm" onClick={handleSaveMeta}>
                  <Check size={14} className="mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingMeta(false);
                    setTitleDraft(album.title);
                    setDescDraft(album.description ?? "");
                  }}
                >
                  <X size={14} />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="secondary" onClick={() => setEditingMeta(true)}>
                  <Pencil size={14} className="mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="secondary" onClick={handleTogglePublished}>
                  {album.is_published ? (
                    <>
                      <EyeOff size={14} className="mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye size={14} className="mr-1" />
                      Publish
                    </>
                  )}
                </Button>
                {album.is_published && (
                  <a
                    href={`/gallery/${album.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-md transition-colors"
                    style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                    aria-label="View public album"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {(album.description || editingMeta) && (
          <Card className="mb-6">
            {editingMeta ? (
              <textarea
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                placeholder="Album description (shown on the public page)…"
                rows={2}
                className="w-full resize-none focus:outline-none"
                style={{
                  color: "var(--color-charcoal, #2C2C2C)",
                  backgroundColor: "transparent",
                }}
              />
            ) : (
              <p style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>{album.description}</p>
            )}
          </Card>
        )}

        <Card className="mb-6">
          <PhotoUploader albumSlug={slug} onPhotoUploaded={handlePhotoUploaded} />
        </Card>

        {album.photos.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={album.photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {album.photos.map((photo) => (
                  <SortablePhoto
                    key={photo.id}
                    photo={photo}
                    isCover={album.cover_public_id === photo.cloudinary_public_id}
                    onSetCover={handleSetCover}
                    onDelete={handleDeletePhoto}
                    onSaveCaption={handleSaveCaption}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <Card className="text-center">
            <p style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
              No photos yet. Drop some above to get started.
            </p>
          </Card>
        )}

        <div className="mt-12 flex justify-end">
          <Button variant="secondary" onClick={handleDeleteAlbum}>
            <Trash2 size={14} className="mr-1" />
            Delete album
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortablePhoto({
  photo,
  isCover,
  onSetCover,
  onDelete,
  onSaveCaption,
}: {
  photo: Photo;
  isCover: boolean;
  onSetCover: (p: Photo) => void;
  onDelete: (p: Photo) => void;
  onSaveCaption: (id: string, caption: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });

  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(photo.caption ?? "");

  useEffect(() => {
    setCaptionDraft(photo.caption ?? "");
  }, [photo.caption]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-xl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cloudinaryUrl(photo.cloudinary_public_id, "thumb")}
        alt={photo.caption ?? ""}
        className="aspect-square w-full object-cover"
      />

      {/* Drag handle (top-left) */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      {/* Cover indicator (top-right) */}
      {isCover && (
        <div
          className="absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold"
          style={{
            backgroundColor: "var(--color-gold, #C9A96E)",
            color: "white",
          }}
        >
          <Star size={12} fill="currentColor" />
          Cover
        </div>
      )}

      {/* Bottom action bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 pb-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
        {!isCover && (
          <button
            onClick={() => onSetCover(photo)}
            className="flex h-7 items-center gap-1 rounded-md bg-white/90 px-2 text-xs font-semibold text-black hover:bg-white cursor-pointer"
            aria-label="Set as cover"
          >
            <Star size={12} />
            Cover
          </button>
        )}
        <button
          onClick={() => setEditingCaption(true)}
          className="flex h-7 items-center gap-1 rounded-md bg-white/90 px-2 text-xs font-semibold text-black hover:bg-white cursor-pointer"
          aria-label="Edit caption"
        >
          <Pencil size={12} />
          {photo.caption ? "Edit" : "Caption"}
        </button>
        <button
          onClick={() => onDelete(photo)}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-black hover:bg-white cursor-pointer"
          aria-label="Delete photo"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {editingCaption && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/80 p-2">
          <input
            type="text"
            value={captionDraft}
            onChange={(e) => setCaptionDraft(e.target.value)}
            placeholder="Caption…"
            autoFocus
            className="min-w-0 flex-1 rounded bg-white/10 px-2 py-1 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/40"
          />
          <button
            onClick={() => {
              onSaveCaption(photo.id, captionDraft);
              setEditingCaption(false);
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-white/20 cursor-pointer"
            aria-label="Save caption"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setCaptionDraft(photo.caption ?? "");
              setEditingCaption(false);
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-white/20 cursor-pointer"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
