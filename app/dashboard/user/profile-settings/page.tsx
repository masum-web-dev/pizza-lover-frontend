"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, ShieldCheck, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileSessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export default function CustomerProfileSettingsPage() {
  const { data: session, isPending, refetch } = useSession();
  const user = session?.user as ProfileSessionUser | undefined;

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedImage = image.trim();

    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Please enter a valid full name (at least 2 characters).");
      return;
    }

    if (trimmedImage) {
      try {
        const parsed = new URL(trimmedImage);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          toast.error("Profile image URL must start with http:// or https://");
          return;
        }
      } catch {
        toast.error("Please enter a valid profile image URL or leave it empty.");
        return;
      }
    }

    try {
      setIsSaving(true);

      const clientWithUpdate = authClient as unknown as {
        updateUser?: (payload: {
          name?: string;
          image?: string;
        }) => Promise<{ error?: { message?: string } | null }>;
      };

      if (typeof clientWithUpdate.updateUser === "function") {
        const result = await clientWithUpdate.updateUser({
          name: trimmedName,
          image: trimmedImage ? trimmedImage : undefined,
        });

        if (result?.error) {
          toast.error(result.error.message || "Failed to update profile.");
          return;
        }
      } else {
        const res = await fetch("/api/auth/update-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: trimmedName,
            ...(trimmedImage ? { image: trimmedImage } : {}),
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.message || "Failed to update profile.");
          return;
        }
      }

      if (refetch) {
        await refetch();
      }

      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Something went wrong while updating your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-[#B91C1C]" />
      </div>
    );
  }

  const displayName = name.trim() || user?.name?.trim() || "Customer";
  const initialLetter = displayName.charAt(0).toUpperCase() || "C";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Profile Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Update your display name and optional profile image.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Preview Card */}
        <Card className="md:col-span-4 border-orange-200/80 bg-white shadow-sm rounded-2xl h-fit">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-3">
              {image.trim() ? (
                <img
                  src={image.trim()}
                  alt={displayName}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  className="h-24 w-24 rounded-full object-cover border-2 border-[#FDBA74] mx-auto shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#B91C1C] text-white text-3xl font-extrabold mx-auto border-2 border-[#FDBA74] shadow-sm">
                  {initialLetter}
                </div>
              )}
            </div>
            <CardTitle className="text-base font-extrabold text-gray-900">
              {displayName}
            </CardTitle>
            <CardDescription className="text-xs break-all">
              {user?.email || "customer@pizzahub.com"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2 border-t border-orange-100 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Account Role</span>
              <Badge className="bg-orange-100 text-[#B91C1C] hover:bg-orange-100 border-0 font-bold uppercase text-[10px]">
                {user?.role || "customer"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Role &amp; plan settings are managed securely.</span>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="md:col-span-8 border-orange-200/80 bg-white shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-[#B91C1C]" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Changes reflect immediately across your navbar and dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="font-semibold text-gray-800">
                  Full Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="border-orange-200 focus-visible:ring-[#B91C1C]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-semibold text-gray-800">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-500">
                  Email address cannot be changed here.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="profileImage"
                  className="font-semibold text-gray-800 flex items-center gap-1.5"
                >
                  <Camera className="h-4 w-4 text-[#B91C1C]" />
                  Profile Image URL (Optional)
                </Label>
                <Input
                  id="profileImage"
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                  className="border-orange-200 focus-visible:ring-[#B91C1C]"
                />
                <p className="text-[11px] text-gray-500">
                  Leave blank to use your initial avatar.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold px-6 gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}