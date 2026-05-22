"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setClerkToken } from "@/lib/clerk-token";

function ClerkTokenSetter({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then(setClerkToken);
    const interval = setInterval(() => {
      getToken().then(setClerkToken);
    }, 60000);
    return () => clearInterval(interval);
  }, [getToken]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ClerkTokenSetter>
        {children}
      </ClerkTokenSetter>
    </ClerkProvider>
  );
}
