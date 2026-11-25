"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MenuItemSummary {
  _id?: string;
  id?: string;
  itemName?: string;
  name?: string;
  businessName?: string;
  vendorName?: string;
  price?: number;
  status?: string;
}

export default function AdminOverviewPage() {
  const [menuItems, setMenuItems] = useState<MenuItemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const loadOverviewData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${backendUrl}/api/admin/menu-items?status=all`, {
        credentials: "include",
      });

      if (!res.ok) {
        setMenuItems([]);
        return;
      }

      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : data.items || []);
    } catch {
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    loadOverviewData();
  }, [loadOverviewData]);

  const pendingCount = menuItems.filter(
    (item) => String(item.status || "pending").toLowerCase() === "pending"
  ).length;

  const approvedCount = menuItems.filter(
    (item) => String(item.status || "").toLowerCase() === "approved"
  ).length;

  const rejectedCount = menuItems.filter(
    (item) => String(item.status || "").toLowerCase() === "rejected"
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-5 md:p-6 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
            Admin Overview
          </h2>
          <p className="text-sm text-gray-600">
            Monitor pending menu approvals, live customer menu items, and
            platform activity.
          </p>
        </div>

        <Link href="/dashboard/admin/menu-items">
          <Button className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold px-5 gap-2 cursor-pointer">
            <ClipboardCheck className="h-4 w-4" />
            Review Pending ({pendingCount})
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="font-bold text-gray-600">
              Pending Approval
            </CardDescription>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-gray-900">
              {pendingCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Waiting for admin review
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="font-bold text-gray-600">
              Approved Menu Items
            </CardDescription>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-gray-900">
              {approvedCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Eligible on customer menu
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="font-bold text-gray-600">
              Rejected Items
            </CardDescription>
            <ShoppingBag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-gray-900">
              {rejectedCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Hidden from customers
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="font-bold text-gray-600">
              Total Menu Submissions
            </CardDescription>
            <ClipboardCheck className="h-4 w-4 text-[#B91C1C]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-gray-900">
              {menuItems.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">All vendor listings</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pending Queue Preview */}
      <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-extrabold text-gray-900">
              Pending Approval Queue
            </CardTitle>
            <CardDescription>
              Approve items so customers can see and order them.
            </CardDescription>
          </div>
          <Link
            href="/dashboard/admin/menu-items"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#B91C1C] hover:underline"
          >
            <span>Open Moderation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {pendingCount === 0 ? (
            <p className="text-sm text-gray-500 py-4">
              No pending menu items right now.
            </p>
          ) : (
            <div className="divide-y divide-orange-100">
              {menuItems
                .filter(
                  (item) =>
                    String(item.status || "pending").toLowerCase() === "pending"
                )
                .slice(0, 5)
                .map((item) => {
                  const id = String(item._id || item.id || "");
                  return (
                    <div
                      key={id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {item.itemName || item.name || "Untitled Pizza"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.businessName || item.vendorName || "Vendor"} • $
                          {Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <Link href="/dashboard/admin/menu-items">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-orange-200 text-xs font-bold cursor-pointer"
                        >
                          Review
                        </Button>
                      </Link>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}