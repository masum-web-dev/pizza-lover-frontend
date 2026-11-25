"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Store,
  Calendar,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Pizza,
  ShieldAlert,
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

interface MenuItemDetail {
  _id?: string;
  id?: string;
  itemName?: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  location?: string;
  images?: string[];
  image?: string;
  status?: string;
  isActive?: boolean;
  vendorId?: string;
  vendorName?: string;
  businessName?: string;
}

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  isBlocked?: boolean | null;
}

export default function MenuItemDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const itemId = params?.id || "";

  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user as SessionUser | undefined;

  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const role = (user?.role || "customer").toLowerCase();
  const isBlocked = Boolean(user?.isBlocked);
  const isOwnItem = Boolean(
    user?.id && item?.vendorId && String(user.id) === String(item.vendorId)
  );
  const itemStatus = (item?.status || "approved").toLowerCase();
  const isItemActive =
    item?.isActive === undefined ? true : Boolean(item.isActive);
  const isOrderable =
    Boolean(item) && itemStatus === "approved" && isItemActive;

  useEffect(() => {
    if (isSessionPending) return;
    if (!user) {
      toast.error("Please sign in to view item details and place an order.");
      router.replace(`/sign-in?redirect=${encodeURIComponent(`/menu/${itemId}`)}`);
    }
  }, [isSessionPending, user, itemId, router]);

  const fetchItemDetails = useCallback(async () => {
    if (!itemId) {
      setErrorMessage("Invalid menu item ID.");
      setIsLoadingItem(false);
      return;
    }

    try {
      setIsLoadingItem(true);
      setErrorMessage(null);

      const res = await fetch(`${backendUrl}/api/pizzas/${itemId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(
          errData.message ||
            (res.status === 404
              ? "Menu item not found or invalid ID."
              : "Failed to load menu item details.")
        );
        setItem(null);
        return;
      }

      const data = await res.json();
      const loadedItem: MenuItemDetail | null = data.item || data.pizza || data || null;

      if (!loadedItem || (!loadedItem._id && !loadedItem.id && !loadedItem.itemName && !loadedItem.name)) {
        setErrorMessage("Menu item not found.");
        setItem(null);
        return;
      }

      setItem(loadedItem);
      const imgs =
        Array.isArray(loadedItem.images) && loadedItem.images.length > 0
          ? loadedItem.images
          : loadedItem.image
          ? [loadedItem.image]
          : ["/Logo.jpg"];
      setSelectedImage(imgs[0]);
    } catch {
      setErrorMessage("Unable to fetch item details. Please try again.");
      setItem(null);
    } finally {
      setIsLoadingItem(false);
    }
  }, [itemId, backendUrl]);

  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in first to place an order.");
      router.push(`/sign-in?redirect=${encodeURIComponent(`/menu/${itemId}`)}`);
      return;
    }

    if (isBlocked) {
      toast.error("Blocked accounts cannot place orders.");
      return;
    }

    if (role === "admin") {
      toast.error("Admins cannot place customer orders.");
      return;
    }

    if (isOwnItem) {
      toast.error("Vendors cannot order their own menu items.");
      return;
    }

    if (!isOrderable) {
      toast.error("This item is currently unavailable for ordering.");
      return;
    }

    if (!deliveryDate.trim()) {
      toast.error("Please select a delivery date.");
      return;
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      toast.error("Please enter a valid delivery address.");
      return;
    }

    const resolvedItemId = item?._id || item?.id || itemId;
    const itemTitle = item?.itemName || item?.name || "Pizza Item";
    const vendorLabel =
      item?.businessName || item?.vendorName || "PizzaHub Kitchen";
    const primaryImage =
      (Array.isArray(item?.images) && item.images[0]) ||
      item?.image ||
      "/Logo.jpg";

    try {
      setIsSubmitting(true);

      const res = await fetch(`${backendUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemId: resolvedItemId,
          itemName: itemTitle,
          itemImage: primaryImage,
          price: Number(item?.price || 0),
          vendorId: item?.vendorId || "",
          vendorName: vendorLabel,
          customerId: user.id || "",
          customerName: user.name || "",
          customerEmail: user.email || "",
          deliveryDate: deliveryDate.trim(),
          deliveryAddress: deliveryAddress.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || "Could not place your order.");
        return;
      }

      toast.success("Order placed successfully! Status: Pending.");
      setDeliveryDate("");
      setDeliveryAddress("");
      setMessage("");
      router.push("/dashboard/user/my-orders");
    } catch {
      toast.error("Network error while submitting your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending || isLoadingItem) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#FFF8EE]/50 gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-[#B91C1C]" />
        <p className="text-sm font-semibold text-gray-600">
          Loading item details...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (errorMessage || !item) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#FFF8EE]/50 py-14 px-4">
        <div className="max-w-lg mx-auto rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#B91C1C]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">
            Item Unavailable
          </h1>
          <p className="text-sm text-gray-600">
            {errorMessage || "We could not find the requested menu item."}
          </p>
          <div className="pt-2">
            <Link href="/menu">
              <Button className="rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold gap-2 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gallery =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : ["/Logo.jpg"];

  const activeImg = selectedImage || gallery[0];
  const itemTitle = item.itemName || item.name || "Delicious Pizza";
  const vendorLabel =
    item.businessName || item.vendorName || "PizzaHub Kitchen";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FFF8EE]/50 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#B91C1C] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse Menu
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Images & Item Info */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="overflow-hidden rounded-3xl border border-orange-200/80 bg-white shadow-sm">
              <div className="relative h-72 sm:h-96 w-full bg-orange-50">
                <img
                  src={activeImg}
                  alt={itemTitle}
                  className="h-full w-full object-cover"
                />
                {item.category && (
                  <Badge className="absolute top-4 left-4 bg-white/95 text-[#B91C1C] hover:bg-white border border-orange-200 font-bold">
                    {item.category}
                  </Badge>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex items-center gap-3 p-4 border-t border-orange-100 overflow-x-auto bg-[#FFF8EE]/40">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative h-16 w-20 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeImg === imgUrl
                          ? "border-[#B91C1C]"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${itemTitle} preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-extrabold text-gray-900">
                      {itemTitle}
                    </CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
                        <Store className="h-4 w-4 text-[#B91C1C]" />
                        {vendorLabel}
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-[#B91C1C]" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold uppercase text-gray-400 block">
                      Price
                    </span>
                    <span className="text-2xl md:text-3xl font-extrabold text-[#B91C1C]">
                      ${Number(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-2 border-t border-orange-100">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-800 mb-1.5">
                    Description
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.description ||
                      "Freshly prepared pizza crafted with quality ingredients."}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                  {isOrderable ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Approved &amp; Available for Order
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      Currently Unavailable
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Form Card */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border border-orange-200/80 bg-white shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Pizza className="h-5 w-5 text-[#B91C1C]" />
                  Place Your Order
                </CardTitle>
                <CardDescription>
                  Fill in your delivery schedule and address. Your order starts
                  as <span className="font-semibold text-gray-800">Pending</span>.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isBlocked ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 flex items-start gap-2.5">
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>
                      Your account is blocked, so you cannot place new orders.
                    </p>
                  </div>
                ) : role === "admin" ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Admins cannot place customer orders. Switch to a customer
                    account to order items.
                  </div>
                ) : isOwnItem ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    You cannot place an order for your own restaurant&apos;s menu
                    item.
                  </div>
                ) : !isOrderable ? (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    Only approved and active menu items can be ordered.
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="rounded-2xl bg-[#FFF8EE] border border-orange-200/70 p-3.5 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer:</span>
                        <span className="font-bold text-gray-900">
                          {user.name || user.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Restaurant:</span>
                        <span className="font-bold text-gray-900">
                          {vendorLabel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Item Total:</span>
                        <span className="font-extrabold text-[#B91C1C]">
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="deliveryDate"
                        className="font-semibold text-gray-800 flex items-center gap-1.5"
                      >
                        <Calendar className="h-4 w-4 text-[#B91C1C]" />
                        Delivery Date <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="border-orange-200 focus-visible:ring-[#B91C1C]"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="deliveryAddress"
                        className="font-semibold text-gray-800 flex items-center gap-1.5"
                      >
                        <MapPin className="h-4 w-4 text-[#B91C1C]" />
                        Delivery Address <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="deliveryAddress"
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House, street, area, city..."
                        className="border-orange-200 focus-visible:ring-[#B91C1C]"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="orderMessage"
                        className="font-semibold text-gray-800 flex items-center gap-1.5"
                      >
                        <FileText className="h-4 w-4 text-[#B91C1C]" />
                        Additional Message / Instructions
                      </Label>
                      <textarea
                        id="orderMessage"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Extra chili flakes, delivery notes, or special requests..."
                        className="w-full rounded-xl border border-orange-200 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold gap-2 shadow-sm cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Confirm Order
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}