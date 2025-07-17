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
import toast, { Toaster } from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loading } = useUser();
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Ensuring that the component only renders the profile dropdown once the user state is fully loaded
  useEffect(() => {
    if (user || loading) {
      setIsUserLoaded(true);
    } else {
      setIsUserLoaded(false);
    }
  }, [user, loading]);

  const handleLogout = () => {
    logout();
    setIsUserLoaded(false);
    toast.success('Logged out successfully');
  };

  return (
    <>
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap navbar-glass px-6 sm:px-10 py-4">
      <div className="flex items-center gap-3">
        <div className="size-6 text-blue-400">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
          <Link href="/" className="hover:text-blue-300 transition-colors duration-300">LakeNine</Link>
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        {!isUserLoaded ? (
          <Link href="/login" className="flex min-w-[84px] max-w-[480px] glass-button cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 text-white text-sm font-medium leading-normal tracking-[0.015em] transition-all duration-300">
            <span className="truncate">Login</span>
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer premium-glass text-white hover:scale-105 transition-all duration-300">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-transparent">
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="premium-glass text-white w-40 mx-13 mt-1 shadow-2xl">
              <DropdownMenuItem className="hover:bg-blue-600/20 focus:bg-blue-600/20">
                <Link href="/account">My Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-600/20 focus:bg-blue-600/20">
                <Link href="/uplan">Upgrade Plan</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-blue-500/20" />
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-600/20 focus:bg-red-600/20">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="md:hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-white focus:outline-none p-2 rounded-lg glass-button hover:scale-105 transition-all duration-300"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          )}
        </button>
      </div>

    </header>
    <Toaster 
    position="top-center"
    toastOptions={{
      duration: 3000,
      style: {
        background: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        color: '#fff',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      },
    }}
  />
  </>
  );
};

export default Navbar;
