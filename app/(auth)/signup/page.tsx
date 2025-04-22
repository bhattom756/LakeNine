"use client";
import { useState } from "react";
import { registerWithEmail, loginWithEmail } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !pwd) return setError("Email & password required");
    try {
      await registerWithEmail(email, pwd);
      router.push("/"); // Redirect to home after signup
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <form
          onSubmit={handleSignup}
          className="bg-gray-800 p-6 rounded-md w-full max-w-sm space-y-4"
        >
          <h1 className="text-xl font-bold">Sign Up</h1>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-700 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 bg-gray-700 rounded"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <button className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700">
            Create Account
          </button>
          <p className="text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-blue-400">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
