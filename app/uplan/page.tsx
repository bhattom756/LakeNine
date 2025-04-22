"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function UpgradePlanPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 text-black">
        <h1 className="text-2xl font-bold">Upgrade Your Plan</h1>
        <p>Choose a plan that fits your needs.</p>
      </div>
    </ProtectedRoute>
  );
}
