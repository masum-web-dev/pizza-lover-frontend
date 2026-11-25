"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Menu", href: "/menu" },
    { name: "Dashboard", href: "/dashboard" },
  ];

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

        {/* Right: Sign Up & Sign In */}
        <div className="hidden md:flex items-center gap-3">
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
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}