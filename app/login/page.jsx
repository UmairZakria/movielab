"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAd } from "@/context/AdContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAd();
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const success = login(username, password);
    if (success) {
      router.push("/");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <main className="w-full min-h-screen bg-black text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-comfortaa font-bold">MovieLab</h1>
          <p className="text-zinc-400 text-sm mt-1">Admin Login</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-poppins">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
            placeholder="Enter username"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-poppins">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity font-poppins"
        >
          Sign In
        </button>

        <p className="text-xs text-zinc-600 text-center">
          Authorized access only
        </p>
      </form>
    </main>
  );
}
