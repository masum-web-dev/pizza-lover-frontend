"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  MapPin,
  Calendar,
  MessageSquare,
  AlertCircle,
  X,
  ShoppingBag,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VendorOrder {
  _id?: string;
  id?: string;
  itemName?: string;
  itemImage?: string;
  price?: number;
  customerName?: string;
  customerEmail?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  message?: string;
  status?: string;
  createdAt?: string;
}

export default function VendorCustomerOrdersPage() {
  const { data: session } = useSession();
  const vendorId = session?.user?.id;

  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const fetchVendorOrders = useCallback(async () => {
    if (!vendorId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `${backendUrl}/api/orders/vendor?vendorId=${encodeURIComponent(
          vendorId
        )}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        setOrders([]);
        return;
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, backendUrl]);

  useEffect(() => {
    fetchVendorOrders();
  }, [fetchVendorOrders]);

  const getOrderId = (order: VendorOrder) => String(order._id || order.id || "");

  const handleOrderDecision = async (
    order: VendorOrder,
    nextStatus: "accepted" | "rejected"
  ) => {
    if (!vendorId) return;
    const orderId = getOrderId(order);

    try {
      setBusyOrderId(orderId);
      setFeedback(null);

      const res = await fetch(
        `${backendUrl}/api/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            vendorId,
            status: nextStatus,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.message || `Failed to mark order as ${nextStatus}.`,
        });
        return;
      }

      setOrders((prev) =>
        prev.map((row) =>
          getOrderId(row) === orderId ? { ...row, status: nextStatus } : row
        )
      );
      setFeedback({
        type: "success",
        text: `Order ${nextStatus} successfully.`,
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while updating order status.",
      });
    } finally {
      setBusyOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const st = String(order.status || "pending").toLowerCase();
    if (statusFilter === "all") return true;
    return st === statusFilter;
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-200 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Customer Orders
        </h2>
        <p className="text-sm text-gray-600">
          Review incoming pizza orders, check delivery details, and accept or
          reject pending orders.
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

      {filteredOrders.length === 0 ? (
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="text-center py-12">
            <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <CardTitle className="text-lg font-extrabold text-gray-900">
              No Customer Orders Found
            </CardTitle>
            <CardDescription>
              There are no orders matching this filter yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderId = getOrderId(order);
            const st = String(order.status || "pending").toLowerCase();
            const isBusy = busyOrderId === orderId;

            return (
              <Card
                key={orderId}
                className="rounded-2xl border-orange-200/80 bg-white shadow-sm"
              >
                <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={order.itemImage || "/Logo.jpg"}
                      alt={order.itemName || "Pizza"}
                      className="h-20 w-20 rounded-xl object-cover border border-orange-100 shrink-0"
                    />

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-gray-900">
                          {order.itemName || "Pizza Order"}
                        </h3>
                        <span className="text-sm font-extrabold text-[#B91C1C]">
                          ${Number(order.price || 0).toFixed(2)}
                        </span>
                        {renderStatusBadge(order.status)}
                      </div>

                      <p className="text-xs font-semibold text-gray-700">
                        Customer: {order.customerName || "Customer"}
                        {order.customerEmail ? ` (${order.customerEmail})` : ""}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
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

                      {order.message && (
                        <p className="text-xs text-gray-600 flex items-start gap-1.5 pt-0.5">
                          <MessageSquare className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span>{order.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {st === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleOrderDecision(order, "accepted")}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 gap-1.5 cursor-pointer"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Accept
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => handleOrderDecision(order, "rejected")}
                        className="rounded-full border-red-200 text-red-700 hover:bg-red-50 font-bold px-4 gap-1.5 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
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