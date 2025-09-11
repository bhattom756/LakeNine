"use client";
import { CgProfile } from "react-icons/cg";
import { useState, useEffect } from "react";
import { Menu, X, User as UserIcon, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast, { Toaster } from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loading } = useUser();
  const router = useRouter();

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
    if (!user) return "";
    return user.displayName || user.email || "User";
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap navbar-glass px-6 sm:px-10 py-[5px]">
        <div className="flex items-center gap-3">
          <div className="size-6 text-blue-400">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            <Link
              href="/"
              className="hover:text-blue-300 transition-colors duration-300"
            >
              LakeNine
            </Link>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap navbar-glass px-6 sm:px-10 py-[5px]">
        <div className="flex items-center gap-3">
          <div className="size-6 text-blue-400">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            <Link
              href="/"
              className="hover:text-blue-300 transition-colors duration-300"
            >
              LakeNine
            </Link>
          </h2>
        </div>

        <div className="flex items-center gap-3">
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
                <Avatar className="p-1">
                  <CgProfile size={22} />
                  {/* <AvatarFallback>CN</AvatarFallback> */}
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

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none p-2 rounded-lg glass-button hover:scale-105 transition-all duration-300"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6h16M4 12h16m-7 6h7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
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
            background: "rgba(10, 14, 26, 0.8)",
            backdropFilter: "blur(20px)",
            color: "#fff",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          },
        }}
      />
    </>
  );
};

export default Navbar;
