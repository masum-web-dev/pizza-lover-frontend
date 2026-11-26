"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Crown,
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

interface PlatformUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  businessName?: string;
  subscriptionPlan?: string;
  isBlocked?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://pizza-lover-backend.vercel.app";

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${backendUrl}/api/admin/users?role=${encodeURIComponent(roleFilter)}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        setUsers([]);
        return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUserId = (u: PlatformUser) => String(u._id || u.id || "");

  const handleToggleBlock = async (targetUser: PlatformUser) => {
    const userId = getUserId(targetUser);
    const nextBlocked = !Boolean(targetUser.isBlocked);

    try {
      setBusyUserId(userId);
      setFeedback(null);

      const res = await fetch(
        `${backendUrl}/api/admin/users/${encodeURIComponent(userId)}/block`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isBlocked: nextBlocked }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.message || "Failed to update user status.",
        });
        return;
      }

      setUsers((prev) =>
        prev.map((row) =>
          getUserId(row) === userId ? { ...row, isBlocked: nextBlocked } : row
        )
      );
      setFeedback({
        type: "success",
        text: nextBlocked
          ? `${targetUser.name || "User"} has been blocked.`
          : `${targetUser.name || "User"} has been unblocked.`,
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while updating user block status.",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const name = String(u.name || "").toLowerCase();
    const email = String(u.email || "").toLowerCase();
    const business = String(u.businessName || "").toLowerCase();

    return name.includes(q) || email.includes(q) || business.includes(q);
  });

  const renderRoleBadge = (roleRaw?: string) => {
    const role = String(roleRaw || "customer").toLowerCase();
    if (role === "admin") {
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-0 font-bold capitalize">
          Admin
        </Badge>
      );
    }
    if (role === "vendor") {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-0 font-bold capitalize">
          Vendor
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 font-bold capitalize">
        Customer
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-200 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Users & Vendors Management
        </h2>
        <p className="text-sm text-gray-600">
          Inspect registered customers and vendors, check vendor subscription
          plans, and block or unblock accounts.
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
              placeholder="Search by name, email, or kitchen name..."
              className="pl-9 rounded-full border-orange-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["all", "vendor", "customer", "admin"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setRoleFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
                  roleFilter === tab
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
      ) : filteredUsers.length === 0 ? (
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="text-center py-12">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <CardTitle className="text-lg font-extrabold text-gray-900">
              No Users Found
            </CardTitle>
            <CardDescription>
              No accounts match your current filter.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const userId = getUserId(u);
            const role = String(u.role || "customer").toLowerCase();
            const isBlocked = Boolean(u.isBlocked);
            const isBusy = busyUserId === userId;

            return (
              <Card
                key={userId}
                className="rounded-2xl border-orange-200/80 bg-white shadow-sm"
              >
                <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-gray-900">
                        {u.name || "Unnamed User"}
                      </h3>
                      {renderRoleBadge(u.role)}

                      {role === "vendor" && (
                        <Badge
                          className={`border-0 font-bold capitalize gap-1 ${
                            u.subscriptionPlan === "premium"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.subscriptionPlan === "premium" && (
                            <Crown className="h-3 w-3" />
                          )}
                          {u.subscriptionPlan || "free"} plan
                        </Badge>
                      )}

                      <Badge
                        className={`border-0 font-bold ${
                          isBlocked
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-600">{u.email}</p>
                    {u.businessName && (
                      <p className="text-xs font-semibold text-gray-500">
                        Kitchen: {u.businessName}
                      </p>
                    )}
                  </div>

                  {role !== "admin" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => handleToggleBlock(u)}
                      className={`rounded-full font-bold text-xs gap-1.5 cursor-pointer shrink-0 ${
                        isBlocked
                          ? "border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                          : "border-red-200 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isBlocked ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Unblock Account
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Block Account
                        </>
                      )}
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