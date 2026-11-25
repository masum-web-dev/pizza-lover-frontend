"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  ShoppingBag,
  MapPin,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminOrderItem {
  _id?: string;
  id?: string;
  itemName?: string;
  itemImage?: string;
  price?: number;
  vendorName?: string;
  customerName?: string;
  customerEmail?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  status?: string;
  createdAt?: string;
}

interface AdminOrderStats {
  totalOrders: number;
  acceptedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function AdminOrdersRevenuePage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [stats, setStats] = useState<AdminOrderStats>({
    totalOrders: 0,
    acceptedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const fetchAdminOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${backendUrl}/api/admin/orders?status=${encodeURIComponent(
          statusFilter
        )}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        setOrders([]);
        return;
      }

      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, statusFilter]);

  useEffect(() => {
    fetchAdminOrders();
  }, [fetchAdminOrders]);

  const getOrderId = (order: AdminOrderItem) =>
    String(order._id || order.id || "");

  const renderStatusBadge = (statusRaw?: string) => {
    const st = String(statusRaw || "pending").toLowerCase();
    if (st === "accepted") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-bold capitalize gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Accepted
        </Badge>
      );
    }
    if (st === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 font-bold capitalize gap-1">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </Badge>
      );
    }
    if (st === "cancelled") {
      return (
        <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200 border-0 font-bold capitalize gap-1">
          <XCircle className="h-3.5 w-3.5" />
          Cancelled
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
          Orders & Revenue
        </h2>
        <p className="text-sm text-gray-600">
          Monitor all platform orders, vendor fulfillment statuses, and
          accepted order revenue.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">
                Total Revenue
              </p>
              <p className="text-2xl font-extrabold text-[#B91C1C] mt-1">
                ${Number(stats.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-red-50 flex items-center justify-center text-[#B91C1C]">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">
                Total Orders
              </p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {stats.totalOrders}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">
                Accepted Orders
              </p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {stats.acceptedOrders}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">
                Pending Orders
              </p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "pending", "accepted", "rejected", "cancelled"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
              statusFilter === tab
                ? "bg-[#B91C1C] text-white"
                : "bg-white border border-orange-200 text-gray-700 hover:bg-orange-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="text-center py-12">
            <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <CardTitle className="text-lg font-extrabold text-gray-900">
              No Orders Found
            </CardTitle>
            <CardDescription>
              There are no platform orders matching this filter.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card
              key={getOrderId(order)}
              className="rounded-2xl border-orange-200/80 bg-white shadow-sm"
            >
              <CardContent className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={order.itemImage || "/Logo.jpg"}
                    alt={order.itemName || "Pizza"}
                    className="h-16 w-16 rounded-xl object-cover border border-orange-100 shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-gray-900">
                        {order.itemName || "Pizza Order"}
                      </h3>
                      <span className="text-sm font-extrabold text-[#B91C1C]">
                        ${Number(order.price || 0).toFixed(2)}
                      </span>
                      {renderStatusBadge(order.status)}
                    </div>

                    <p className="text-xs font-semibold text-gray-600">
                      Customer: {order.customerName || "Customer"} • Vendor:{" "}
                      {order.vendorName || "Vendor"}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      {order.deliveryDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-[#B91C1C]" />
                          {order.deliveryDate}
                        </span>
                      )}
                      {order.deliveryAddress && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#B91C1C]" />
                          {order.deliveryAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}