"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session, isPending } = useSession();
  const user = session?.user as AuthUser | undefined;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Menu", href: "/menu" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setIsDropdownOpen(false);
      setIsOpen(false);
      toast.success("Logged out successfully");
      router.push("/sign-in");
      router.refresh();
    } catch {
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.name?.trim() || "Pizza Lover";
  const initialLetter = displayName.charAt(0).toUpperCase() || "P";

  const renderUserAvatar = (sizeClass = "h-8 w-8 text-xs") => {
    if (user?.image) {
      return (
        <div
          className={`relative ${sizeClass} overflow-hidden rounded-full border border-[#FDBA74]/70 bg-red-950 shrink-0`}
        >
          <Image
            src={user.image}
            alt={displayName}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      );
    }

    return (
      <div
        className={`flex ${sizeClass} items-center justify-center rounded-full border border-[#FDBA74]/70 bg-[#FFF8EE] text-[#B91C1C] font-extrabold shrink-0`}
      >
        {initialLetter}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#B91C1C] text-white shadow-md border-b border-red-800/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-orange-200/40 shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/Logo.jpg"
              alt="PizzaLovers Logo"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
            Pizza<span className="text-[#FDBA74]">Lovers</span>
          </span>
        </Link>

        {/* Center: Main Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "text-[#FDBA74] underline underline-offset-8 decoration-2"
                    : "text-white/95 hover:text-[#FDBA74]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth State (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isPending ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-red-900/60 border border-orange-200/20" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full bg-red-900/65 hover:bg-red-900 border border-orange-200/35 pl-1.5 pr-3 py-1 text-left transition cursor-pointer shadow-sm"
              >
                {renderUserAvatar("h-8 w-8 text-xs")}
                <span className="max-w-[140px] truncate text-sm font-semibold text-white">
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#FDBA74] transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white text-gray-800 shadow-xl border border-orange-200 py-2 z-50">
                  <div className="flex items-center gap-3 px-4 py-2.5 border-b border-orange-100 bg-[#FFF8EE]/60">
                    {renderUserAvatar("h-10 w-10 text-sm")}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {displayName}
                      </p>
                      {user.email && (
                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      )}
                      {user.role && (
                        <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#B91C1C]">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#B91C1C] transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#B91C1C]" />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile-settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#B91C1C] transition-colors"
                    >
                      <Settings className="h-4 w-4 text-[#B91C1C]" />
                      Profile Settings
                    </Link>
                  </div>

                  <div className="border-t border-orange-100 pt-1">
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  className="border-[#FFF8EE]/80 bg-transparent text-white hover:bg-[#FFF8EE] hover:text-[#B91C1C] font-semibold rounded-full px-5 cursor-pointer"
                >
                  Sign Up
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button className="bg-[#FFF8EE] hover:bg-[#FFEDD5] text-[#B91C1C] font-bold rounded-full px-6 shadow-sm cursor-pointer">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-red-800 focus:outline-none">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="bg-[#B91C1C] text-white border-red-800 w-[270px]"
            >
              <SheetTitle className="flex items-center gap-2.5 text-left text-white">
                <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-orange-200/40">
                  <Image
                    src="/Logo.jpg"
                    alt="PizzaLovers Logo"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-extrabold">
                  Pizza<span className="text-[#FDBA74]">Lovers</span>
                </span>
              </SheetTitle>

              <div className="mt-8 flex flex-col gap-5">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-[#FFF8EE] text-[#B91C1C]"
                            : "text-white hover:bg-red-800"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-red-800 pt-4 flex flex-col gap-2.5">
                  {isPending ? (
                    <div className="h-12 w-full animate-pulse rounded-xl bg-red-900/60" />
                  ) : user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl bg-red-900/65 border border-orange-200/25 px-3 py-2.5">
                        {renderUserAvatar("h-10 w-10 text-sm")}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">
                            {displayName}
                          </p>
                          {user.role && (
                            <p className="text-[11px] font-semibold uppercase text-[#FDBA74]">
                              {user.role}
                            </p>
                          )}
                        </div>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#FDBA74]" />
                        Dashboard
                      </Link>

                      <Link
                        href="/profile-settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-[#FDBA74]" />
                        Profile Settings
                      </Link>

                      <Button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={handleLogout}
                        className="mt-1 w-full bg-[#FFF8EE] hover:bg-[#FFEDD5] text-[#B91C1C] font-bold rounded-full cursor-pointer"
                      >
                        <LogOut className="mr-1.5 h-4 w-4" />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full border-[#FFF8EE]/80 bg-transparent text-white hover:bg-[#FFF8EE] hover:text-[#B91C1C] font-semibold rounded-full"
                        >
                          Sign Up
                        </Button>
                      </Link>
                      <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-[#FFF8EE] hover:bg-[#FFEDD5] text-[#B91C1C] font-bold rounded-full">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}