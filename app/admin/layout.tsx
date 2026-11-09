import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F3EFE6] px-6 py-12 text-sm text-foreground/65">
          Loading admin console…
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

