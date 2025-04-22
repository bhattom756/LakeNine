"use client";

import { useState, useEffect } from "react";
import { Menu, X, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loading } = useUser(); // Assuming "loading" state exists to handle the async status
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Ensuring that the component only renders the profile dropdown once the user state is fully loaded
  useEffect(() => {
    if (user || loading) {
      setIsUserLoaded(true);
    } else {
      setIsUserLoaded(false); // Make sure to update the state when there's no user
    }
  }, [user, loading]);

  const handleLogout = () => {
    logout(); // Make sure the logout function correctly resets the user state in the context
    setIsUserLoaded(false); // Update isUserLoaded when logging out
  };

  return (
    <nav className="bg-neutral-900 fixed w-full z-50">
      <div className="max-w-[85rem] mx-auto sm:px-6 lg:px-0">
        <div className="flex justify-between h-13 items-center py-4 px-4 md:px-0">
          {/* Logo */}
          <div className="text-xl font-bold text-[rgba(255,255,255,0.8)]">
            <Link href="/">LakeNine Ai</Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {!isUserLoaded ? (
              <Link
                href="/login"
                className="text-[rgba(255,255,255,0.8)] font-bold hover:text-amber-100 transition-colors"
              >
                Login
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-neutral-800 text-white border-gray-700">
                  <DropdownMenuItem>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/uplan">Upgrade Plan</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Hamburger menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-amber-300 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-neutral-800 border-t border-gray-700 px-4 pt-2 pb-4 space-y-2">
          {!isUserLoaded ? (
            <Link
              href="/login"
              className="block text-white hover:text-amber-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          ) : (
            <div className="space-y-2">
              <Link
                href="/my-page"
                className="block text-white hover:text-amber-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Page
              </Link>
              <Link
                href="/my-account"
                className="block text-white hover:text-amber-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Account
              </Link>
              <Link
                href="/upgrade-plan"
                className="block text-white hover:text-amber-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Upgrade Plan
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block text-white hover:text-amber-300 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
