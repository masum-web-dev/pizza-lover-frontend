"use client";

import React from "react";
import { motion } from "framer-motion";

interface PopularDish {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  column: "left" | "right";
}

const POPULAR_DISHES: PopularDish[] = [
  {
    id: "1",
    name: "Classic Margherita Slice",
    price: "$44.95",
    description:
      "Hand-tossed dough, vine-ripened tomato sauce, fresh mozzarella, basil",
    image: "/img-02-1.png",
    column: "left",
  },
  {
    id: "2",
    name: "Smoky Pepperoni Feast",
    price: "$50.00",
    description:
      "Crispy pepperoni, melted cheddar & mozzarella, oregano herb blend",
    image: "/img-02-1.png",
    column: "left",
  },
  {
    id: "3",
    name: "Specialty of the House",
    price: "$48.75",
    description:
      "Artisan crust, roasted peppers, black olives, savory house sauce",
    image: "/img-02-1.png",
    column: "left",
  },
  {
    id: "4",
    name: "Pizza Quattro Stagioni",
    price: "$39.50",
    description:
      "Four-season toppings, aged parmesan, sweet basil, olive oil drizzle",
    image: "/img-02-1.png",
    column: "left",
  },
  {
    id: "5",
    name: "2X Family Pizza Combo",
    price: "$55.40",
    description:
      "Double cheesy slices, garlic herb crust, zesty marinara dip",
    image: "/img-02-1.png",
    column: "left",
  },
  {
    id: "6",
    name: "Classic Margherita Slice",
    price: "$44.95",
    description:
      "Hand-tossed dough, vine-ripened tomato sauce, fresh mozzarella, basil",
    image: "/img-02-1.png",
    column: "right",
  },
  {
    id: "7",
    name: "Smoky Pepperoni Feast",
    price: "$50.00",
    description:
      "Crispy pepperoni, melted cheddar & mozzarella, oregano herb blend",
    image: "/img-02-1.png",
    column: "right",
  },
  {
    id: "8",
    name: "Specialty of the House",
    price: "$48.75",
    description:
      "Artisan crust, roasted peppers, black olives, savory house sauce",
    image: "/img-02-1.png",
    column: "right",
  },
  {
    id: "9",
    name: "Pizza Quattro Stagioni",
    price: "$39.50",
    description:
      "Four-season toppings, aged parmesan, sweet basil, olive oil drizzle",
    image: "/img-02-1.png",
    column: "right",
  },
  {
    id: "10",
    name: "2X Family Pizza Combo",
    price: "$55.40",
    description:
      "Double cheesy slices, garlic herb crust, zesty marinara dip",
    image: "/img-02-1.png",
    column: "right",
  },
];

function DishRow({
  dish,
  index,
}: {
  dish: PopularDish;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ x: 4 }}
      className="group flex items-center gap-4 rounded-xl p-1.5 transition-colors hover:bg-[#FAF5EB]/70"
    >
      <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full bg-[#FAF5EB] border border-orange-100 shadow-xs">
        <img
          src={dish.image}
          alt={dish.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm sm:text-base font-bold text-[#1E232A] shrink-0 group-hover:text-[#B91C1C] transition-colors">
            {dish.name}
          </h3>
          <span className="flex-1 border-b border-dotted border-gray-300 translate-y-[-3px]" />
          <span className="text-sm sm:text-base font-extrabold text-[#1E232A] shrink-0">
            {dish.price}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500 truncate sm:whitespace-normal">
          {dish.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function MostPopularDishes() {
  const leftDishes = POPULAR_DISHES.filter((d) => d.column === "left");
  const rightDishes = POPULAR_DISHES.filter((d) => d.column === "right");

  return (
    <section className="relative overflow-hidden bg-[#F7F2E7] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Bottom crimson accent band matching reference */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[#B91C1C]" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-5xl rounded-[28px] bg-white px-6 py-12 sm:px-10 sm:py-14 md:px-14 md:py-16 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
      >
        {/* Subtle decorative line-art sketches */}
        <img
          src="/mashroom.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none hidden sm:block absolute -top-6 left-1/3 h-14 w-14 object-contain opacity-20 grayscale"
        />
        <img
          src="/pizza_06.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none hidden md:block absolute top-6 right-8 h-24 w-24 object-contain opacity-15 grayscale"
        />
        <img
          src="/leaf-vegetable.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none hidden sm:block absolute -bottom-5 left-1/4 h-12 w-12 object-contain opacity-20 grayscale"
        />
        <img
          src="/garlic.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none hidden sm:block absolute -bottom-5 right-12 h-14 w-14 object-contain opacity-20 grayscale"
        />

        {/* Section Header */}
        <div className="mb-10 sm:mb-12">
          <p className="font-serif italic text-base sm:text-lg text-[#E59A00]">
            Why Choose Us
          </p>
          <h2 className="mt-0.5 text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight text-[#1E232A]">
            Most Popular Dishes
          </h2>
        </div>

        {/* Two-Column Menu List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-5">
          <div className="space-y-4">
            {leftDishes.map((dish, idx) => (
              <DishRow key={dish.id} dish={dish} index={idx} />
            ))}
          </div>

          <div className="space-y-4">
            {rightDishes.map((dish, idx) => (
              <DishRow key={dish.id} dish={dish} index={idx} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}