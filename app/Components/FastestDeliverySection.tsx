"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Store, UtensilsCrossed, Bike } from "lucide-react";
import toast from "react-hot-toast";

export default function FastestDeliverySection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Subscribed! Use code PIZZA10 for 10% off.");
      setEmail("");
      setIsSubmitting(false);
    }, 450);
  };

  const highlights = [
    {
      id: "time",
      label: "Delivery in\n30 minutes",
      icon: Store,
    },
    {
      id: "shipping",
      label: "Free Shipping\nFrom 75$",
      icon: UtensilsCrossed,
    },
    {
      id: "doorstep",
      label: "Delivery on\nYour Doorstep",
      icon: Bike,
    },
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Top Split Background: Cream top half + Crimson bottom half */}
      <div className="relative bg-[#F7F2E7] pt-10 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[#B91C1C]" />

        {/* Newsletter Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-2xl bg-[#1E2022] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
        >
          {/* Subtle dark culinary photo accent on right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/70 via-black/30 to-transparent"
          />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 px-6 py-7 sm:px-10 sm:py-8">
            {/* Left Copy */}
            <div className="text-center lg:text-left shrink-0">
              <p className="font-serif italic text-base sm:text-lg text-[#FBBF00]">
                Our Newsletter
              </p>
              <h3 className="mt-0.5 text-xl sm:text-2xl md:text-[26px] font-extrabold tracking-tight text-white">
                Get 10% off your order!
              </h3>
            </div>

            {/* Pill Input + Subscribe Button */}
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md items-center rounded-full border border-white/35 bg-white/5 p-1 pl-4 focus-within:border-[#FBBF00] transition-colors"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email.."
                aria-label="Enter your email"
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder:text-gray-300/80 focus:outline-none pr-2"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="shrink-0 rounded-full bg-white px-5 sm:px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#B91C1C] hover:bg-[#FBBF00] hover:text-[#1E232A] transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "..." : "SUBSCRIBE"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Main Delivery Showcase on Website Red Background */}
      <section className="relative bg-[#B91C1C] pt-8 pb-20 md:pt-12 md:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Faint decorative pizza/ingredient rings */}
        <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full border border-white/10" />

        <div className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-10">
          {/* Left Column: Yellow Medallion + Animated Delivery Scooter */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[370px] sm:h-[370px]">
              {/* Outer Dashed Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute w-[285px] h-[285px] sm:w-[355px] sm:h-[355px] rounded-full border border-dashed border-white/30"
              />

              {/* Yellow Circle */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute w-[250px] h-[250px] sm:w-[310px] sm:h-[310px] rounded-full bg-[#FBBF00] shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
              />

              {/* Animated Scooter Illustration */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                  default: { duration: 0.65 },
                }}
                className="relative z-10 w-[230px] sm:w-[285px] select-none"
              >
                <svg
                  viewBox="0 0 320 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-[0_14px_18px_rgba(0,0,0,0.22)]"
                >
                  {/* Ground shadow */}
                  <ellipse cx="160" cy="196" rx="105" ry="9" fill="rgba(0,0,0,0.16)" />

                  {/* Back Wheel */}
                  <circle cx="88" cy="164" r="28" fill="#272A2E" />
                  <circle cx="88" cy="164" r="15" fill="#9CA3AF" />
                  <circle cx="88" cy="164" r="6" fill="#272A2E" />

                  {/* Front Wheel */}
                  <circle cx="242" cy="164" r="28" fill="#272A2E" />
                  <circle cx="242" cy="164" r="15" fill="#9CA3AF" />
                  <circle cx="242" cy="164" r="6" fill="#272A2E" />

                  {/* Front Fork & Handlebar */}
                  <path
                    d="M242 164L214 78L194 74"
                    stroke="#374151"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M206 76L222 72"
                    stroke="#111827"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* Scooter Body (Coral/Pink Scooter) */}
                  <path
                    d="M78 154C78 130 105 116 135 116H198C214 116 225 127 228 144L236 156H122L108 164H82L78 154Z"
                    fill="#F47294"
                  />
                  <path
                    d="M118 146H212"
                    stroke="#FDE68A"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Insulated Pizza Delivery Box on Rear */}
                  <rect
                    x="62"
                    y="76"
                    width="58"
                    height="44"
                    rx="7"
                    fill="#FB7185"
                    stroke="#FFE4E6"
                    strokeWidth="2.5"
                  />
                  <line
                    x1="64"
                    y1="92"
                    x2="118"
                    y2="92"
                    stroke="#FFE4E6"
                    strokeWidth="2"
                  />

                  {/* Rider Legs & Shoe */}
                  <path
                    d="M152 114L172 146L198 148"
                    stroke="#2563EB"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect x="194" y="143" width="18" height="9" rx="4" fill="#1F2937" />

                  {/* Rider Torso */}
                  <path
                    d="M134 72C134 65 140 60 148 60H164C171 60 176 66 175 74L168 116H138L134 72Z"
                    fill="#F9FAFB"
                  />

                  {/* Rider Arm reaching handlebar */}
                  <path
                    d="M164 70L202 82"
                    stroke="#FDBA74"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />

                  {/* Rider Head & Helmet */}
                  <circle cx="154" cy="42" r="14" fill="#FDBA74" />
                  <path
                    d="M139 40C139 29 147 22 157 22C167 22 173 29 173 39H148L139 40Z"
                    fill="#FB7185"
                  />
                  <path d="M168 38H177" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Title, Copy & 3 Dashed Feature Boxes */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 text-center lg:text-left"
          >
            <p className="font-serif italic text-lg sm:text-xl text-[#FBBF00]">
              Fastest Delivery
            </p>
            <h2 className="mt-1 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Your Favorite Pizza,
              <br />
              on the Way!
            </h2>
            <p className="mt-4 text-xs sm:text-sm md:text-[15px] leading-relaxed text-red-50/90 max-w-lg mx-auto lg:mx-0">
              From signature oven-baked pizzas and cheesy favorites to fresh
              sides, we prepare every order hot and deliver straight to your
              doorstep.
            </p>

            {/* 3 Dashed Feature Cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {highlights.map((box, idx) => {
                const Icon = box.icon;
                return (
                  <motion.div
                    key={box.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#FBBF00]/80 bg-white/[0.04] px-3 py-5 text-center transition-colors hover:bg-white/[0.1]"
                  >
                    <Icon className="h-8 w-8 text-[#FBBF00] stroke-[1.75]" />
                    <span className="mt-3 whitespace-pre-line text-xs sm:text-[13px] font-semibold leading-snug text-white">
                      {box.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}