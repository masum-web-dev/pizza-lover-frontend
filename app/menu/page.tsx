"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Store,
  ArrowUpDown,
  Pizza,
  Loader2,
  Eye,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MenuItemData {
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

const CATEGORIES = [
  "All",
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

export default function BrowseMenuPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const [items, setItems] = useState<MenuItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">(
    "default"
  );

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://pizza-lover-backend.vercel.app";

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${backendUrl}/api/pizzas`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setItems([]);
          return;
        }

        const data = await res.json();
        const rawList: MenuItemData[] = Array.isArray(data)
          ? data
          : data.items || data.menuItems || [];

        // Only approved & active items on public Browse Menu
        const availableItems = rawList.filter((item) => {
          const status = (item.status || "approved").toLowerCase();
          const active = item.isActive === undefined ? true : Boolean(item.isActive);
          return status === "approved" && active;
        });

        setItems(availableItems);
      } catch {
        setItems([]);
        toast.error("Could not load menu items.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [backendUrl]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.location && item.location.trim()) {
        set.add(item.location.trim());
      }
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const result = items.filter((item) => {
      const title = (item.itemName || item.name || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const category = (item.category || "").trim();
      const location = (item.location || "").trim();

      const matchesSearch =
        !q || title.includes(q) || desc.includes(q) || location.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === "All" || category === selectedCategory;
      const matchesLocation =
        selectedLocation === "All" ||
        location.toLowerCase() === selectedLocation.toLowerCase();

      return matchesSearch && matchesCategory && matchesLocation;
    });

    if (sortBy === "price-asc") {
      return [...result].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }
    if (sortBy === "price-desc") {
      return [...result].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    return result;
  }, [items, searchQuery, selectedCategory, selectedLocation, sortBy]);

  const handleViewDetails = (itemId: string) => {
    if (isSessionPending) return;

    if (!session?.user) {
      toast.error("Please sign in first to view item details and order.");
      router.push(`/sign-in?redirect=${encodeURIComponent(`/menu/${itemId}`)}`);
      return;
    }

    router.push(`/menu/${itemId}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FFF8EE]/50 py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="rounded-3xl bg-white border border-orange-200/80 p-6 md:p-8 shadow-sm">
          <div className="max-w-2xl space-y-2">
            <Badge className="bg-orange-100 text-[#B91C1C] hover:bg-orange-100 border-0 font-bold">
              Freshly Baked Menu
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Browse <span className="text-[#B91C1C]">Pizza</span> Menu
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Explore handcrafted pizzas, sides, and beverages from local
              restaurants. Search by name, filter by category or location, and
              sort by price.
            </p>
          </div>

          {/* Search, Location & Sort Controls */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <div className="md:col-span-5 relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizza or item by name..."
                className="pl-10 h-11 rounded-xl border-orange-200 bg-[#FFF8EE]/40 focus-visible:ring-[#B91C1C]"
              />
            </div>

            <div className="md:col-span-4 relative">
              <Filter className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Filter by location"
                className="w-full h-11 rounded-xl border border-orange-200 bg-[#FFF8EE]/40 pl-10 pr-4 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "All" ? "All Locations" : loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 relative">
              <ArrowUpDown className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "default" | "price-asc" | "price-desc"
                  )
                }
                aria-label="Sort by price"
                className="w-full h-11 rounded-xl border border-orange-200 bg-[#FFF8EE]/40 pl-10 pr-4 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
              >
                <option value="default">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer ${
                    active
                      ? "bg-[#B91C1C] text-white shadow-sm"
                      : "bg-orange-50 text-gray-700 hover:bg-orange-100 hover:text-[#B91C1C]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-orange-200/70">
            <Loader2 className="h-9 w-9 animate-spin text-[#B91C1C]" />
            <p className="text-sm font-semibold text-gray-600">
              Loading delicious menu items...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-orange-300 p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[#B91C1C]">
              <Pizza className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">
              No menu items found
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Try clearing your search term or changing the category and
              location filters.
            </p>
            <Button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedLocation("All");
                setSortBy("default");
              }}
              className="mt-2 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold cursor-pointer"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const itemId = item._id || item.id || String(index);
              const title = item.itemName || item.name || "Delicious Pizza";
              const imgUrl =
                (Array.isArray(item.images) && item.images[0]) ||
                item.image ||
                "/Logo.jpg";
              const vendorLabel =
                item.businessName ||
                item.vendorName ||
                "PizzaHub Kitchen";

              return (
                <Card
                  key={itemId}
                  className="flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-orange-200/80 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="relative h-52 w-full overflow-hidden bg-orange-50">
                      <img
                        src={imgUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {item.category && (
                        <Badge className="absolute top-3 left-3 bg-white/95 text-[#B91C1C] hover:bg-white border border-orange-200 font-bold text-xs shadow-sm">
                          {item.category}
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-extrabold text-gray-900 line-clamp-1">
                          {title}
                        </CardTitle>
                        <span className="text-lg font-extrabold text-[#B91C1C] shrink-0">
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm text-gray-600 pb-4">
                      {item.description && (
                        <p className="line-clamp-2 text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                      <div className="pt-1 space-y-1 text-xs text-gray-500">
                        <p className="flex items-center gap-1.5 truncate">
                          <Store className="h-3.5 w-3.5 text-[#B91C1C] shrink-0" />
                          <span className="font-medium text-gray-700 truncate">
                            {vendorLabel}
                          </span>
                        </p>
                        {item.location && (
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 text-[#B91C1C] shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="pt-0 px-6 pb-5">
                    <Button
                      type="button"
                      onClick={() => handleViewDetails(itemId)}
                      className="w-full rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold gap-2 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}