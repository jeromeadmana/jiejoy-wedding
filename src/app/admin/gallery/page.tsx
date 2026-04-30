"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Image as ImageIcon, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { AlbumWithCounts } from "@/lib/types/gallery";

export default function AdminGalleryPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState<AlbumWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const fetchAlbums = useCallback(async () => {
    const res = await fetch("/api/admin/albums");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    setAlbums(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/admin/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });

    if (res.ok) {
      setNewTitle("");
      setCreating(false);
      fetchAlbums();
    } else {
      const { error } = await res.json();
      alert(error ?? "Failed to create album");
    }
  };

  const togglePublished = async (album: AlbumWithCounts) => {
    await fetch(`/api/admin/albums/${album.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !album.is_published }),
    });
    fetchAlbums();
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--color-cream, #FDF8F8)" }}
      >
        <p style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>Loading albums...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream, #FDF8F8)" }}>
      <header className="shadow-sm" style={{ backgroundColor: "var(--color-surface, #FFFFFF)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="cursor-pointer transition-colors"
              style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <h1
              className="font-serif text-2xl font-bold"
              style={{ color: "var(--color-charcoal, #2C2C2C)" }}
            >
              Gallery
            </h1>
          </div>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} className="mr-1" />
            New Album
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {creating && (
          <Card className="mb-6">
            <form onSubmit={handleCreate} className="flex items-end gap-3">
              <div className="flex-1">
                <label
                  htmlFor="new-album-title"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: "var(--color-charcoal, #2C2C2C)" }}
                >
                  Album title
                </label>
                <input
                  id="new-album-title"
                  type="text"
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The Honeymoon"
                  className="w-full rounded-lg px-4 py-3 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-surface, #FFFFFF)",
                    color: "var(--color-charcoal, #2C2C2C)",
                    border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)",
                  }}
                />
              </div>
              <Button type="submit">Create</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCreating(false);
                  setNewTitle("");
                }}
              >
                Cancel
              </Button>
            </form>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Card key={album.id} className="flex flex-col gap-3">
              <Link
                href={`/admin/gallery/${album.slug}`}
                className="block aspect-[4/3] overflow-hidden rounded-lg"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 10%, transparent)",
                }}
              >
                {album.cover_public_id ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cloudinaryUrl(album.cover_public_id, "card")}
                    alt={album.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon size={48} style={{ color: "var(--color-warm-gray, #6B6B6B)" }} />
                  </div>
                )}
              </Link>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/gallery/${album.slug}`}
                    className="font-serif text-lg font-bold hover:underline"
                    style={{ color: "var(--color-charcoal, #2C2C2C)" }}
                  >
                    {album.title}
                  </Link>
                  <p className="text-sm" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
                    {album.photo_count} {album.photo_count === 1 ? "photo" : "photos"}
                  </p>
                </div>
                <Badge variant={album.is_published ? "success" : "danger"}>
                  {album.is_published ? "Published" : "Draft"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => togglePublished(album)}
                >
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
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                    style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                    aria-label="View public album"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>

        {albums.length === 0 && (
          <Card className="text-center">
            <p style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
              No albums yet. Click <strong>New Album</strong> to create one.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
