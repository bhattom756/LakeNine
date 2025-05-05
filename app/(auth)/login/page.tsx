"use client";

import { useEffect, useState, CSSProperties } from "react";
import { loginWithEmail, signInWithGoogle } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LoginLogo from "@/public/loginLogo.png";
import google from "@/public/google.png";
import toast, { Toaster } from 'react-hot-toast';
import { ScaleLoader } from "react-spinners";

export default function LoginPage() {
  const { user } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const spinnerOverride: CSSProperties = {
    display: "block",
    margin: "0 auto",
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !pwd) {
      toast.error("Please fill in both fields.");
      setIsLoading(false);
      return;
    }

    try {
      await loginWithEmail(email, pwd);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (err: any) {
      // Provide user-friendly error messages
      let errorMessage = "Login failed. Please try again.";
      
      if (err.code === "auth/invalid-credential") {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google successfully!");
      router.push("/");
    } catch (err: any) {
      let errorMessage = "Google sign-in failed. Please try again.";
      
      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Pop-up was blocked. Please allow pop-ups for this site.";
      } else if (err.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center bg-black text-white px-4 py-12">
        <div className="flex items-center justify-center gap-x-4">
          <Image src={LoginLogo} height={60} width={60} alt="login-image" />
          <h1 className="font-semibold text-5xl">LakeNine.Ai</h1>
        </div>
        

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-[#1a1a1a] p-12 my-8 rounded-xl w-[30rem]  space-y-4 shadow-lg"
        >
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="Your email address"
            className="w-full px-4 py-3 text-white bg-[#222630] rounded-lg border-2 border-solid border-[#2B3040] outline-none focus:border-[#596A95] transition-colors duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="Your password"
            className="w-full px-4 py-3 text-white bg-[#222630] rounded-lg border-2 border-solid border-[#2B3040] outline-none focus:border-[#596A95] transition-colors duration-200"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-white text-black py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center min-h-[40px]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <ScaleLoader
                color="#000000"
                loading={isLoading}
                height={10}
                width={10}
                aria-label="Loading Spinner"
              />
            ) : (
              "Continue"
            )}
          </button>

          {/* OR Divider */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <hr className="flex-grow border-gray-600" />
            <span>OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors min-h-[40px]"
            disabled={isLoading || isGoogleLoading}
          >
            <span className="text-lg">
              <Image src={google} height={30} width={30} alt="google-login" />
            </span>
            Continue with Google
          </button>

          {/* Sign-up Link */}
          <div className="text-center text-sm text-gray-400 mt-2">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-purple-400 hover:text-blue-300"
            >
              Sign up
            </Link>
          </div>
        </form>

        {/* Footer Terms */}
        <div className="text-md text-gray-400 text-center">
          <Link href="#" className="hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </>
  );
}
