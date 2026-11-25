"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface FeatureItem {
  number: string;
  title: string;
  description: string;
  align: "left" | "right";
}

const FEATURES: FeatureItem[] = [
  {
    number: "01",
    title: "The highest quality",
    description: "Crasut nislac sapien interdum scele risque sed in elit rutrum.",
    align: "left",
  },
  {
    number: "02",
    title: "Finest Taste",
    description: "Crasut nislac sapien interdum scele risque sed in elit rutrum.",
    align: "left",
  },
  {
    number: "03",
    title: "The best ingredient",
    description: "Crasut nislac sapien interdum scele risque sed in elit rutrum.",
    align: "right",
  },
  {
    number: "04",
    title: "Well Cooked",
    description: "Crasut nislac sapien interdum scele risque sed in elit rutrum.",
    align: "right",
  },
];

export default function WhyOurPizzaBest() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 22,
    mass: 0.35,
  });

  // Scroll down করলে ওপরের লেয়ারগুলো ওপরে এবং নিচের লেয়ারগুলো নিচে খুলে যাবে
  const topLeafY = useTransform(smoothProgress, [0.12, 0.72], [32, -96]);
  const seasoningY = useTransform(smoothProgress, [0.12, 0.72], [20, -60]);
  const topSliceY = useTransform(smoothProgress, [0.12, 0.72], [10, -28]);
  const sauceY = useTransform(smoothProgress, [0.12, 0.72], [0, 8]);
  const crustY = useTransform(smoothProgress, [0.12, 0.72], [-12, 52]);

  const circleScale = useTransform(smoothProgress, [0.08, 0.68], [0.94, 1.04]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F7F2E7] min-h-[780px] lg:min-h-[860px] flex items-center py-28 md:py-36 px-4 sm:px-8 lg:px-12 select-none"
    >
      {/* Subtle decorative faint circle outlines */}
      <div className="pointer-events-none absolute -left-16 top-14 h-56 w-56 rounded-full border border-[#D4C7B0]/45" />
      <div className="pointer-events-none absolute -right-20 bottom-12 h-64 w-64 rounded-full border border-[#D4C7B0]/45" />

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="font-serif italic text-lg md:text-2xl text-[#E59A00]">
            Made with Love
          </p>
          <h2 className="mt-1 text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-[#1E232A] leading-tight">
            Why our Pizza best?
          </h2>
        </motion.div>

        {/* Centered 3-Column Layout: Left Text | Center Image | Right Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center justify-items-center gap-12 lg:gap-6">
          {/* Left Column (01 & 02) */}
          <div className="w-full lg:col-span-3 flex flex-col justify-center space-y-16 md:space-y-24 order-2 lg:order-1">
            {FEATURES.filter((item) => item.align === "left").map(
              (item, idx) => (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: idx * 0.12 }}
                  className="relative text-center lg:text-right pr-0 lg:pr-4"
                >
                  <span className="pointer-events-none block text-6xl sm:text-7xl md:text-8xl font-extrabold leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)] -mb-7 sm:-mb-9">
                    {item.number}
                  </span>
                  <h3 className="relative z-10 text-xl sm:text-2xl font-bold text-[#1E232A]">
                    {item.title}
                  </h3>
                  <p className="relative z-10 mt-2.5 text-sm leading-relaxed text-[#5A5F66] max-w-[260px] mx-auto lg:ml-auto lg:mr-0">
                    {item.description}
                  </p>
                </motion.div>
              )
            )}
          </div>

          {/* Center Column: Large Centered Yellow Circle + Exploding Pizza Layers */}
          <div className="w-full lg:col-span-6 order-1 lg:order-2 flex items-center justify-center my-2 lg:my-0">
            <div className="relative flex items-center justify-center w-[360px] h-[450px] sm:w-[460px] sm:h-[540px] md:w-[500px] md:h-[580px]">
              {/* Outer Dashed Circle */}
              <div className="pointer-events-none absolute w-[325px] h-[325px] sm:w-[410px] sm:h-[410px] md:w-[445px] md:h-[445px] rounded-full border border-dashed border-[#B8ADA0]" />

              {/* Solid Yellow Circle */}
              <motion.div
                style={{ scale: circleScale }}
                className="pointer-events-none absolute w-[290px] h-[290px] sm:w-[370px] sm:h-[370px] md:w-[400px] md:h-[400px] rounded-full bg-[#FBBF00]"
              />

              {/* Centered Exploding Pizza Layers Stack */}
              <div className="relative z-10 w-[260px] h-[400px] sm:w-[330px] sm:h-[480px] flex flex-col items-center justify-center">
                {/* 1. Top Fresh Leaf */}
                <motion.img
                  src="/leaf-vegetable.png"
                  alt="Fresh herbs"
                  style={{ y: topLeafY }}
                  className="w-20 sm:w-24 md:w-28 object-contain drop-shadow-sm pointer-events-none"
                />

                {/* 2. Herbs / Seasoning */}
                <motion.img
                  src="/pizza_02.webp"
                  alt="Seasoning"
                  style={{ y: seasoningY }}
                  className="-mt-3 w-28 sm:w-32 md:w-36 object-contain pointer-events-none"
                />

                {/* 3. Pizza Slice Top Layer */}
                <motion.img
                  src="/img-02-1.png"
                  alt="Pizza slice"
                  style={{ y: topSliceY }}
                  className="-mt-6 w-44 sm:w-52 md:w-60 object-contain drop-shadow-md pointer-events-none"
                />

                {/* 4. Tomato Sauce Layer */}
                <motion.img
                  src="/pizza_05.webp"
                  alt="Tomato sauce"
                  style={{ y: sauceY }}
                  className="-mt-9 w-44 sm:w-52 md:w-60 object-contain drop-shadow-md pointer-events-none"
                />

                {/* 5. Crispy Pizza Crust Base */}
                <motion.img
                  src="/pizza_06.webp"
                  alt="Pizza crust"
                  style={{ y: crustY }}
                  className="-mt-8 w-48 sm:w-56 md:w-64 object-contain drop-shadow-lg pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column (03 & 04) */}
          <div className="w-full lg:col-span-3 flex flex-col justify-center space-y-16 md:space-y-24 order-3">
            {FEATURES.filter((item) => item.align === "right").map(
              (item, idx) => (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: idx * 0.12 }}
                  className="relative text-center lg:text-left pl-0 lg:pl-4"
                >
                  <span className="pointer-events-none block text-6xl sm:text-7xl md:text-8xl font-extrabold leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)] -mb-7 sm:-mb-9">
                    {item.number}
                  </span>
                  <h3 className="relative z-10 text-xl sm:text-2xl font-bold text-[#1E232A]">
                    {item.title}
                  </h3>
                  <p className="relative z-10 mt-2.5 text-sm leading-relaxed text-[#5A5F66] max-w-[260px] mx-auto lg:mx-0">
                    {item.description}
                  </p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}