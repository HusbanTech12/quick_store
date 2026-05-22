"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { usersAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/");
      return;
    }

    usersAPI
      .getProfile()
      .then((res) => {
        router.replace(res.data.is_admin ? "/admin" : "/");
      })
      .catch(() => {
        router.replace("/");
      });
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}
