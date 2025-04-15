"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-neutral-900 fixed w-full z-50">
      <div className="max-w-[85rem] mx-auto  sm:px-6 lg:px-0">
        <div className="flex justify-between h-13 items-center">
          <div className="text-xl font-bold  text-[rgba(255,255,255,0.8)]">
            LakeNine Ai
          </div>
          <div className="hidden md:flex space-x-6">
            <HoverCard>
              <HoverCardTrigger asChild>
                <a
                  href="/login"
                  className="text-[rgba(255,255,255,0.8)] font-bold hover:text-amber-100 transition-colors"
                >
                  Login
                </a>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 backdrop-blur-md bg-white/10 border border-white/30 rounded-lg shadow-lg text-white">
                <p className="text-sm">
                  Access your account to manage preferences, view history, and
                  more.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (No HoverCard on mobile for simplicity) */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md px-4 pt-2 pb-4 space-y-2">
          <a
            href="/login"
            className="block text-gray-700 hover:text-indigo-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Login
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
