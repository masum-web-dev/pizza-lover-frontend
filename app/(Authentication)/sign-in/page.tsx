"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const { error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorMsg("Something went wrong while signing in.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white flex items-center justify-center px-4 py-12">
      {/* Subtle warm tint accents on white background */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-orange-100/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-100/70 blur-3xl" />

      {/* Animated Pizza & Ingredients around White Canvas */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none hidden lg:block absolute top-14 right-[7%] w-40 h-28 drop-shadow-md"
      >
        <Image
          src="/img-08-3.png"
          alt="Fresh Pizza"
          fill
          className="object-contain"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, 14, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none hidden lg:block absolute bottom-14 left-[7%] w-44 h-32 drop-shadow-md"
      >
        <Image
          src="/pizza-img-01.png"
          alt="Pizza Box"
          fill
          className="object-contain"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none hidden sm:block absolute top-16 left-[16%] w-14 h-14 md:w-16 md:h-16 drop-shadow"
      >
        <Image
          src="/garlic.png"
          alt="Garlic"
          fill
          className="object-contain"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0], rotate: [-10, 8, -10] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none hidden sm:block absolute bottom-20 right-[15%] w-12 h-12 md:w-16 md:h-16 drop-shadow"
      >
        <Image
          src="/red-chilli.png"
          alt="Red Chilli"
          fill
          className="object-contain"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [5, -8, 5] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none hidden md:block absolute top-1/2 right-[6%] w-20 h-14 drop-shadow"
      >
        <Image
          src="/pizza-01.webp"
          alt="Fresh Basil"
          fill
          className="object-contain"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 7.4, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none hidden md:block absolute top-1/2 left-[6%] w-16 h-16 drop-shadow"
      >
        <Image
          src="/mashroom.png"
          alt="Mushroom"
          fill
          className="object-contain"
        />
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="w-full border-orange-200 bg-white shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-[#B91C1C] text-white text-center space-y-2 py-6">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.05 }}
              className="mx-auto relative h-12 w-12 overflow-hidden rounded-xl border border-[#FDBA74]/60 shadow"
            >
              <Image
                src="/Logo.jpg"
                alt="PizzaHub Logo"
                fill
                className="object-cover"
              />
            </motion.div>
            <CardTitle className="text-2xl font-extrabold">
              Welcome Back to Pizza<span className="text-[#FDBA74]">Hub</span>
            </CardTitle>
            <CardDescription className="text-[#FFF8EE]/85 text-sm">
              Sign in to access your pizzas, orders, and dashboard
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm font-medium text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-800 font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-orange-200 focus-visible:ring-[#B91C1C]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-800 font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-orange-200 focus-visible:ring-[#B91C1C]"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-full py-5 shadow-md cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                New to PizzaHub?{" "}
                <Link
                  href="/sign-up"
                  className="font-bold text-[#B91C1C] hover:underline"
                >
                  Create an Account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}