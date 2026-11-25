"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Pizza,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Crown,
  PlusCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
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

interface VendorSessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  businessName?: string | null;
  subscriptionPlan?: string | null;
}

interface VendorMenuItem {
  _id?: string;
  id?: string;
  itemName?: string;
  name?: string;
  category?: string;
  price?: number;
  status?: string;
  isActive?: boolean;
}

interface VendorOrderItem {
  _id?: string;
  id?: string;
  itemName?: string;
  customerName?: string;
  deliveryDate?: string;
  status?: string;
}

export default function VendorOverviewPage() {
  const { data: session } = useSession();
  const user = session?.user as VendorSessionUser | undefined;
  const vendorId = user?.id;

  const [menuItems, setMenuItems] = useState<VendorMenuItem[]>([]);
  const [orders, setOrders] = useState<VendorOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const loadOverviewData = useCallback(async () => {
    if (!vendorId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [menuRes, ordersRes] = await Promise.all([
        fetch(
          `${backendUrl}/api/vendor/menu-items?vendorId=${encodeURIComponent(
            vendorId
          )}`,
          { credentials: "include" }
        ),
        fetch(
          `${backendUrl}/api/orders/vendor?vendorId=${encodeURIComponent(
            vendorId
          )}`,
          { credentials: "include" }
        ),
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(
          Array.isArray(menuData)
            ? menuData
            : menuData.items || menuData.menuItems || []
        );
      } else {
        setMenuItems([]);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(
          Array.isArray(ordersData) ? ordersData : ordersData.orders || []
        );
      } else {
        setOrders([]);
      }
    } catch {
      setMenuItems([]);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, backendUrl]);

  useEffect(() => {
    loadOverviewData();
  }, [loadOverviewData]);

  const totalMenuItems = menuItems.length;
  const activeMenuItems = menuItems.filter((item) => {
    const active = item.isActive === undefined ? true : Boolean(item.isActive);
    const status = String(item.status || "").toLowerCase();
    return active && status !== "rejected";
  }).length;

  const pendingOrdersCount = orders.filter(
    (o) => String(o.status || "pending").toLowerCase() === "pending"
  ).length;

  const acceptedOrdersCount = orders.filter(
    (o) => String(o.status || "").toLowerCase() === "accepted"
  ).length;

  const currentPlan = String(user?.subscriptionPlan || "free").toLowerCase();
  const isPremium = currentPlan === "premium";
  const restaurantName =
    user?.businessName?.trim() || user?.name?.trim() || "Your Restaurant";

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
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
              Welcome, {restaurantName}
            </h2>
            <Badge
              className={`border-0 font-bold uppercase text-xs ${
                isPremium
                  ? "bg-amber-100 text-amber-900 hover:bg-amber-100"
                  : "bg-orange-100 text-[#B91C1C] hover:bg-orange-100"
              }`}
            >
              {isPremium ? "Premium Plan" : "Free Plan"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Manage your menu items, review incoming customer orders, and track
            your subscription plan.
          </p>
        </div>

        <Link href="/dashboard/vendor/add-menu-item">
          <Button className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold px-5 gap-2 cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Add Menu Item
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">
              Total Menu Items
            </CardDescription>
            <Pizza className="h-4 w-4 text-[#B91C1C]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-gray-900">
              {totalMenuItems}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">
              Active Items
            </CardDescription>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-gray-900">
              {activeMenuItems}
              {!isPremium && (
                <span className="text-xs font-semibold text-gray-400 ml-1">
                  / 3
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">
              Pending Orders
            </CardDescription>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-gray-900">
              {pendingOrdersCount}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">
              Accepted Orders
            </CardDescription>
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-gray-900">
              {acceptedOrdersCount}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase text-gray-500">
              Subscription Plan
            </CardDescription>
            <Crown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-extrabold text-gray-900 capitalize">
              {currentPlan}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-gray-900">
              My Menu Items
            </CardTitle>
            <CardDescription>
              View item approval status, update prices or availability, and
              remove items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/vendor/my-menu-items">
              <Button
                variant="outline"
                className="rounded-full border-orange-200 text-[#B91C1C] hover:bg-orange-50 font-bold gap-1.5 cursor-pointer"
              >
                Manage Menu
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-gray-900">
              Customer Orders
            </CardTitle>
            <CardDescription>
              Inspect delivery details and accept or reject pending customer
              orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/vendor/customer-orders">
              <Button
                variant="outline"
                className="rounded-full border-orange-200 text-[#B91C1C] hover:bg-orange-50 font-bold gap-1.5 cursor-pointer"
              >
                View Orders
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-gray-900">
              Subscription &amp; Benefits
            </CardTitle>
            <CardDescription>
              {isPremium
                ? "You enjoy unlimited active menu items, a Premium badge, and featured placement."
                : "Upgrade to Premium for unlimited active items, a Premium badge, and homepage placement."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/vendor/subscription">
              <Button className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold gap-1.5 cursor-pointer">
                {isPremium ? "View Plan" : "Upgrade to Premium"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}