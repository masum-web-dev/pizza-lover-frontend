"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Pizza,
  PlusCircle,
  ClipboardList,
  Settings,
  LogOut,
  ShieldAlert,
  Loader2,
  Home,
  UtensilsCrossed,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession, signOut } from "@/lib/auth-client";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VendorUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  isBlocked?: boolean | null;
  subscriptionPlan?: "free" | "premium" | string | null;
  businessName?: string | null;
}

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [planFromDb, setPlanFromDb] = useState<string | null>(null);

  const user = session?.user as VendorUser | undefined;
  const role = (user?.role || "customer").toLowerCase();
  const isBlocked = Boolean(user?.isBlocked);
  const plan = String(
    planFromDb || user?.subscriptionPlan || "free"
  ).toLowerCase();

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://pizza-lover-backend.vercel.app";

  useEffect(() => {
    if (!user?.id && !user?.email) return;

    const fetchLatestPlan = async () => {
      try {
        const params = new URLSearchParams();
        if (user?.id) params.set("userId", user.id);
        if (user?.email) params.set("email", user.email);

        const res = await fetch(
          `${backendUrl}/api/vendor/subscription-status?${params.toString()}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );
        if (!res.ok) return;

        const data = await res.json();
        if (data?.subscriptionPlan) {
          setPlanFromDb(String(data.subscriptionPlan).toLowerCase());
        }
      } catch {
        // ignore network error during plan sync
      }
    };

    fetchLatestPlan();
  }, [user?.id, user?.email, backendUrl, pathname]);

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (isBlocked) {
      return;
    }

    if (role !== "vendor") {
      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/user");
      }
    }
  }, [isPending, user, role, isBlocked, router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success("Logged out successfully");
      router.push("/sign-in");
      router.refresh();
    } catch {
      toast.error("Failed to log out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#FFF8EE]/50 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
        <p className="text-sm font-semibold text-gray-700">
          Loading Vendor Dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isBlocked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#FFF8EE]/60 px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-lg space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#B91C1C]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Account Restricted
          </h2>
          <p className="text-sm text-gray-600">
            Your vendor account has been blocked. Protected dashboard actions are
            disabled.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/">
              <Button variant="outline" className="rounded-full">
                Go Home
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (role !== "vendor") {
    return null;
  }

  const sidebarItems = [
    {
      title: "Overview",
      href: "/dashboard/vendor",
      icon: LayoutDashboard,
    },
    {
      title: "My Menu Items",
      href: "/dashboard/vendor/my-menu-items",
      icon: Pizza,
    },
    {
      title: "Add Menu Item",
      href: "/dashboard/vendor/add-menu-item",
      icon: PlusCircle,
    },
    {
      title: "Customer Orders",
      href: "/dashboard/vendor/customer-orders",
      icon: ClipboardList,
    },
    {
      title: "Profile Settings",
      href: "/dashboard/vendor/profile-settings",
      icon: Settings,
    },
  ];

  const displayName =
    user.businessName?.trim() || user.name?.trim() || "Pizza Vendor";
  const initialLetter = displayName.charAt(0).toUpperCase() || "V";

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-4rem)] w-full bg-[#FFF8EE]/40">
        <Sidebar className="border-r border-orange-200 bg-white">
          <SidebarHeader className="border-b border-orange-100 p-4">
            <Link
              href="/dashboard/vendor"
              className="flex items-center gap-2.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B91C1C] text-white shadow-sm">
                <Pizza className="h-5 w-5 text-[#FDBA74]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-gray-900 truncate">
                  Vendor Panel
                </p>
                <p className="text-xs text-gray-500 truncate">PizzaHub</p>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <div className="mb-2 px-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Restaurant Management
              </span>
            </div>
            <SidebarMenu className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={
                        <Link
                          href={item.href}
                          className="flex items-center gap-3"
                        />
                      }
                      className={`h-10 rounded-xl px-3 font-semibold transition-colors ${
                        isActive
                          ? "bg-[#B91C1C] text-white hover:bg-[#991B1B] hover:text-white"
                          : "text-gray-700 hover:bg-orange-50 hover:text-[#B91C1C]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            <div className="mt-6 border-t border-orange-100 pt-4">
              <div className="mb-2 px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Quick Links
                </span>
              </div>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <Link href="/menu" className="flex items-center gap-3" />
                    }
                    className="h-9 rounded-xl px-3 text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-[#B91C1C]"
                  >
                    <UtensilsCrossed className="h-4 w-4 shrink-0" />
                    <span>Browse Menu</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <Link href="/" className="flex items-center gap-3" />
                    }
                    className="h-9 rounded-xl px-3 text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-[#B91C1C]"
                  >
                    <Home className="h-4 w-4 shrink-0" />
                    <span>Back to Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t border-orange-100 p-3 space-y-3 bg-[#FFF8EE]/50">
            <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 border border-orange-200/70">
              {user.image ? (
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-orange-200 shrink-0">
                  <Image
                    src={user.image}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B91C1C] text-white font-bold text-sm shrink-0">
                  {initialLetter}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className="bg-orange-100 text-[#B91C1C] hover:bg-orange-100 border-0 text-[10px] px-1.5 py-0">
                    Vendor
                  </Badge>
                  <Badge
                    className={`border-0 text-[10px] px-1.5 py-0 uppercase ${
                      plan === "premium"
                        ? "bg-amber-400/25 text-amber-900 hover:bg-amber-400/25"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {plan}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="w-full justify-center gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 min-w-0 bg-transparent">
          <div className="sticky top-16 z-30 flex h-14 items-center justify-between border-b border-orange-200/70 bg-white/95 backdrop-blur px-4 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-gray-700 hover:text-[#B91C1C]" />
              <h1 className="text-base md:text-lg font-extrabold text-gray-900">
                Vendor Dashboard
              </h1>
            </div>

            <Link href="/dashboard/vendor/add-menu-item">
              <Button
                size="sm"
                className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold px-4 gap-1.5 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                Add Item
              </Button>
            </Link>
          </div>

          <main className="p-4 md:p-6 max-w-7xl mx-auto w-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}