"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Mail, Globe, Share2, MessageCircle, Play } from "lucide-react";

const COMPANY_LINKS_LEFT = [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Report A Bug", href: "/report-bug" },
    { label: "About Us", href: "/about" },
    { label: "Restaurant", href: "/menu" },
];

const COMPANY_LINKS_RIGHT = [
    { label: "Blogs", href: "/blogs" },
    { label: "Reservation", href: "/reservation" },
    { label: "Careers", href: "/careers" },
    { label: "Food Delivery", href: "/delivery" },
];

const OPENING_HOURS = [
    { day: "Mon - Fri", time: "8.00 - 20.00", closed: false },
    { day: "Saturday", time: "8.00 - 20.00", closed: false },
    { day: "Sunday", time: "closed", closed: true },
];

export default function Footer() {
    return (
        <footer className="relative overflow-hidden bg-[#121316] text-white">
            {/* Background Image from public/footer-bg.jpg */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/footer-bg.jpg')` }}
            />
            {/* Dark overlay for crisp readability */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-black/75"
            />

            <div className="relative z-10 mx-auto max-w-6xl pt-16 pb-8 px-4 sm:px-6 lg:px-8">
                {/* Top Row: Tagline + Accent Code on Left | Brand Logo on Right */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.55 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12"
                >
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight text-white leading-tight">
                            A Moments Of Delivered
                            <br />
                            On Right Time &amp; Place
                        </h2>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-3 shrink-0 group"
                        aria-label="Home"
                    >
                        <img
                            src="/Logo.jpg"
                            alt="Brand Logo"
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border border-white/15 shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                    </Link>
                </motion.div>

                {/* Middle Columns: Our Company | Open Hours | Contact us */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-10 py-8"
                >
                    {/* Our Company */}
                    <div className="md:col-span-5">
                        <h3 className="text-lg font-extrabold text-white mb-5">
                            Our Company
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs sm:text-sm text-gray-300">
                            <ul className="space-y-3">
                                {COMPANY_LINKS_LEFT.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="transition-colors hover:text-[#FBBF00]"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-3">
                                {COMPANY_LINKS_RIGHT.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="transition-colors hover:text-[#FBBF00]"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Open Hours */}
                    <div className="md:col-span-4">
                        <h3 className="text-lg font-extrabold text-white mb-5">
                            Open Hours
                        </h3>
                        <ul className="space-y-3.5 text-xs sm:text-sm max-w-[260px]">
                            {OPENING_HOURS.map((row) => (
                                <li
                                    key={row.day}
                                    className="flex items-baseline justify-between gap-2"
                                >
                                    <span className="text-gray-200 font-medium shrink-0">
                                        {row.day}
                                    </span>
                                    <span className="flex-1 border-b border-dotted border-gray-500/70 translate-y-[-3px]" />
                                    <span
                                        className={`shrink-0 font-medium ${row.closed ? "text-[#FBBF00]" : "text-gray-200"
                                            }`}
                                    >
                                        {row.time}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact us (Email only with mailto, no phone number) */}
                    <div className="md:col-span-3">
                        <h3 className="text-lg font-extrabold text-white mb-5">
                            Contact us
                        </h3>
                        <div className="space-y-4 text-xs sm:text-sm text-gray-300">
                            <div className="flex items-center gap-2.5">
                                <Phone className="h-4 w-4 text-[#FBBF00] shrink-0" />
                                <a
                                    href="tel:+8801945042100"
                                    className="text-gray-200 underline-offset-4 hover:text-[#FBBF00] hover:underline transition-colors"
                                >
                                    +8801945042100
                                </a>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Mail className="h-4 w-4 text-[#FBBF00] shrink-0" />
                                <a
                                    href="mailto:masum.akash1999@gmail.com"
                                    className="text-gray-200 underline-offset-4 hover:text-[#FBBF00] hover:underline transition-colors break-all"
                                >
                                    masum.akash1999@gmail.com
                                </a>
                            </div>

                            {/* Social Icons */}
                            <div className="pt-2 flex items-center gap-4 text-white">
                                <a
                                    href="#facebook"
                                    aria-label="Facebook"
                                    className="transition-colors hover:text-[#FBBF00]"
                                >
                                    <Globe className="h-4 w-4" />
                                </a>
                                <a
                                    href="#twitter"
                                    aria-label="Twitter"
                                    className="transition-colors hover:text-[#FBBF00]"
                                >
                                    <Share2 className="h-4 w-4" />
                                </a>
                                <a
                                    href="#instagram"
                                    aria-label="Instagram"
                                    className="transition-colors hover:text-[#FBBF00]"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                                <a
                                    href="#youtube"
                                    aria-label="YouTube"
                                    className="transition-colors hover:text-[#FBBF00]"
                                >
                                    <Play className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Divider & Credit Bar */}
                <div className="mt-8 border-t border-white/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-300">
                    <p>© 2026 All Rights Reserved</p>

                    <p>
                        made with{" "}
                        <a
                            href="mailto:masum.akash1999@gmail.com"
                            className="font-semibold text-[#FBBF00] underline-offset-4 hover:underline"
                        >
                            Masum Hossain
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}