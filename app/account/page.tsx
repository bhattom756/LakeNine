
"use client";
import Image  from "next/image";
import logoimg from "@/public/loginLogo.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CgProfile } from "react-icons/cg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";


export default function MyAccountPage() {

  const {user, logout, loading} = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      console.log("Navbar: Logout button clicked");

      const loadingToast = toast.loading("Logging out...");

      await logout();

      localStorage.removeItem("userToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      sessionStorage.clear();

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Logged out successfully");

      console.log("Navbar: Logout successful, redirecting to home");

      window.location.href = "/";
    } catch (error) {
      console.error("Navbar: Logout error:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  const getUserDisplayName = () => {
    if(!user) return '';
    return user.displayName || user.email || 'user'
  }

  const getUserInitials = () => {
    if (!user) return '';
    const raw = (user.displayName || user.email || '').trim();
    if (!raw) return '';
    const base = raw.includes('@') ? raw.split('@')[0] : raw;
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    const single = parts[0] || '';
    return single.slice(0, 2).toUpperCase();
  }

  return (
  <div className="min-h-screen p-12">
    <div className="flex justify-between">
      <Link href={'/'}> <Image src={logoimg} alt="home" className="mx-5" height={40} width={40} />
      </Link>
     <p className="text-xl font-semibold shine-text">Dashboard</p>
     <div className="flex items-center gap-3 mx-5">
          {!user ? (
            <Link
              href="/login"
              className="flex min-w-[84px] max-w-[480px] glass-button cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 m-1 text-white text-sm font-medium leading-normal tracking-[0.015em] transition-all duration-300"
            >
              <span className="truncate">Sign In</span>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="border-none hover:scale-104 transition-all duration-200 hover:shadow-[0_0_12px_3px_rgba(255,255,255,0.35)]">
                  <AvatarFallback className="bg-gray-700 text-white text-sm font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dropdown-menu-content mx-11">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button>
                    <Link href="/account">Profile</Link>
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button onClick={handleLogout}>Logout</button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
    </div>
  </div>
  
  );
}
