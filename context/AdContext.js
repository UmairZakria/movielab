"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const AdContext = createContext();

const AD_URLS = [
  "https://youtu.be/Y9dwd5xzTzM",
  "https://youtube.com/shorts/aNzrEmXT970?feature=share",
  "https://youtu.be/kI7OZL8UGiE",
  "https://youtube.com/shorts/KI6Z_J4PJ1I?feature=share",
  "https://youtu.be/Lg7vNJHIaDE",
  "https://youtube.com/shorts/piSwV8-MVn0?feature=share",
  "https://youtu.be/mtFb7k570Rw",
  "https://youtube.com/shorts/I1vdqW5Nh1A?feature=share",
  "https://youtu.be/vmEPAscUgoA",
];

const STORAGE_KEY = "movielab_ad_logged_in";
const VISIT_KEY = "movielab_ad_visit_count";

// Pick a random threshold between 3 and 5 once per session
function getThreshold() {
  if (typeof window === "undefined") return 3;
  const stored = sessionStorage.getItem("movielab_ad_threshold");
  if (stored) return parseInt(stored, 10);
  const threshold = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
  sessionStorage.setItem("movielab_ad_threshold", String(threshold));
  return threshold;
}

export function AdProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const lastPathRef = useRef(null);
  const thresholdRef = useRef(3);

  // Load login state + set random threshold on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setLoggedIn(true);
    } catch (e) {}
    thresholdRef.current = getThreshold();
    setLoaded(true);
  }, []);

  // Track navigations and trigger ads for non-logged-in users
  useEffect(() => {
    if (!loaded) return;
    if (loggedIn) return;
    if (pathname === "/login") return;
    if (pathname === lastPathRef.current) return;

    // First navigation event that changes the page
    if (lastPathRef.current !== null) {
      let count = 0;
      try {
        count = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10);
      } catch (e) {}
      count += 1;

      if (count >= thresholdRef.current) {
        const url = AD_URLS[Math.floor(Math.random() * AD_URLS.length)];
        const win = window.open(url, "_blank");
        if (!win) {
          window.location.href = url;
        }
        try {
          localStorage.setItem(VISIT_KEY, "0");
        } catch (e) {}
        // Re-roll threshold for next cycle
        thresholdRef.current = getThreshold();
      } else {
        try {
          localStorage.setItem(VISIT_KEY, String(count));
        } catch (e) {}
      }
    }

    lastPathRef.current = pathname;
  }, [pathname, loaded, loggedIn]);

  const login = useCallback((username, password) => {
    if (username === "Rathat" && password === "Rathat@@4321") {
      setLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEY, "true");
        localStorage.removeItem(VISIT_KEY);
      } catch (e) {}
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VISIT_KEY);
      sessionStorage.removeItem("movielab_ad_threshold");
    } catch (e) {}
  }, []);

  return (
    <AdContext.Provider value={{ loggedIn, login, logout, loaded }}>
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
