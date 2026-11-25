"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Search,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminMenuItem {
  _id?: string;
  id?: string;
  itemName?: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  location?: string;
  vendorName?: string;
  businessName?: string;
  images?: string[];
  image?: string;
  status?: string;
  isActive?: boolean;
}

export default function AdminMenuApprovalsPage() {
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const fetchAdminItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${backendUrl}/api/admin/menu-items?status=${encodeURIComponent(
          statusFilter
        )}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        setItems([]);
        return;
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, statusFilter]);

  useEffect(() => {
    fetchAdminItems();
  }, [fetchAdminItems]);

  const getItemId = (item: AdminMenuItem) => String(item._id || item.id || "");
  const getItemTitle = (item: AdminMenuItem) =>
    item.itemName || item.name || "Untitled Pizza";
  const getItemImage = (item: AdminMenuItem) =>
    (Array.isArray(item.images) && item.images[0]) || item.image || "/Logo.jpg";

  const handleDecision = async (
    item: AdminMenuItem,
    nextStatus: "approved" | "rejected"
  ) => {
    const itemId = getItemId(item);

    try {
      setBusyItemId(itemId);
      setFeedback(null);

      const res = await fetch(
        `${backendUrl}/api/admin/menu-items/${encodeURIComponent(itemId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.message || `Failed to mark item as ${nextStatus}.`,
        });
        return;
      }

      setItems((prev) =>
        prev.map((row) =>
          getItemId(row) === itemId ? { ...row, status: nextStatus } : row
        )
      );
      setFeedback({
        type: "success",
        text: `"${getItemTitle(item)}" is now ${nextStatus}.`,
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while updating item status.",
      });
    } finally {
      setBusyItemId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const title = getItemTitle(item).toLowerCase();
    const vendor = String(
      item.businessName || item.vendorName || ""
    ).toLowerCase();
    const location = String(item.location || "").toLowerCase();

    return title.includes(q) || vendor.includes(q) || location.includes(q);
  });

  const renderStatusBadge = (statusRaw?: string) => {
    const status = String(statusRaw || "pending").toLowerCase();
    if (status === "approved") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-bold capitalize gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 font-bold capitalize gap-1">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 border-0 font-bold capitalize gap-1">
        <Clock className="h-3.5 w-3.5" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-200 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Admin Menu Item Moderation
        </h2>
        <p className="text-sm text-gray-600">
          Review vendor menu items. Approved & active items become visible to
          customers on the public menu.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search item, vendor, or location..."
              className="pl-9 rounded-full border-orange-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["pending", "approved", "rejected", "all"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
                  statusFilter === tab
                    ? "bg-[#B91C1C] text-white"
                    : "bg-orange-50 text-gray-700 hover:bg-orange-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-lg font-extrabold text-gray-900">
              No Items in {statusFilter.toUpperCase()}
            </CardTitle>
            <CardDescription>
              There are currently no menu items matching this filter.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const itemId = getItemId(item);
            const isBusy = busyItemId === itemId;
            const status = String(item.status || "pending").toLowerCase();

            return (
              <Card
                key={itemId}
                className="rounded-2xl border-orange-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-orange-50">
                    <img
                      src={getItemImage(item)}
                      alt={getItemTitle(item)}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      {renderStatusBadge(item.status)}
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-extrabold text-gray-900 line-clamp-1">
                        {getItemTitle(item)}
                      </CardTitle>
                      <span className="text-base font-extrabold text-[#B91C1C] shrink-0">
                        ${Number(item.price || 0).toFixed(2)}
                      </span>
                    </div>
                    <CardDescription className="text-xs font-semibold text-gray-500">
                      {item.businessName || item.vendorName || "Vendor"} •{" "}
                      {item.location || "Dhaka"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </CardContent>
                </div>

                <CardContent className="pt-3 border-t border-orange-100 flex items-center justify-end gap-2">
                  {status !== "approved" && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleDecision(item, "approved")}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 gap-1.5 cursor-pointer"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </Button>
                  )}

                  {status !== "rejected" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => handleDecision(item, "rejected")}
                      className="rounded-full border-red-200 text-red-700 hover:bg-red-50 font-bold px-4 gap-1.5 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}