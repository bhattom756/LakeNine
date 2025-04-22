"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
