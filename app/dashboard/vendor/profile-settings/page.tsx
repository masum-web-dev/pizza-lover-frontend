"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Store,
  User,
  Mail,
  Sparkles,
  Loader2,
  ArrowLeft,
  CheckCircle2,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VendorSessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  businessName?: string | null;
  subscriptionPlan?: string | null;
}

function VendorProfileSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const user = session?.user as VendorSessionUser | undefined;

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [planFromDb, setPlanFromDb] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || "");
      setBusinessName((prev) => prev || user.businessName || "");
      if (user.subscriptionPlan) {
        setPlanFromDb((prev) => prev || String(user.subscriptionPlan).toLowerCase());
      }
    }
  }, [user]);

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
        if (data?.businessName) {
          setBusinessName((prev) => prev || data.businessName);
        }
      } catch {
        // ignore network error during background sync
      }
    };

    fetchLatestPlan();
  }, [user?.id, user?.email, backendUrl]);

  useEffect(() => {
    const subStatus = searchParams.get("subscription");
    if (!subStatus) return;

    if (subStatus === "success") {
      toast.success("Payment completed! Your Premium plan is being activated.", {
        id: "stripe-subscription-status",
      });
      setPlanFromDb("premium");
    } else if (subStatus === "cancelled") {
      toast.error("Subscription payment was cancelled.", {
        id: "stripe-subscription-status",
      });
    }

    router.replace("/dashboard/vendor/profile-settings");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id && !user?.email) {
      toast.error("User session not found.");
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter a valid vendor name (at least 2 characters).");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`${backendUrl}/api/vendor/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id || "",
          email: user.email || "",
          name: name.trim(),
          businessName: businessName.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to update profile settings.");
        return;
      }

      if (data.user) {
        setName(data.user.name || name.trim());
        setBusinessName(data.user.businessName ?? businessName.trim());
        if (data.user.subscriptionPlan) {
          setPlanFromDb(String(data.user.subscriptionPlan).toLowerCase());
        }
      }

      toast.success("Profile settings updated successfully.");
      router.refresh();
    } catch {
      toast.error("Network error while updating profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    if (!user?.id && !user?.email) {
      toast.error("Please sign in to upgrade your plan.");
      return;
    }

    try {
      setIsUpgrading(true);
      const res = await fetch(`${backendUrl}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vendorId: user.id || "",
          vendorEmail: user.email || "",
          vendorName: name.trim() || user.name || "Vendor",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        toast.error(data.message || "Failed to start Stripe checkout.");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Network error while starting Stripe checkout.");
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
      </div>
    );
  }

  const currentPlan = String(
    planFromDb || user?.subscriptionPlan || "free"
  ).toLowerCase();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
            Vendor Profile Settings
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your kitchen/business details and subscription tier.
          </p>
        </div>

        <Link href="/dashboard/vendor">
          <Button
            variant="outline"
            className="rounded-full border-orange-200 text-gray-700 hover:bg-orange-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Subscription Status Card */}
      <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#B91C1C]" />
              <span className="text-sm font-extrabold text-gray-900">
                Current Subscription Plan:
              </span>
              <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 border-0 font-bold uppercase">
                {currentPlan}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {currentPlan === "premium"
                ? "Unlimited active menu items enabled."
                : "Free plan allows up to 3 active menu items. Upgrade to Premium for unlimited listings."}
            </p>
          </div>

          {currentPlan !== "premium" ? (
            <Button
              type="button"
              disabled={isUpgrading}
              onClick={handleUpgradeToPremium}
              className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold px-5 cursor-pointer"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Redirecting...
                </>
              ) : (
                "Upgrade to Premium ($19)"
              )}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="h-4 w-4" />
              Premium Active
            </span>
          )}
        </CardContent>
      </Card>

      {/* Profile Form Card */}
      <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold text-gray-900">
            Business & Account Details
          </CardTitle>
          <CardDescription>
            Update how your kitchen name and profile appear on PizzaLovers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user?.email || "Not available"}</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="vendor-name"
                className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5"
              >
                Vendor Name
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  id="vendor-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-orange-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="business-name"
                className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5"
              >
                Business / Kitchen Name
              </label>
              <div className="relative">
                <Store className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  id="business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Napoli Oven Pizza"
                  className="w-full rounded-xl border border-orange-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold px-6 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VendorProfileSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
        </div>
      }
    >
      <VendorProfileSettingsContent />
    </Suspense>
  );
}