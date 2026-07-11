"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "movielab_admin_token";

export default function AdminGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setValid(true);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
      setChecking(false);
    };
    check();
  }, [router]);

  if (checking) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!valid) return null;

  return children;
}
