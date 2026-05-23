"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { usersAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/");
      return;
    }
    if (calledRef.current) return;
    calledRef.current = true;

    const checkAdmin = (retries = 3) => {
      usersAPI
        .getProfile()
        .then((res) => {
          router.replace(res.data.is_admin ? "/admin" : "/");
        })
        .catch(() => {
          if (retries > 0) {
            setTimeout(() => checkAdmin(retries - 1), 1000);
          } else {
            router.replace("/");
          }
        });
    };

    checkAdmin();
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}
