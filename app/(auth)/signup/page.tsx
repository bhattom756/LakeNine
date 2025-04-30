"use client";
import { useState, useEffect, CSSProperties } from "react";
import { registerWithEmail, loginWithEmail, signInWithGoogle } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginLogo from "@/public/loginLogo.png";
import google from "@/public/google.png";
import Image from "next/image";
import toast, { Toaster } from 'react-hot-toast';
import { ScaleLoader } from "react-spinners";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const spinnerOverride: CSSProperties = {
    display: "block",
    margin: "0 auto",
  };

  // Password strength checker
  useEffect(() => {
    if (!pwd) {
      setPasswordStrength(null);
      return;
    }

    const hasNumber = /\d/.test(pwd);
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    if (hasNumber && hasUpperCase && hasLowerCase && hasSpecialChar && isLongEnough) {
      setPasswordStrength("strong");
    } else if ((hasNumber && hasUpperCase && hasLowerCase) ||
      (hasNumber && hasUpperCase && hasSpecialChar) ||
      (hasNumber && hasLowerCase && hasSpecialChar) ||
      (hasUpperCase && hasLowerCase && hasSpecialChar)) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  }, [pwd]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !pwd) {
      toast.error("Email & password required");
      setIsLoading(false);
      return;
    }

    if (passwordStrength !== "strong") {
      toast.error("Please choose a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      await registerWithEmail(email, pwd);
      toast.success("Account created successfully!");
      router.push("/"); // Redirect to home after signup
    } catch (err: any) {
      let errorMessage = "Failed to create account. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please log in instead.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Please choose a stronger password.";
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
          <Image src={LoginLogo} height={60} width={60} alt="signup-image" />
          <h1 className="font-semibold text-5xl">LakeNine.Ai</h1>
        </div>
        <form
          onSubmit={handleSignup}
          className="bg-[#1a1a1a] p-12 my-8 rounded-xl w-[30rem] space-y-4 shadow-lg"
        >
          {error && <p className="text-red-500 text-sm">{error}</p>}

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
            placeholder="Choose a password"
            className="w-full px-4 py-3 text-white bg-[#222630] rounded-lg border-2 border-solid border-[#2B3040] outline-none focus:border-[#596A95] transition-colors duration-200"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          {/* Password Strength Indicator */}
          {pwd && (
            <div className="mt-1">
              <div className="flex items-center">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength === "weak" ? "w-1/3 bg-red-500" :
                        passwordStrength === "medium" ? "w-2/3 bg-yellow-500" :
                          passwordStrength === "strong" ? "w-full bg-green-500" : ""
                      }`}
                  ></div>
                </div>
                <span className={`ml-2 text-sm font-medium transition-all duration-300 ${passwordStrength === "weak" ? "text-red-500" :
                    passwordStrength === "medium" ? "text-yellow-500" :
                      passwordStrength === "strong" ? "text-green-500" : ""
                  }`}>
                  {passwordStrength === "weak" ? "Weak" :
                    passwordStrength === "medium" ? "Medium" :
                      passwordStrength === "strong" ? "Strong" : ""}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Password must be at least 8 characters with numbers, uppercase, lowercase, and special characters
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center min-h-[40px]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <ScaleLoader
                color="#000000"
                loading={isLoading}
                cssOverride={spinnerOverride}
                height={10}
                width={10}
                aria-label="Loading Spinner"
              />
            ) : (
              "Create Account"
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
              <Image src={google} height={30} width={30} alt="google-signup" />
            </span>
            Continue with Google
          </button>

          {/* Login Redirect */}
          <div className="text-center text-sm text-gray-400 mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-blue-300">
              Log in
            </Link>
          </div>
        </form>

        <div className="text-md text-gray-400 text-center">
          <p>By creating an account, you agree to the</p>
          <p>
            <Link href="#" className="hover:underline">Terms of Service</Link> and{' '}
            <Link href="#" className="hover:underline">Privacy Policy</Link>
          </p>
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
