"use client";

import { useEffect, useState, CSSProperties } from "react";
import { loginWithEmail, signInWithGoogle, resetPassword, handleRedirectResult } from "@/lib/firebase";
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
  const [isResetLoading, setIsResetLoading] = useState(false);

  const spinnerOverride: CSSProperties = {
    display: "block",
    margin: "0 auto",
  };

  // Check for redirect result on initial load
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        setIsGoogleLoading(true);
        const result = await handleRedirectResult();
        if (result?.user) {
          toast.success("Signed in with Google successfully!");
          router.push("/");
        }
      } catch (err: any) {
        console.error("Redirect error:", err);
        let errorMessage = "Google sign-in failed. Please try again.";
        
        if (err.code === "auth/account-exists-with-different-credential") {
          errorMessage = "An account already exists with a different sign-in method.";
        } else if (err.code === "auth/network-request-failed") {
          errorMessage = "Network error. Please check your internet connection.";
        }
        
        toast.error(errorMessage);
      } finally {
        setIsGoogleLoading(false);
      }
    };
    
    checkRedirect();
  }, [router]);

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
      // This will trigger a redirect - the page will reload
      await signInWithGoogle();
      // The code below won't execute since the page will reload
    } catch (err: any) {
      setIsGoogleLoading(false);
      const errorMessage = "Failed to start Google sign-in. Please try again.";
      toast.error(errorMessage);
      console.error("Google sign-in redirect initiation error:", err);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address above", {
        id: "reset-error-email",
        duration: 4000
      });
      return;
    }
    
    // Show loading toast that we'll update later
    const loadingToastId = toast.loading("Sending password reset email...", {
      duration: 10000 // Long duration since we'll dismiss it manually
    });
    
    setIsResetLoading(true);
    
    try {
      // Validate email format client-side first
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw { code: "auth/invalid-email" };
      }
      
      // Try to send the reset email
      console.log("Attempting password reset for:", email);
      
      // Import directly from firebase to ensure we're using the right function
      const result = await resetPassword(email);
      console.log("Reset email result:", result);
      
      // Success - update the loading toast
      toast.success(`Reset link sent to ${email}. Check your inbox and spam folder.`, {
        id: loadingToastId,
        duration: 5000
      });
      
      // Clear the email field to indicate success
      setEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      // Create a detailed error log
      if (err.code) console.log("Error code:", err.code);
      if (err.message) console.log("Error message:", err.message);
      if (err.name) console.log("Error name:", err.name);
      
      // Handle specific error cases
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (err.code === "auth/user-not-found") {
        // We don't want to reveal if an email exists or not for security reasons
        // So we show a generic success message even if the email doesn't exist
        toast.success(`If an account exists for ${email}, a password reset link will be sent.`, {
          id: loadingToastId,
          duration: 5000
        });
        setIsResetLoading(false);
        return;
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.code === "auth/missing-continue-uri") {
        errorMessage = "Configuration error. Please contact support.";
      } else if (err.code === "auth/unauthorized-continue-uri") {
        errorMessage = "The redirect URL is not authorized. Please contact support.";
      } else if (err.code) {
        errorMessage = `Error: ${err.code}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      // Error - update the loading toast to error
      toast.error(errorMessage, {
        id: loadingToastId,
        duration: 4000
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center bg-black text-white px-4 py-12">
        <div className="flex items-center justify-center gap-x-4">
        <div className="size-12 text-[#135feb]">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
          </svg>
        </div>
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

          <div className="text-center text-sm text-gray-400 mt-2">
            Forget your password?{" "}
            <button
              onClick={handleResetPassword}
              className="text-purple-400 hover:text-blue-300"
              disabled={isResetLoading}
            >
              {isResetLoading ? "Sending..." : "Reset Password"}
            </button>
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
