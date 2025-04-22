"use client";

import { useEffect, useState } from "react";
import { loginWithEmail, signInWithGoogle } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";

export default function LoginPage() {
  const { user } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !pwd) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      await loginWithEmail(email, pwd);
      router.push("/");
    } catch (err: any) {
      const msg = err?.message || "Login failed. Please try again.";
      setError(msg);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err: any) {
      const msg = err?.message || "Google sign-in failed.";
      setError(msg);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 p-6 rounded-md w-full max-w-sm space-y-4 shadow-md"
        >
          <h1 className="text-xl font-bold text-center">Log In</h1>

          {error && (
            <p className="text-sm text-red-500 text-center font-medium">
              {error}
            </p>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-700 rounded outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 bg-gray-700 rounded outline-none"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Log In
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 py-2 rounded hover:bg-red-700 font-semibold"
          >
            Continue with Google
          </button>

          <div className="text-center text-sm text-gray-400 mt-2">
            New user?{" "}
            <Link
              href="/signup"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Create new account
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
