"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  ShoppingBag,
  ShieldCheck,
  Store,
  Home,
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Menu Approvals",
    href: "/dashboard/admin/menu-items",
    icon: ClipboardCheck,
  },
  {
    label: "Users & Vendors",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    label: "Orders & Revenue",
    href: "/dashboard/admin/orders",
    icon: ShoppingBag,
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-orange-100">
              <div className="h-10 w-10 rounded-xl bg-[#B91C1C] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#B91C1C]">
                  PizzaHub Control
                </p>
                <h1 className="text-base font-extrabold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <nav className="space-y-1.5">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard/admin"
                    ? pathname === "/dashboard/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                      isActive
                        ? "bg-[#B91C1C] text-white shadow-sm"
                        : "text-gray-700 hover:bg-orange-50 hover:text-[#B91C1C]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-orange-100 space-y-2">
              <Link
                href="/browse-menu"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-orange-50 hover:text-gray-900"
              >
                <Store className="h-4 w-4" />
                <span>Browse Public Menu</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-orange-50 hover:text-gray-900"
              >
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}