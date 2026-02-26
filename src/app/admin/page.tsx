"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  UserX,
  UsersRound,
  Search,
  Trash2,
  Download,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { RsvpWithGuests, RsvpStats } from "@/types/rsvp";

export default function AdminDashboard() {
  const router = useRouter();
  const [rsvps, setRsvps] = useState<RsvpWithGuests[]>([]);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "attending" | "not-attending">("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === "attending") params.set("attending", "true");
      if (filter === "not-attending") params.set("attending", "false");
      if (search) params.set("search", search);

      const [rsvpRes, statsRes] = await Promise.all([
        fetch(`/api/rsvp?${params}`),
        fetch("/api/admin/stats"),
      ]);

      if (rsvpRes.status === 401 || statsRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      setRsvps(await rsvpRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, search, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this RSVP?")) return;

    await fetch(`/api/rsvp/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Attending", "Guests", "Dietary Notes", "Message", "Date"];
    const rows = rsvps.map((r) => [
      r.name,
      r.email,
      r.attending ? "Yes" : "No",
      r.guest_count,
      r.dietary_notes || "",
      r.message || "",
      new Date(r.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvps.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-warm-gray">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="font-serif text-2xl font-bold text-charcoal">
            RSVP Dashboard
          </h1>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Stats cards */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/10">
                <Users size={24} className="text-sage" />
              </div>
              <div>
                <p className="text-sm text-warm-gray">Total RSVPs</p>
                <p className="text-2xl font-bold text-charcoal">{stats.totalRsvps}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/10">
                <UserCheck size={24} className="text-sage" />
              </div>
              <div>
                <p className="text-sm text-warm-gray">Attending</p>
                <p className="text-2xl font-bold text-sage">{stats.attending}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dusty-rose/10">
                <UserX size={24} className="text-dusty-rose" />
              </div>
              <div>
                <p className="text-sm text-warm-gray">Not Attending</p>
                <p className="text-2xl font-bold text-dusty-rose">{stats.notAttending}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                <UsersRound size={24} className="text-gold" />
              </div>
              <div>
                <p className="text-sm text-warm-gray">Total Guests</p>
                <p className="text-2xl font-bold text-charcoal">{stats.totalGuests}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Filters & actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-warm-gray/30 bg-white py-2 pl-9 pr-4 text-sm text-charcoal focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="rounded-lg border border-warm-gray/30 bg-white py-2 px-3 text-sm text-charcoal focus:border-sage focus:outline-none"
            >
              <option value="all">All</option>
              <option value="attending">Attending</option>
              <option value="not-attending">Not Attending</option>
            </select>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download size={16} className="mr-1" />
            Export CSV
          </Button>
        </div>

        {/* RSVP table */}
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-warm-gray/10">
                <th className="pb-3 font-semibold text-charcoal">Name</th>
                <th className="pb-3 font-semibold text-charcoal">Email</th>
                <th className="pb-3 font-semibold text-charcoal">Status</th>
                <th className="pb-3 font-semibold text-charcoal">Guests</th>
                <th className="pb-3 font-semibold text-charcoal">Date</th>
                <th className="pb-3 font-semibold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp) => (
                <tr key={rsvp.id} className="border-b border-warm-gray/5">
                  <td className="py-3 font-medium text-charcoal">{rsvp.name}</td>
                  <td className="py-3 text-warm-gray">{rsvp.email}</td>
                  <td className="py-3">
                    <Badge variant={rsvp.attending ? "success" : "danger"}>
                      {rsvp.attending ? "Attending" : "Declined"}
                    </Badge>
                  </td>
                  <td className="py-3 text-warm-gray">{rsvp.guest_count}</td>
                  <td className="py-3 text-warm-gray">
                    {new Date(rsvp.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(rsvp.id)}
                      className="text-warm-gray hover:text-dusty-rose-dark transition-colors cursor-pointer"
                      title="Delete RSVP"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {rsvps.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-warm-gray">
                    No RSVPs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
