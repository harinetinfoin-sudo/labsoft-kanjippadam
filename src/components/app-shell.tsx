"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

const publicPaths = new Set(["/", "/login", "/forgot-password", "/reset-password"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (publicPaths.has(pathname)) {
      return;
    }

    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-5 md:p-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
