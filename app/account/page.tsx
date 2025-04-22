
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyAccountPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 text-black">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p>Your profile, settings, and preferences go here.</p>
      </div>
    </ProtectedRoute>
  );
}
