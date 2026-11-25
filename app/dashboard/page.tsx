"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface SessionUser {
  id?: string;
  role?: string | null;
  isBlocked?: boolean | null;
}

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    const user = session?.user as SessionUser | undefined;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    const role = (user.role || "customer").toLowerCase();

    if (role === "vendor") {
      router.replace("/dashboard/vendor");
    } else if (role === "admin") {
      router.replace("/dashboard/admin");
    } else {
      router.replace("/dashboard/user");
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#FFF8EE]/50 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
      <p className="text-sm font-semibold text-gray-700">
        Redirecting to your dashboard...
      </p>
    </div>
  );
}