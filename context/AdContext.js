"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const AdContext = createContext();

const VISIT_KEY = "movielab_ad_visit_count";
const TOKEN_KEY = "movielab_admin_token";

export function AdProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    adUrls: [],
    minThreshold: 3,
    maxThreshold: 5,
  });
  const pathname = usePathname();
  const lastPathRef = useRef(null);

  // Load login state + fetch config on mount
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) setLoggedIn(true);
      } catch (e) {}
      try {
        const res = await fetch("/api/admin/ad-config");
        if (res.ok) {
          const data = await res.json();
          if (data.adUrls.length > 0) setConfig(data);
        }
      } catch (e) {
        // fallback to defaults
      }
      setLoaded(true);
    };
    load();
  }, []);

  // Track navigations and trigger ads for non-logged-in users
  useEffect(() => {
    if (!loaded) return;
    if (loggedIn) return;
    if (pathname === "/login" || pathname === "/admin") return;
    if (pathname === lastPathRef.current) return;
    if (!config.enabled || config.adUrls.length === 0) return;

    if (lastPathRef.current !== null) {
      let count = 0;
      try {
        count = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10);
      } catch (e) {}
      count += 1;

      const threshold =
        Math.floor(
          Math.random() *
            (config.maxThreshold - config.minThreshold + 1),
        ) + config.minThreshold;

      if (count >= threshold) {
        const url =
          config.adUrls[Math.floor(Math.random() * config.adUrls.length)];
        const win = window.open(url, "_blank");
        if (!win) window.location.href = url;
        try {
          localStorage.setItem(VISIT_KEY, "0");
        } catch (e) {}
      } else {
        try {
          localStorage.setItem(VISIT_KEY, String(count));
        } catch (e) {}
      }
    }

    lastPathRef.current = pathname;
  }, [pathname, loaded, loggedIn, config]);

  // Track page views for analytics (all visitors, not just logged in)
  useEffect(() => {
    if (!loaded) return;
    if (pathname === "/login" || pathname === "/admin") return;
    if (pathname === lastPathRef.current) return;

    // Fire and forget - silently track page view
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname, loaded]);

  const login = useCallback(async (username, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;
      const { token } = await res.json();
      setLoggedIn(true);
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.removeItem(VISIT_KEY);
      } catch (e) {}
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setLoggedIn(false);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(VISIT_KEY);
    } catch (e) {}
  }, []);

  return (
    <AdContext.Provider value={{ loggedIn, login, logout, loaded, config }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAd() {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error("useAd must be used within AdProvider");
  return ctx;
}

export { AdContext };
