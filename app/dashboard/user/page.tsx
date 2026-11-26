"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Pizza,
  Loader2,
  Calendar,
  MapPin,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CustomerOrder {
  _id?: string;
  id?: string;
  itemName?: string;
  pizzaName?: string;
  vendorName?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  status?: "pending" | "accepted" | "rejected" | "cancelled" | string;
  createdAt?: string;
}

export default function CustomerOverviewPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://pizza-lover-backend.vercel.app";

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userId = (session.user as { id?: string }).id || "";
        const res = await fetch(
          `${backendUrl}/api/orders/customer${userId ? `?customerId=${encodeURIComponent(userId)}` : ""}`,
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
        toast.error("Could not load order statistics right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session, backendUrl]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (o) => (o.status || "").toLowerCase() === "pending"
    ).length;
    const accepted = orders.filter(
      (o) => (o.status || "").toLowerCase() === "accepted"
    ).length;
    const rejected = orders.filter(
      (o) => (o.status || "").toLowerCase() === "rejected"
    ).length;

    return { total, pending, accepted, rejected };
  }, [orders]);

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "pending").toLowerCase();
    if (normalized === "accepted") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-semibold">
          Accepted
        </Badge>
      );
    }
    if (normalized === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 font-semibold">
          Rejected
        </Badge>
      );
    }
    if (normalized === "cancelled") {
      return (
        <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200 border-0 font-semibold">
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 font-semibold">
        Pending
      </Badge>
    );
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.total,
      subtitle: "All placed orders",
      icon: ShoppingBag,
      iconBg: "bg-red-50 text-[#B91C1C]",
    },
    {
      title: "Pending Orders",
      value: stats.pending,
      subtitle: "Awaiting restaurant response",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-700",
    },
    {
      title: "Accepted Orders",
      value: stats.accepted,
      subtitle: "Confirmed & preparing",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Rejected Orders",
      value: stats.rejected,
      subtitle: "Declined by vendor",
      icon: XCircle,
      iconBg: "bg-rose-50 text-rose-700",
    },
  ];

  const chartBars = [
    {
      label: "Pending",
      count: stats.pending,
      barColor: "bg-amber-500",
    },
    {
      label: "Accepted",
      count: stats.accepted,
      barColor: "bg-emerald-600",
    },
    {
      label: "Rejected",
      count: stats.rejected,
      barColor: "bg-[#B91C1C]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
            Welcome back, {session?.user?.name || "Customer"}!
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track your pizza orders, check order statuses, and manage your
            profile.
          </p>
        </div>
        <Link href="/dashboard/user/my-orders">
          <Button className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold gap-2 cursor-pointer">
            View All Orders
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="border-orange-200/80 bg-white">
              <CardContent className="p-6 flex items-center justify-center h-28">
                <Loader2 className="h-6 w-6 animate-spin text-[#B91C1C]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="border-orange-200/80 bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold text-gray-700">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-gray-900">
                    {card.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Chart & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Status Chart */}
        <Card className="lg:col-span-5 border-orange-200/80 bg-white shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-gray-900">
              Order Status Breakdown
            </CardTitle>
            <CardDescription>
              Visual summary of pending, accepted, and rejected orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chartBars.map((item) => {
              const percentage =
                stats.total > 0
                  ? Math.round((item.count / stats.total) * 100)
                  : 0;

              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="text-gray-900">
                      {item.count}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        ({percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-orange-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-orange-100 flex items-center justify-between text-xs text-gray-500">
              <span>Total Orders Tracked</span>
              <span className="font-bold text-gray-800">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-7 border-orange-200/80 bg-white shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-extrabold text-gray-900">
                Recent Orders
              </CardTitle>
              <CardDescription>
                Your latest pizza requests and delivery details
              </CardDescription>
            </div>
            <Link
              href="/dashboard/user/my-orders"
              className="text-xs font-bold text-[#B91C1C] hover:underline"
            >
              See all
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#B91C1C]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-orange-200 bg-[#FFF8EE]/60 p-8 text-center space-y-3">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-[#B91C1C]">
                  <Pizza className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-gray-800">
                  No orders found yet
                </p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore our pizza menu and place your first order to track it
                  here.
                </p>
                <Link href="/menu">
                  <Button
                    size="sm"
                    className="mt-1 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold cursor-pointer"
                  >
                    Browse Pizza Menu
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 4).map((order, idx) => (
                  <div
                    key={order._id || order.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-orange-100 bg-[#FFF8EE]/40 p-3.5"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {order.itemName || order.pizzaName || "Pizza Order"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {order.deliveryDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-[#B91C1C]" />
                            {order.deliveryDate}
                          </span>
                        )}
                        {order.deliveryAddress && (
                          <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="h-3.5 w-3.5 text-[#B91C1C]" />
                            {order.deliveryAddress}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}