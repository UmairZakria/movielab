"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function MaintenanceGuard({ children }) {
  const [maintenance, setMaintenance] = useState(null);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/admin/site-config");
        if (res.ok) {
          const data = await res.json();
          setMaintenance(data.maintenance?.enabled || false);
        }
      } catch (e) {}
      setChecking(false);
    };
    check();
  }, []);

  // Don't block admin pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/admin")) {
    return children;
  }

  if (checking) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (maintenance) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-comfortaa font-bold text-white mb-4">Under Maintenance</h1>
          <p className="text-zinc-400">The site is currently under maintenance. We'll be back shortly!</p>
        </div>
      </div>
    );
  }

  return children;
}
