"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, NETFLIX_LOGO_TEXT_URL, PROFILE_IMAGES } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isTransparent?: boolean;
}

export default function Navbar({ isTransparent = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300 px-4 lg:px-10 py-2 flex items-center justify-between",
        {
          "bg-transparent": isTransparent && !isScrolled,
          "bg-background/95 backdrop-blur-sm shadow-sm": !isTransparent || isScrolled,
        }
      )}
    >
      <div className="flex items-center gap-6">
        <Link href="/browse" className="relative h-7 w-28">
          <Image
            src={NETFLIX_LOGO_TEXT_URL}
            alt="Netflix"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm text-white/80 hover:text-white transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-sm text-white/80 hover:text-white">
                Browse <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800 text-white w-48">
              {NAV_LINKS.map((link) => (
                <DropdownMenuItem key={link.name} asChild>
                  <Link href={link.href} className="cursor-pointer w-full">
                    {link.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-white/80 hover:text-white transition">
          <Search className="h-5 w-5" />
        </button>
        <button className="text-white/80 hover:text-white transition">
          <Bell className="h-5 w-5" />
        </button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2">
              <div className="relative h-8 w-8 rounded overflow-hidden">
                <Image
                  src={PROFILE_IMAGES[0]}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <ChevronDown className="h-4 w-4 text-white/80" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white w-48">
            {PROFILE_IMAGES.slice(1, 4).map((image, index) => (
              <DropdownMenuItem key={index} className="cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 rounded overflow-hidden">
                    <Image
                      src={image}
                      alt={`Profile ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span>Profile {index + 2}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="cursor-pointer">
              <Link href="/manage-profiles" className="w-full">
                Manage Profiles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link href="/account" className="w-full">
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link href="/help" className="w-full">
                Help Center
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link href="/" className="w-full">
                Sign out of Netflix
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
