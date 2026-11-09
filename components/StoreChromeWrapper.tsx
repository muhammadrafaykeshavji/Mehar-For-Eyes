"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface StoreChromeWrapperProps {
  children: ReactNode;
}

export function StoreChromeWrapper({ children }: StoreChromeWrapperProps) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return <>{children}</>;
}

