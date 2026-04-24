"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [watchLater, setWatchLater] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize watchLater from localStorage on mount
  useEffect(() => {
    try {
      const savedWatchLater = localStorage.getItem("movielab_watchlater");
      if (savedWatchLater) {
        setWatchLater(JSON.parse(savedWatchLater));
      }
    } catch (e) {
      console.error("Error loading watch later from localStorage:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync watchLater with localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("movielab_watchlater", JSON.stringify(watchLater));
    }
  }, [watchLater, loading]);

  const toggleWatchLater = (movie) => {
    setWatchLater((prev) => {
      const isSaved = prev.some((m) => m.id.toString() === movie.id.toString());
      if (isSaved) {
        // Remove
        return prev.filter((m) => m.id.toString() !== movie.id.toString());
      } else {
        // Add
        const newItem = {
          id: movie.id.toString(),
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          media_type: movie.media_type,
          vote_average: movie.vote_average,
          release_date: movie.release_date || movie.first_air_date,
          addedAt: new Date().toISOString(),
        };
        return [newItem, ...prev];
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        watchLater,
        toggleWatchLater,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
