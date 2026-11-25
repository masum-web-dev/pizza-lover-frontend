"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
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

interface VendorSessionUser {
  id?: string;
  subscriptionPlan?: string | null;
}

interface MenuItem {
  _id?: string;
  id?: string;
  itemName?: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  location?: string;
  images?: string[];
  image?: string;
  status?: string;
  isActive?: boolean;
}

const CATEGORIES = [
  "Classic Pizzas",
  "Specialty Pizzas",
  "Wood-Fired",
  "Sides & Starters",
  "Drinks & Desserts",
];

export default function MyMenuItemsPage() {
  const { data: session } = useSession();
  const user = session?.user as VendorSessionUser | undefined;
  const vendorId = user?.id;

  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    category: "Classic Pizzas",
    price: "",
    location: "",
    description: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const fetchMyItems = useCallback(async () => {
    if (!vendorId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `${backendUrl}/api/vendor/menu-items?vendorId=${encodeURIComponent(
          vendorId
        )}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || data.menuItems || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, backendUrl]);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  const getItemId = (item: MenuItem) => String(item._id || item.id || "");
  const getItemTitle = (item: MenuItem) =>
    item.itemName || item.name || "Untitled Pizza";
  const getItemImage = (item: MenuItem) =>
    (Array.isArray(item.images) && item.images[0]) || item.image || "/Logo.jpg";

  const openEditModal = (item: MenuItem) => {
    setFeedback(null);
    setEditingItem(item);
    setEditForm({
      itemName: getItemTitle(item),
      category: item.category || "Classic Pizzas",
      price: String(item.price ?? ""),
      location: item.location || "",
      description: item.description || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !vendorId) return;

    const itemId = getItemId(editingItem);
    const numericPrice = Number(editForm.price);

    if (!editForm.itemName.trim() || editForm.itemName.trim().length < 2) {
      setFeedback({ type: "error", text: "Item name must be at least 2 characters." });
      return;
    }
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setFeedback({ type: "error", text: "Please enter a valid price greater than 0." });
      return;
    }
    if (!editForm.location.trim()) {
      setFeedback({ type: "error", text: "Location is required." });
      return;
    }
    if (editForm.description.trim().length < 10) {
      setFeedback({
        type: "error",
        text: "Description must be at least 10 characters.",
      });
      return;
    }

    try {
      setIsSavingEdit(true);
      setFeedback(null);

      const res = await fetch(
        `${backendUrl}/api/vendor/menu-items/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            vendorId,
            itemName: editForm.itemName.trim(),
            category: editForm.category,
            price: numericPrice,
            location: editForm.location.trim(),
            description: editForm.description.trim(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.message || "Failed to update menu item.",
        });
        return;
      }

      setItems((prev) =>
        prev.map((row) =>
          getItemId(row) === itemId
            ? {
                ...row,
                itemName: editForm.itemName.trim(),
                category: editForm.category,
                price: numericPrice,
                location: editForm.location.trim(),
                description: editForm.description.trim(),
              }
            : row
        )
      );
      setEditingItem(null);
      setFeedback({ type: "success", text: "Menu item updated successfully." });
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while updating menu item.",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActive = async (item: MenuItem) => {
    if (!vendorId) return;
    const itemId = getItemId(item);
    const currentActive = item.isActive === undefined ? true : Boolean(item.isActive);
    const nextActive = !currentActive;

    try {
      setBusyItemId(itemId);
      setFeedback(null);

      const res = await fetch(
        `${backendUrl}/api/vendor/menu-items/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            vendorId,
            isActive: nextActive,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.message || "Failed to update availability.",
        });
        return;
      }

      setItems((prev) =>
        prev.map((row) =>
          getItemId(row) === itemId ? { ...row, isActive: nextActive } : row
        )
      );
      setFeedback({
        type: "success",
        text: nextActive
          ? "Menu item marked as Active."
          : "Menu item marked as Inactive.",
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while toggling availability.",
      });
    } finally {
      setBusyItemId(null);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!vendorId) return;
    const itemId = getItemId(item);

    try {
      setBusyItemId(itemId);
      setFeedback(null);

      const res = await fetch(
        `${backendUrl}/api/vendor/menu-items/${encodeURIComponent(
          itemId
        )}?vendorId=${encodeURIComponent(vendorId)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.message || "Failed to delete menu item.",
        });
        return;
      }

      setItems((prev) => prev.filter((row) => getItemId(row) !== itemId));
      setFeedback({ type: "success", text: "Menu item deleted." });
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while deleting menu item.",
      });
    } finally {
      setBusyItemId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const status = String(item.status || "pending").toLowerCase();
    if (statusFilter !== "all" && status !== statusFilter) {
      return false;
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const title = getItemTitle(item).toLowerCase();
    const category = String(item.category || "").toLowerCase();
    const location = String(item.location || "").toLowerCase();
    return title.includes(q) || category.includes(q) || location.includes(q);
  });

  const renderStatusBadge = (statusRaw?: string) => {
    const status = String(statusRaw || "pending").toLowerCase();
    if (status === "approved") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-bold capitalize">
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 font-bold capitalize">
          Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 border-0 font-bold capitalize">
        Pending
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-5 md:p-6 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
            My Menu Items
          </h2>
          <p className="text-sm text-gray-600">
            Track admin approval status, edit item details, toggle availability,
            or remove items.
          </p>
        </div>

        <Link href="/dashboard/vendor/add-menu-item">
          <Button className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold px-5 gap-2 cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Add Menu Item
          </Button>
        </Link>
      </div>

      {/* Feedback Banner */}
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

      {/* Search & Status Filter */}
      <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item name, category, or location..."
              className="pl-9 rounded-full border-orange-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["all", "pending", "approved", "rejected"].map((tab) => (
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

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-lg font-extrabold text-gray-900">
              No Menu Items Found
            </CardTitle>
            <CardDescription>
              {items.length === 0
                ? "You haven't added any menu items yet. Click 'Add Menu Item' to publish your first pizza."
                : "No items match your current search or status filter."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const itemId = getItemId(item);
            const isActive =
              item.isActive === undefined ? true : Boolean(item.isActive);
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
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {renderStatusBadge(item.status)}
                      <Badge
                        className={`border-0 font-bold ${
                          isActive
                            ? "bg-white/95 text-emerald-700"
                            : "bg-gray-800/85 text-gray-200"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
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
                      {item.category || "Pizza"} • {item.location || "Dhaka"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                    {status === "rejected" && (
                      <p className="mt-2 text-xs font-semibold text-red-600">
                        Rejected items are hidden from customers.
                      </p>
                    )}
                  </CardContent>
                </div>

                <CardContent className="pt-3 border-t border-orange-100 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => handleToggleActive(item)}
                    className={`rounded-full font-bold text-xs gap-1.5 cursor-pointer ${
                      isActive
                        ? "border-amber-200 text-amber-800 hover:bg-amber-50"
                        : "border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        Set Inactive
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Set Active
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => openEditModal(item)}
                      className="rounded-full border-orange-200 text-gray-800 hover:bg-orange-50 font-bold text-xs gap-1 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => handleDeleteItem(item)}
                      className="rounded-full border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs gap-1 cursor-pointer"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-orange-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">
                Edit Menu Item
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Item Name
                </label>
                <Input
                  value={editForm.itemName}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, itemName: e.target.value }))
                  }
                  className="rounded-xl border-orange-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full h-10 rounded-xl border border-orange-200 bg-white px-3 text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Price (USD)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="rounded-xl border-orange-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Location
                </label>
                <Input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="rounded-xl border-orange-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-orange-200 p-3 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="rounded-full font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold gap-2 cursor-pointer"
                >
                  {isSavingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}