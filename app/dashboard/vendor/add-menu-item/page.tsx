"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  Upload,
  MapPin,
  DollarSign,
  Tag,
  FileText,
  Loader2,
  Crown,
  Image as ImageIcon,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const MENU_CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

const FREE_PLAN_ACTIVE_LIMIT = 3;

export default function AddMenuItemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as VendorSessionUser | undefined;

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState(MENU_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const [activeItemsCount, setActiveItemsCount] = useState<number>(0);
  const [isCheckingLimit, setIsCheckingLimit] = useState<boolean>(true);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";
  const plan = (user?.subscriptionPlan || "free").toLowerCase();
  const isFreePlan = plan !== "premium";
  const hasReachedFreeLimit =
    isFreePlan && activeItemsCount >= FREE_PLAN_ACTIVE_LIMIT;

  useEffect(() => {
    const checkVendorItemsCount = async () => {
      if (!user?.id) {
        setIsCheckingLimit(false);
        return;
      }

      try {
        setIsCheckingLimit(true);
        const res = await fetch(
          `${backendUrl}/api/vendor/menu-items?vendorId=${encodeURIComponent(
            user.id
          )}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          setActiveItemsCount(0);
          return;
        }

        const data = await res.json();
        const list: Array<{ isActive?: boolean; status?: string }> =
          Array.isArray(data) ? data : data.items || data.menuItems || [];

        const activeCount = list.filter((item) => {
          const active =
            item.isActive === undefined ? true : Boolean(item.isActive);
          const status = String(item.status || "").toLowerCase();
          return active && status !== "rejected";
        }).length;

        setActiveItemsCount(activeCount);
      } catch {
        setActiveItemsCount(0);
      } finally {
        setIsCheckingLimit(false);
      }
    };

    checkVendorItemsCount();
  }, [user?.id, backendUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedImageUrl("");

    if (!file) {
      setImageFile(null);
      setPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be 5MB or smaller.");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadToImgBB = async (file: File): Promise<string | null> => {
    if (!imgbbApiKey) {
      toast.error("ImgBB API key is not configured.");
      return null;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbApiKey)}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.data?.url) {
        toast.error("Failed to upload image to ImgBB.");
        return null;
      }

      return String(data.data.url);
    } catch {
      toast.error("Network error while uploading image to ImgBB.");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Please sign in as a vendor to add a menu item.");
      return;
    }

    if (hasReachedFreeLimit) {
      toast.error(
        `Free plan allows up to ${FREE_PLAN_ACTIVE_LIMIT} active menu items. Upgrade to Premium for unlimited items.`
      );
      return;
    }

    const numericPrice = Number(price);
    if (!itemName.trim() || itemName.trim().length < 2) {
      toast.error("Please enter a valid item name.");
      return;
    }

    if (!category.trim()) {
      toast.error("Please select a category.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error("Please enter a description (at least 10 characters).");
      return;
    }

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      toast.error("Please enter a valid price greater than 0.");
      return;
    }

    if (!location.trim()) {
      toast.error("Please enter the restaurant area or city.");
      return;
    }

    let finalImageUrl = uploadedImageUrl;
    if (!finalImageUrl) {
      if (!imageFile) {
        toast.error("Item image is required. Please choose an image file.");
        return;
      }
      const urlFromImgbb = await uploadToImgBB(imageFile);
      if (!urlFromImgbb) return;
      finalImageUrl = urlFromImgbb;
      setUploadedImageUrl(urlFromImgbb);
    }

    try {
      setIsSubmitting(true);

      const businessLabel =
        user.businessName?.trim() || user.name?.trim() || "PizzaHub Vendor";

      const res = await fetch(`${backendUrl}/api/pizzas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemName: itemName.trim(),
          category: category.trim(),
          description: description.trim(),
          price: numericPrice,
          location: location.trim(),
          images: [finalImageUrl],
          image: finalImageUrl,
          status: "pending",
          isActive: true,
          vendorId: user.id,
          vendorName: user.name || "Vendor",
          businessName: businessLabel,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || "Failed to add menu item.");
        return;
      }

      toast.success(
        "Menu item submitted with Pending status! Waiting for admin approval."
      );
      router.push("/dashboard/vendor/my-menu-items");
    } catch {
      toast.error("Network error while creating menu item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
            Add Menu Item
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Publish a new pizza, side, or drink. New items start as{" "}
            <span className="font-semibold text-amber-700">Pending</span> until
            approved by an admin.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            className={`border-0 font-bold uppercase text-xs px-3 py-1 ${
              plan === "premium"
                ? "bg-amber-100 text-amber-900 hover:bg-amber-100"
                : "bg-orange-100 text-[#B91C1C] hover:bg-orange-100"
            }`}
          >
            {plan === "premium" ? "Premium Plan" : "Free Plan"}
          </Badge>
        </div>
      </div>

      {/* Free Plan Limit Notice */}
      {!isCheckingLimit && hasReachedFreeLimit && (
        <Card className="border-amber-300 bg-amber-50/80 rounded-2xl">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-700" />
                Free Plan Active Item Limit Reached ({FREE_PLAN_ACTIVE_LIMIT}/
                {FREE_PLAN_ACTIVE_LIMIT})
              </p>
              <p className="text-xs text-amber-800">
                Upgrade to Premium to add unlimited active menu items, get a
                Premium badge, and receive homepage featured placement.
              </p>
            </div>
            <Link href="/dashboard/vendor/subscription">
              <Button className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold shrink-0 cursor-pointer">
                Upgrade to Premium
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Form Card */}
      <Card className="border-orange-200/80 bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-[#B91C1C]" />
            Menu Item Details
          </CardTitle>
          <CardDescription>
            All fields and an uploaded image file are required.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="itemName"
                  className="font-semibold text-gray-800 flex items-center gap-1.5"
                >
                  <Tag className="h-4 w-4 text-[#B91C1C]" />
                  Item Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="itemName"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Smoky BBQ Chicken Pizza"
                  className="border-orange-200 focus-visible:ring-[#B91C1C]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="category"
                  className="font-semibold text-gray-800"
                >
                  Category <span className="text-red-600">*</span>
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-orange-200 bg-transparent px-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
                >
                  {MENU_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="price"
                  className="font-semibold text-gray-800 flex items-center gap-1.5"
                >
                  <DollarSign className="h-4 w-4 text-[#B91C1C]" />
                  Price (USD) <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="14.99"
                  className="border-orange-200 focus-visible:ring-[#B91C1C]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="location"
                  className="font-semibold text-gray-800 flex items-center gap-1.5"
                >
                  <MapPin className="h-4 w-4 text-[#B91C1C]" />
                  Location (Area / City){" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Dhanmondi, Dhaka"
                  className="border-orange-200 focus-visible:ring-[#B91C1C]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="font-semibold text-gray-800 flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4 text-[#B91C1C]" />
                Description <span className="text-red-600">*</span>
              </Label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe crust, toppings, cheese blend, or portion size..."
                className="w-full rounded-xl border border-orange-200 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
                required
              />
            </div>

            {/* ImgBB File Upload */}
            <div className="space-y-2">
              <Label
                htmlFor="itemImageFile"
                className="font-semibold text-gray-800 flex items-center gap-1.5"
              >
                <Upload className="h-4 w-4 text-[#B91C1C]" />
                Item Image (Uploaded via ImgBB){" "}
                <span className="text-red-600">*</span>
              </Label>

              <div className="rounded-2xl border border-dashed border-orange-300 bg-[#FFF8EE]/50 p-4">
                <Input
                  id="itemImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border-orange-200 bg-white file:mr-4 file:rounded-full file:border-0 file:bg-[#B91C1C] file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#991B1B] cursor-pointer"
                  required={!uploadedImageUrl}
                />

                {previewUrl ? (
                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="h-24 w-24 rounded-xl object-cover border border-orange-200 shadow-sm"
                    />
                    <div className="text-xs text-gray-600 space-y-1">
                      <p className="font-bold text-gray-900">
                        {imageFile?.name || "Uploaded Image"}
                      </p>
                      <p>
                        Ready to upload to ImgBB when you submit the form.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <ImageIcon className="h-4 w-4 text-[#B91C1C]" />
                    <span>
                      Select a clear image file (max 5MB). It will be uploaded
                      to ImgBB automatically.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Link href="/dashboard/vendor/my-menu-items">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full cursor-pointer"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={
                  isSubmitting || isUploadingImage || hasReachedFreeLimit
                }
                className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold px-6 gap-2 cursor-pointer"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading Image...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Item...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    Publish Menu Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}