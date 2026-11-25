"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Calendar,
  MapPin,
  Clock,
  Store,
  Eye,
  X,
  Loader2,
  Pizza,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderRecord {
  _id?: string;
  id?: string;
  itemId?: string;
  itemName?: string;
  pizzaName?: string;
  itemImage?: string;
  image?: string;
  vendorId?: string;
  vendorName?: string;
  businessName?: string;
  customerId?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  message?: string;
  price?: number;
  status?: "pending" | "accepted" | "rejected" | "cancelled" | string;
  createdAt?: string;
}

export default function CustomerMyOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const getOrderId = (order: OrderRecord) => order._id || order.id || "";

  const fetchMyOrders = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userId = (session.user as { id?: string }).id || "";
      const res = await fetch(
        `${backendUrl}/api/orders/customer${
          userId ? `?customerId=${encodeURIComponent(userId)}` : ""
        }`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        setOrders([]);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.orders || [];
      setOrders(list);
    } catch {
      setOrders([]);
      toast.error("Failed to load your orders.");
    } finally {
      setIsLoading(false);
    }
  }, [session, backendUrl]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const handleCancelOrder = async (order: OrderRecord) => {
    const orderId = getOrderId(order);
    const currentStatus = (order.status || "pending").toLowerCase();

    if (!orderId) {
      toast.error("Invalid order ID.");
      return;
    }

    if (currentStatus !== "pending") {
      toast.error(
        `Cannot cancel an order that is already ${currentStatus}.`
      );
      return;
    }

    try {
      setCancellingId(orderId);
      const userId = (session?.user as { id?: string })?.id || "";

      const res = await fetch(`${backendUrl}/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ customerId: userId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || "Could not cancel order.");
        return;
      }

      setOrders((prev) =>
        prev.map((item) =>
          getOrderId(item) === orderId ? { ...item, status: "cancelled" } : item
        )
      );

      if (selectedOrder && getOrderId(selectedOrder) === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "cancelled" });
      }

      toast.success("Order cancelled successfully.");
    } catch {
      toast.error("Network error while cancelling order.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "pending").toLowerCase();
    if (normalized === "accepted") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-semibold capitalize">
          Accepted
        </Badge>
      );
    }
    if (normalized === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 font-semibold capitalize">
          Rejected
        </Badge>
      );
    }
    if (normalized === "cancelled") {
      return (
        <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200 border-0 font-semibold capitalize">
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 font-semibold capitalize">
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
            My Orders
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            View your order history, inspect order details, and cancel pending
            orders.
          </p>
        </div>
        <Link href="/menu">
          <Button className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold cursor-pointer">
            Order More Pizza
          </Button>
        </Link>
      </div>

      {/* Orders Table Card */}
      <Card className="border-orange-200/80 bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#B91C1C]" />
            Order History ({orders.length})
          </CardTitle>
          <CardDescription>
            Only pending orders can be cancelled before restaurant confirmation.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2.5">
              <Loader2 className="h-7 w-7 animate-spin text-[#B91C1C]" />
              <p className="text-sm font-medium text-gray-600">
                Loading your orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-[#FFF8EE]/60 p-10 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#B91C1C]">
                <Pizza className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                You haven&apos;t placed any orders yet
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Browse our fresh pizzas and submit an order to see it listed
                here.
              </p>
              <Link href="/menu">
                <Button className="mt-2 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold cursor-pointer">
                  Explore Menu
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-orange-100 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-800">
                      Item
                    </TableHead>
                    <TableHead className="font-bold text-gray-800">
                      Vendor
                    </TableHead>
                    <TableHead className="font-bold text-gray-800">
                      Delivery Date
                    </TableHead>
                    <TableHead className="font-bold text-gray-800">
                      Delivery Address
                    </TableHead>
                    <TableHead className="font-bold text-gray-800">
                      Requested
                    </TableHead>
                    <TableHead className="font-bold text-gray-800">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-800">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => {
                    const orderId = getOrderId(order) || String(idx);
                    const statusLower = (order.status || "pending").toLowerCase();
                    const canCancel = statusLower === "pending";
                    const itemTitle =
                      order.itemName || order.pizzaName || "Pizza Item";
                    const imgSrc = order.itemImage || order.image || "";
                    const vendorLabel =
                      order.businessName ||
                      order.vendorName ||
                      (order.vendorId ? `Vendor #${order.vendorId.slice(-6)}` : "PizzaHub Vendor");

                    return (
                      <TableRow
                        key={orderId}
                        className="border-orange-100/80 hover:bg-[#FFF8EE]/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={itemTitle}
                                className="h-12 w-12 rounded-xl object-cover border border-orange-200 shrink-0"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-[#B91C1C] shrink-0">
                                <Pizza className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate max-w-[180px]">
                                {itemTitle}
                              </p>
                              {typeof order.price === "number" && (
                                <p className="text-xs font-semibold text-[#B91C1C]">
                                  ${order.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm font-medium text-gray-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Store className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {vendorLabel}
                          </span>
                        </TableCell>

                        <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#B91C1C] shrink-0" />
                            {formatDate(order.deliveryDate)}
                          </span>
                        </TableCell>

                        <TableCell className="text-sm text-gray-700 max-w-[200px]">
                          <span className="inline-flex items-start gap-1.5 line-clamp-2">
                            <MapPin className="h-3.5 w-3.5 text-[#B91C1C] shrink-0 mt-0.5" />
                            {order.deliveryAddress || "—"}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {formatDate(order.createdAt)}
                          </span>
                        </TableCell>

                        <TableCell>{getStatusBadge(order.status)}</TableCell>

                        <TableCell className="text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-full border-orange-200 text-gray-700 hover:bg-orange-50 hover:text-[#B91C1C] h-8 px-3 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Details
                            </Button>

                            {canCancel && (
                              <Button
                                type="button"
                                size="sm"
                                disabled={cancellingId === getOrderId(order)}
                                onClick={() => handleCancelOrder(order)}
                                className="rounded-full bg-red-600 hover:bg-red-700 text-white h-8 px-3 font-semibold cursor-pointer"
                              >
                                {cancellingId === getOrderId(order) ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Cancel"
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-orange-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-orange-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Order Details
                </h3>
                <p className="text-xs text-gray-500">
                  Order ID: {getOrderId(selectedOrder) || "N/A"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-orange-50 hover:text-gray-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {selectedOrder.itemImage || selectedOrder.image ? (
                <img
                  src={selectedOrder.itemImage || selectedOrder.image || ""}
                  alt={
                    selectedOrder.itemName ||
                    selectedOrder.pizzaName ||
                    "Pizza Item"
                  }
                  className="h-16 w-16 rounded-xl object-cover border border-orange-200 shrink-0"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-100 text-[#B91C1C] shrink-0">
                  <Pizza className="h-7 w-7" />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-base font-extrabold text-gray-900">
                  {selectedOrder.itemName ||
                    selectedOrder.pizzaName ||
                    "Pizza Item"}
                </p>
                {getStatusBadge(selectedOrder.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-[#FFF8EE]/70 p-4 border border-orange-100 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500">Vendor</p>
                <p className="font-bold text-gray-900 mt-0.5">
                  {selectedOrder.businessName ||
                    selectedOrder.vendorName ||
                    "PizzaHub Vendor"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Delivery Date
                </p>
                <p className="font-bold text-gray-900 mt-0.5">
                  {formatDate(selectedOrder.deliveryDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Request Date
                </p>
                <p className="font-bold text-gray-900 mt-0.5">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              {typeof selectedOrder.price === "number" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500">Price</p>
                  <p className="font-bold text-[#B91C1C] mt-0.5">
                    ${selectedOrder.price.toFixed(2)}
                  </p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-500">
                  Delivery Address
                </p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {selectedOrder.deliveryAddress || "—"}
                </p>
              </div>
              {selectedOrder.message && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-[#B91C1C]" />
                    Special Instructions
                  </p>
                  <p className="text-gray-800 mt-0.5">
                    {selectedOrder.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              {(selectedOrder.status || "pending").toLowerCase() ===
                "pending" && (
                <Button
                  type="button"
                  disabled={cancellingId === getOrderId(selectedOrder)}
                  onClick={() => handleCancelOrder(selectedOrder)}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                >
                  {cancellingId === getOrderId(selectedOrder)
                    ? "Cancelling..."
                    : "Cancel Order"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}