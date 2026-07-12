"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAd } from "@/context/AdContext";
import Navbar from "../components/Navbar";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAd();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      router.push("/");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <main className="w-full min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex items-center justify-center px-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 space-y-6"
          >
            <div className="text-center">
              <h1 className="text-2xl font-comfortaa font-bold">Movieslab</h1>
              <p className="text-zinc-400 text-sm mt-1">Admin Login</p>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <label className="text-sm text-zinc-300 font-poppins">Username</label>
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
              <label className="text-sm text-zinc-300 font-poppins">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-10 text-white outline-none focus:border-primary transition-colors"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-poppins flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="text-xs text-zinc-500 text-center">
              Authorized access only
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
