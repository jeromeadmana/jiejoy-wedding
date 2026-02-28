"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  Plus,
  Upload,
  Download,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  QrCode,
  Copy,
  Check,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RSVP_SITE_URL } from "@/lib/constants";
import type { Invitation } from "@/types/rsvp";

interface Toast {
  id: number;
  type: "success" | "error" | "warning";
  message: string;
}

let toastId = 0;

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Single creation form
  const [guestName, setGuestName] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);

  // Bulk creation
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkCreating, setBulkCreating] = useState(false);

  // QR modal
  const [qrInvitation, setQrInvitation] = useState<Invitation | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch("/api/invitation");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      setInvitations(await res.json());
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleCreate = async () => {
    if (!guestName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_name: guestName.trim(), max_guests: maxGuests }),
      });

      if (res.ok) {
        setGuestName("");
        setMaxGuests(1);
        addToast("success", `Invitation created for "${guestName.trim()}"`);
        fetchInvitations();
      } else {
        const body = await res.json();
        addToast("error", body.error || "Failed to create invitation");
      }
    } catch (error) {
      console.error("Failed to create invitation:", error);
      addToast("error", "Failed to create invitation");
    } finally {
      setCreating(false);
    }
  };

  const handleBulkCreate = async () => {
    const lines = bulkText.trim().split("\n").filter(Boolean);
    const entries = lines.map((line) => {
      const parts = line.split(",").map((s) => s.trim());
      return {
        guest_name: parts[0],
        max_guests: parseInt(parts[1], 10) || 1,
      };
    }).filter((e) => e.guest_name);

    if (entries.length === 0) return;

    setBulkCreating(true);
    try {
      const res = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });

      const body = await res.json();

      if (res.ok) {
        const created = body.created || [];
        const skipped = body.skipped || [];

        if (created.length > 0) {
          addToast("success", `${created.length} invitation${created.length > 1 ? "s" : ""} created successfully`);
        }

        if (skipped.length > 0) {
          const skippedNames = skipped.map((s: { guest_name: string; reason: string }) =>
            `${s.guest_name}: ${s.reason}`
          ).join("\n");
          addToast("warning", `${skipped.length} skipped:\n${skippedNames}`);
        }

        if (created.length > 0) {
          setBulkText("");
          setShowBulk(false);
          fetchInvitations();
        }
      } else {
        addToast("error", body.error || "Failed to import invitations");
      }
    } catch (error) {
      console.error("Failed to bulk create:", error);
      addToast("error", "Failed to import invitations");
    } finally {
      setBulkCreating(false);
    }
  };

  const buildQrCard = async (inv: Invitation, size: "preview" | "download"): Promise<string> => {
    const scale = size === "download" ? 2 : 1;
    const W = 400 * scale;
    const qrSize = 220 * scale;
    const pad = 32 * scale;

    // Generate QR to a temp canvas first
    const qrCanvas = document.createElement("canvas");
    const url = `${RSVP_SITE_URL}/rsvp/${inv.code}`;
    await QRCode.toCanvas(qrCanvas, url, {
      width: qrSize,
      margin: 2,
      color: { dark: "#2C2C2C", light: "#FFFFFF" },
    });

    const kasama = inv.max_guests - 1;
    const nameSize = 22 * scale;
    const kasamaSize = 14 * scale;
    const labelSize = 10 * scale;
    const headerSize = 28 * scale;
    const dateSize = 12 * scale;
    const headerH = 100 * scale;
    const infoH = 60 * scale;
    const footerH = 36 * scale;
    const H = headerH + pad + qrSize + infoH + footerH;

    const canvas = canvasRef.current;
    if (!canvas) return "";
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect(0, 0, W, H, 12 * scale);
    ctx.fill();

    // Gold top accent
    const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
    goldGrad.addColorStop(0, "transparent");
    goldGrad.addColorStop(0.5, "#C9A96E");
    goldGrad.addColorStop(1, "transparent");
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, W, 3 * scale);

    // Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#C9A96E";
    ctx.font = `${labelSize}px sans-serif`;
    ctx.letterSpacing = `${3 * scale}px`;
    ctx.fillText("THE WEDDING OF", W / 2, 30 * scale);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = "#2C2C2C";
    ctx.font = `600 ${headerSize}px Georgia, serif`;
    ctx.fillText("Jie & Joy", W / 2, 62 * scale);

    // Gold divider with heart
    const divY = 76 * scale;
    ctx.fillStyle = "#C9A96E";
    ctx.fillRect(W / 2 - 60 * scale, divY, 40 * scale, 1 * scale);
    ctx.fillRect(W / 2 + 20 * scale, divY, 40 * scale, 1 * scale);
    ctx.font = `${12 * scale}px Georgia, serif`;
    ctx.fillText("\u2665", W / 2, divY + 4 * scale);

    ctx.fillStyle = "#6B6B6B";
    ctx.font = `${dateSize}px sans-serif`;
    ctx.fillText("September 26, 2026", W / 2, 94 * scale);

    // Pink divider
    const pinkGrad = ctx.createLinearGradient(0, 0, W, 0);
    pinkGrad.addColorStop(0, "#FDF0F4");
    pinkGrad.addColorStop(0.5, "#D4849A");
    pinkGrad.addColorStop(1, "#FDF0F4");
    ctx.fillStyle = pinkGrad;
    ctx.fillRect(0, headerH, W, 2 * scale);

    // QR code centered
    const qrX = (W - qrSize) / 2;
    const qrY = headerH + pad;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // Guest name below QR
    const infoY = qrY + qrSize + 20 * scale;
    ctx.fillStyle = "#2C2C2C";
    ctx.font = `600 ${nameSize}px Georgia, serif`;
    ctx.fillText(inv.guest_name, W / 2, infoY);

    // Kasama count
    if (kasama > 0) {
      ctx.fillStyle = "#C06E84";
      ctx.font = `${kasamaSize}px sans-serif`;
      ctx.fillText(`+ ${kasama} kasama`, W / 2, infoY + 22 * scale);
    }

    // Footer - hashtag
    ctx.fillStyle = "#C9A96E";
    ctx.font = `${labelSize}px sans-serif`;
    ctx.letterSpacing = `${2 * scale}px`;
    ctx.fillText("#JieAndJoyForever", W / 2, H - 12 * scale);
    ctx.letterSpacing = "0px";

    // Gold bottom accent
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, H - 3 * scale, W, 3 * scale);

    return canvas.toDataURL("image/png");
  };

  const showQr = async (inv: Invitation) => {
    setQrInvitation(inv);
    const dataUrl = await buildQrCard(inv, "preview");
    setQrDataUrl(dataUrl);
  };

  const downloadQr = async (inv: Invitation) => {
    const dataUrl = await buildQrCard(inv, "download");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${inv.guest_name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const handleDelete = async (inv: Invitation) => {
    if (!confirm(`Delete invitation for "${inv.guest_name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch("/api/invitation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inv.id }),
      });

      if (res.ok) {
        addToast("success", `Invitation for "${inv.guest_name}" deleted`);
        fetchInvitations();
      } else {
        const body = await res.json();
        addToast("error", body.error || "Failed to delete invitation");
      }
    } catch (error) {
      console.error("Failed to delete invitation:", error);
      addToast("error", "Failed to delete invitation");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const respondedCount = invitations.filter((i) => i.responded).length;
  const pendingCount = invitations.filter((i) => !i.responded).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--color-cream, #FDF8F8)" }}>
        <p style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>Loading invitations...</p>
      </div>
    );
  }

  const toastStyles: Record<Toast["type"], { bg: string; border: string; icon: string }> = {
    success: {
      bg: "color-mix(in srgb, var(--color-sage, #D4849A) 10%, var(--color-surface, #FFFFFF))",
      border: "var(--color-sage-dark, #C06E84)",
      icon: "var(--color-sage-dark, #C06E84)",
    },
    error: {
      bg: "color-mix(in srgb, var(--color-dusty-rose, #C86464) 10%, var(--color-surface, #FFFFFF))",
      border: "var(--color-dusty-rose, #C86464)",
      icon: "var(--color-dusty-rose, #C86464)",
    },
    warning: {
      bg: "color-mix(in srgb, var(--color-gold, #C9A96E) 10%, var(--color-surface, #FFFFFF))",
      border: "var(--color-gold, #C9A96E)",
      icon: "var(--color-gold, #C9A96E)",
    },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream, #FDF8F8)" }}>
      {/* Hidden canvas for QR download */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          return (
            <div
              key={toast.id}
              className="flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg text-sm animate-in"
              style={{
                backgroundColor: style.bg,
                borderLeft: `3px solid ${style.border}`,
              }}
            >
              {toast.type === "success" && <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: style.icon }} />}
              {toast.type === "error" && <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: style.icon }} />}
              {toast.type === "warning" && <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: style.icon }} />}
              <p className="flex-1 whitespace-pre-line" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 cursor-pointer"
                style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: "var(--color-surface, #FFFFFF)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="transition-colors cursor-pointer"
              style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
              Invitations
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
            <span className="flex items-center gap-1">
              <CheckCircle size={14} style={{ color: "var(--color-sage-dark, #C06E84)" }} />
              {respondedCount} responded
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {pendingCount} pending
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Create invitation */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
            Create Invitation
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
                Guest Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--color-surface, #FFFFFF)",
                  color: "var(--color-charcoal, #2C2C2C)",
                  border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)",
                }}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
                Max Guests
              </label>
              <select
                value={maxGuests}
                onChange={(e) => setMaxGuests(parseInt(e.target.value, 10))}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--color-surface, #FFFFFF)",
                  color: "var(--color-charcoal, #2C2C2C)",
                  border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)",
                }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleCreate} disabled={creating || !guestName.trim()}>
              {creating ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Plus size={16} className="mr-1" />}
              Create
            </Button>
          </div>

          {/* Bulk toggle */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowBulk(!showBulk)}
              className="text-sm font-semibold cursor-pointer"
              style={{ color: "var(--color-sage-dark, #C06E84)" }}
            >
              <Upload size={14} className="inline mr-1" />
              {showBulk ? "Hide bulk import" : "Bulk import"}
            </button>

            {showBulk && (
              <div className="mt-3 space-y-3">
                <p className="text-sm" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
                  One per line: <code>Name, max_guests</code> (max guests must be 1-10)
                </p>
                <textarea
                  rows={5}
                  placeholder={"Jane Doe, 3\nJohn Smith, 2\nThe Garcia Family, 5"}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none resize-none font-mono"
                  style={{
                    backgroundColor: "var(--color-surface, #FFFFFF)",
                    color: "var(--color-charcoal, #2C2C2C)",
                    border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)",
                  }}
                />
                <Button onClick={handleBulkCreate} disabled={bulkCreating || !bulkText.trim()}>
                  {bulkCreating ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Upload size={16} className="mr-1" />}
                  Import All
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Invitations list */}
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 10%, transparent)" }}>
                <th className="pb-3 font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>Guest</th>
                <th className="pb-3 font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>Code</th>
                <th className="pb-3 font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>Max Guests</th>
                <th className="pb-3 font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>Status</th>
                <th className="pb-3 font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>Created</th>
                <th className="pb-3 font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 5%, transparent)" }}>
                  <td className="py-3 font-medium" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>{inv.guest_name}</td>
                  <td className="py-3">
                    <code className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 10%, transparent)", color: "var(--color-charcoal, #2C2C2C)" }}>
                      {inv.code}
                    </code>
                  </td>
                  <td className="py-3" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>{inv.max_guests}</td>
                  <td className="py-3">
                    <Badge variant={inv.responded ? "success" : "neutral"}>
                      {inv.responded ? "Responded" : "Pending"}
                    </Badge>
                  </td>
                  <td className="py-3" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showQr(inv)}
                        className="transition-colors cursor-pointer"
                        style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                        aria-label="Show QR code"
                        title="Show QR"
                      >
                        <QrCode size={16} />
                      </button>
                      <button
                        onClick={() => copyCode(inv.code)}
                        className="transition-colors cursor-pointer"
                        style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                        aria-label="Copy invitation code"
                        title="Copy code"
                      >
                        {copiedCode === inv.code ? <Check size={16} style={{ color: "var(--color-sage-dark, #C06E84)" }} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => downloadQr(inv)}
                        className="transition-colors cursor-pointer"
                        style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                        aria-label="Download QR code"
                        title="Download QR"
                      >
                        <Download size={16} />
                      </button>
                      {!inv.responded && (
                        <button
                          onClick={() => handleDelete(inv)}
                          className="transition-colors cursor-pointer"
                          style={{ color: "var(--color-dusty-rose, #C86464)" }}
                          aria-label="Delete invitation"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {invitations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
                    No invitations created yet. Create your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* QR Modal */}
      {qrInvitation && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setQrInvitation(null)}>
          <div
            className="rounded-2xl p-6 max-w-md w-full mx-4 text-center"
            style={{ backgroundColor: "var(--color-surface, #FFFFFF)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={qrDataUrl} alt="QR Invitation Card" className="mx-auto rounded-lg shadow-md" />
            <p className="mt-3 text-xs break-all" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
              {RSVP_SITE_URL}/rsvp/{qrInvitation.code}
            </p>
            <div className="flex gap-3 mt-5 justify-center">
              <Button size="sm" onClick={() => downloadQr(qrInvitation)}>
                <Download size={14} className="mr-1" />
                Download
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setQrInvitation(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
