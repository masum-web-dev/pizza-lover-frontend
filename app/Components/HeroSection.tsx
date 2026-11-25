"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Slices start together on the pizza (0, 0) and slide outward as you scroll down
  const slice1X = useTransform(scrollYProgress, [0, 0.85], [0, 130]);
  const slice1Y = useTransform(scrollYProgress, [0, 0.85], [0, -100]);
  const slice1Rotate = useTransform(scrollYProgress, [0, 0.85], [0, 20]);

  const slice2X = useTransform(scrollYProgress, [0, 0.85], [0, 155]);
  const slice2Y = useTransform(scrollYProgress, [0, 0.85], [0, 90]);
  const slice2Rotate = useTransform(scrollYProgress, [0, 0.85], [0, 24]);

  const slice3X = useTransform(scrollYProgress, [0, 0.85], [0, -115]);
  const slice3Y = useTransform(scrollYProgress, [0, 0.85], [0, 135]);
  const slice3Rotate = useTransform(scrollYProgress, [0, 0.85], [0, -18]);

  const garlicY = useTransform(scrollYProgress, [0, 0.85], [0, -55]);
  const chilliY = useTransform(scrollYProgress, [0, 0.85], [0, 65]);
  const leafY = useTransform(scrollYProgress, [0, 0.85], [0, -45]);
  const mushroomY = useTransform(scrollYProgress, [0, 0.85], [0, 50]);

  return (
    <div
      ref={containerRef}
      className="relative h-[165vh] bg-gradient-to-br from-[#991B1B] via-[#B91C1C] to-[#7F1D1D]"
    >
      <section className="sticky top-16 min-h-[calc(100vh-4rem)] overflow-x-clip text-[#FFF8EE] py-12 md:py-20 flex items-center">
        {/* Subtle warm radial glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#EA580C]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#FDBA74]/15 blur-3xl" />

        {/* Floating Ingredients */}
        <motion.div
          style={{ y: garlicY }}
          className="pointer-events-none hidden sm:block absolute top-10 right-[34%] w-14 h-14 md:w-16 md:h-16 opacity-90 drop-shadow-lg"
        >
          <Image src="/garlic.png" alt="Fresh Garlic" fill className="object-contain" />
        </motion.div>

        <motion.div
          style={{ y: chilliY }}
          className="pointer-events-none hidden sm:block absolute top-1/2 right-4 md:right-8 w-12 h-12 md:w-16 md:h-16 opacity-90 drop-shadow-lg"
        >
          <Image src="/red-chilli.png" alt="Red Chilli" fill className="object-contain rotate-12" />
        </motion.div>

        <motion.div
          style={{ y: leafY }}
          className="pointer-events-none hidden sm:block absolute bottom-8 left-[36%] md:left-[44%] w-14 h-14 md:w-16 md:h-16 opacity-90 drop-shadow-lg"
        >
          <Image src="/leaf-vegetable.png" alt="Fresh Basil Leaf" fill className="object-contain" />
        </motion.div>

        <motion.div
          style={{ y: mushroomY }}
          className="pointer-events-none hidden md:block absolute bottom-8 right-[8%] w-16 h-16 opacity-90 drop-shadow-lg"
        >
          <Image src="/mashroom.png" alt="Fresh Mushroom" fill className="object-contain" />
        </motion.div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF8EE]/15 border border-[#FDBA74]/40 px-4 py-1.5 text-xs md:text-sm font-semibold text-[#FDBA74]">
                <Flame className="h-4 w-4 text-[#FDBA74]" />
                <span>Wood-Fired &amp; Handcrafted Daily</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Hot &amp; Fresh Pizza{" "}
                <span className="text-[#FDBA74]">Delivered</span> to Your Door
              </h1>

              <p className="text-base md:text-lg text-[#FFF8EE]/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover local pizzerias, explore cheesy classics and gourmet
                specialties, and get hot slices delivered fast right to your
                table.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/menu">
                  <Button className="bg-[#FFF8EE] hover:bg-[#FFEDD5] text-[#B91C1C] font-extrabold text-sm md:text-base rounded-full px-7 py-6 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer">
                    Explore Pizza Menu
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/sign-up">
                  <Button
                    variant="outline"
                    className="border-[#FFF8EE]/75 bg-transparent text-white hover:bg-white/10 font-bold text-sm md:text-base rounded-full px-7 py-6 cursor-pointer"
                  >
                    Join as Vendor
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Large Interactive Scroll-Separating Pizza Showcase */}
            <div className="lg:col-span-7 flex items-center justify-center">
              <div className="relative w-[340px] h-[340px] sm:w-[450px] sm:h-[450px] md:w-[530px] md:h-[530px] lg:w-[580px] lg:h-[580px] flex items-center justify-center select-none">
                {/* Base Pizza */}
                <div className="relative w-[84%] h-[84%] rounded-full overflow-hidden shadow-2xl border-4 border-[#FDBA74]/30">
                  <Image
                    src="/img-01-1.png"
                    alt="Fresh Cheesy Pizza Base"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Slice 1: Starts aligned on top-right of the pizza, separates on scroll */}
                <motion.div
                  style={{
                    x: slice1X,
                    y: slice1Y,
                    rotate: slice1Rotate,
                  }}
                  className="absolute top-[13%] right-[13%] w-[38%] h-[38%] drop-shadow-[0_20px_28px_rgba(0,0,0,0.5)]"
                >
                  <Image
                    src="/img-02-1.png"
                    alt="Pizza Slice 1"
                    fill
                    className="object-contain"
                  />
                </motion.div>

                {/* Slice 2: Starts aligned on bottom-right of the pizza, separates on scroll */}
                <motion.div
                  style={{
                    x: slice2X,
                    y: slice2Y,
                    rotate: slice2Rotate,
                  }}
                  className="absolute bottom-[13%] right-[12%] w-[40%] h-[40%] drop-shadow-[0_20px_28px_rgba(0,0,0,0.5)]"
                >
                  <Image
                    src="/img-03-1.png"
                    alt="Pizza Slice 2"
                    fill
                    className="object-contain"
                  />
                </motion.div>

                {/* Slice 3: Starts aligned on bottom-left of the pizza, separates on scroll */}
                <motion.div
                  style={{
                    x: slice3X,
                    y: slice3Y,
                    rotate: slice3Rotate,
                  }}
                  className="absolute bottom-[13%] left-[14%] w-[38%] h-[38%] drop-shadow-[0_20px_28px_rgba(0,0,0,0.5)]"
                >
                  <Image
                    src="/img-04-1.png"
                    alt="Pizza Slice 3"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}