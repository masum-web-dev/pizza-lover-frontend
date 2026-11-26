"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "1",
    quote:
      "Everything about our experience was amazing, from pulling up to the valet, to the spectacular views.",
    name: "Simon Pierro",
    role: "Founder",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: "2",
    quote:
      "Without fit food, we would have gone bankrupt by now. Thanks for food! The service was excellent. Love!",
    name: "Garrison Lewis",
    role: "Manager and founder",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: "3",
    quote:
      "This is an excellent restaurant with a gourmet kitchen where the only work the best professionals",
    name: "Arden Burton",
    role: "Manager",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: "4",
    quote:
      "Crispy crust, rich melted cheese, and super fast delivery every single time. Truly our go-to pizza spot.",
    name: "Tariq Mahmud",
    role: "Food Blogger",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: "5",
    quote:
      "Fresh ingredients and authentic flavors that stand out immediately. Every order feels made with real care.",
    name: "Nadia Rahman",
    role: "Regular Customer",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: "6",
    quote:
      "Great portion sizes, bold sauce flavor, and consistent quality across every visit with family and friends.",
    name: "Daniel Brooks",
    role: "Event Host",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80",
  },
];

export default function WhyClientsChooseUs() {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const updateCarouselState = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
    };

    updateCarouselState();
    api.on("select", updateCarouselState);
    api.on("reInit", updateCarouselState);

    return () => {
      api.off("select", updateCarouselState);
      api.off("reInit", updateCarouselState);
    };
  }, [api]);

  return (
    <section className="relative overflow-hidden bg-[#B91C1C] py-20 md:py-28 px-4 sm:px-6 lg:px-8 select-none">
      {/* Subtle decorative rings on crimson background */}
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full border border-white/10" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 md:mb-16"
        >
          <p className="font-serif italic text-lg md:text-xl text-[#FBBF00]">
            Our Testimonials
          </p>
          <h2 className="mt-1 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Why Clients Choose Us
          </h2>
        </motion.div>

        {/* Shadcn Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1 }}
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6 items-center">
              {TESTIMONIALS.map((item, idx) => {
                const isHighlighted = idx === 1;

                return (
                  <CarouselItem
                    key={item.id}
                    className="pl-4 md:pl-6 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <motion.div
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.25 }}
                      className={`group flex flex-col items-center text-center transition-all duration-300 ${
                        isHighlighted
                          ? "rounded-3xl bg-white px-6 py-8 shadow-[0_24px_50px_rgba(0,0,0,0.22)]"
                          : "rounded-3xl px-5 py-7 hover:bg-white/10"
                      }`}
                    >
                      {/* Avatar + Amber Quote Badge */}
                      <div className="relative mb-6">
                        <div
                          className={`relative h-24 w-24 overflow-hidden rounded-full border-4 shadow-md ${
                            isHighlighted
                              ? "border-[#F7F2E7]"
                              : "border-white/90"
                          }`}
                        >
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <span className="absolute -right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FBBF00] text-white shadow-sm">
                          <Quote className="h-4 w-4 fill-current" />
                        </span>
                      </div>

                      {/* Quote Text */}
                      <p
                        className={`text-sm sm:text-[15px] leading-relaxed max-w-[270px] ${
                          isHighlighted ? "text-gray-600" : "text-red-50/95"
                        }`}
                      >
                        “{item.quote}”
                      </p>

                      {/* Author Name & Role */}
                      <h3
                        className={`mt-5 text-base sm:text-lg font-extrabold ${
                          isHighlighted ? "text-[#B91C1C]" : "text-[#FBBF00]"
                        }`}
                      >
                        {item.name}
                      </h3>
                      <p
                        className={`mt-0.5 text-xs ${
                          isHighlighted ? "text-gray-500" : "text-red-100/80"
                        }`}
                      >
                        {item.role}
                      </p>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-6 h-10 w-10 border-white/25 bg-white/15 text-white hover:bg-white hover:text-[#B91C1C]" />
            <CarouselNext className="hidden sm:flex -right-4 lg:-right-6 h-10 w-10 border-white/25 bg-white/15 text-white hover:bg-white hover:text-[#B91C1C]" />
          </Carousel>

          {/* Dot Indicators */}
          <div className="mt-10 flex items-center justify-center gap-2.5">
            {Array.from({ length: snapCount }).map((_, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-6 bg-[#FBBF00]"
                      : "w-2.5 bg-white/40 hover:bg-white/75"
                  }`}
                />
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}