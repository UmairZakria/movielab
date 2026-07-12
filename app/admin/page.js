"use client";
import { useState, useEffect } from "react";
import AdminGuard from "@/app/components/AdminGuard";
import Navbar from "@/app/components/Navbar";
import {
  Power,
  Plus,
  Trash2,
  Save,
  ExternalLink,
} from "lucide-react";

const TOKEN_KEY = "movielab_admin_token";

export default function AdminPage() {
  const [enabled, setEnabled] = useState(true);
  const [adUrls, setAdUrls] = useState([]);
  const [minThresh, setMinThresh] = useState(3);
  const [maxThresh, setMaxThresh] = useState(5);
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/ad-config")
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled);
        setAdUrls(data.adUrls || []);
        setMinThresh(data.minThreshold);
        setMaxThresh(data.maxThreshold);
      })
      .catch(() => {});
  }, []);

  const addUrl = () => {
    const url = newUrl.trim();
    if (!url) return;
    if (adUrls.includes(url)) return;
    setAdUrls([...adUrls, url]);
    setNewUrl("");
  };

  const removeUrl = (index) => {
    setAdUrls(adUrls.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch("/api/admin/ad-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled,
          adUrls,
          minThreshold: minThresh,
          maxThreshold: maxThresh,
        }),
      });
      if (res.ok) {
        setMessage("Saved successfully");
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save");
      }
    } catch {
      setMessage("Failed to save");
    }
    setSaving(false);
  };

  return (
    <AdminGuard>
      <main className="w-full min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
          <div className="mb-8">
            <h1 className="text-3xl font-comfortaa font-bold">Admin</h1>
            <p className="text-zinc-400 text-sm mt-1">Ad Configuration</p>
          </div>

          <div className="space-y-8">
            {/* Toggle */}
            <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
              <div>
                <h3 className="font-semibold text-white">Ad Popups</h3>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {enabled
                    ? "Ads will show to non-logged-in users"
                    : "No ads will be shown to anyone"}
                </p>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  enabled ? "bg-primary" : "bg-zinc-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    enabled ? "translate-x-7.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Thresholds */}
            <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50 space-y-4">
              <h3 className="font-semibold text-white">Visit Threshold</h3>
              <p className="text-sm text-zinc-400">
                Ads trigger after a random number of page visits between min and max.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Min visits</label>
                  <input
                    type="number"
                    min={1}
                    max={maxThresh}
                    value={minThresh}
                    onChange={(e) => setMinThresh(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Max visits</label>
                  <input
                    type="number"
                    min={minThresh}
                    max={50}
                    value={maxThresh}
                    onChange={(e) => setMaxThresh(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Ad URLs */}
            <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50 space-y-4">
              <h3 className="font-semibold text-white">Ad URLs</h3>
              <p className="text-sm text-zinc-400">
                One random URL is opened per ad trigger.
              </p>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addUrl()}
                  placeholder="https://youtube.com/..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={addUrl}
                  className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {adUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-zinc-900/50 rounded-lg px-3 py-2 group"
                  >
                    <span className="text-xs text-zinc-600 w-5">{i + 1}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-zinc-300 truncate hover:text-primary transition-colors"
                    >
                      {url}
                    </a>
                    <ExternalLink size={14} className="text-zinc-600 shrink-0" />
                    <button
                      onClick={() => removeUrl(i)}
                      className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {adUrls.length === 0 && (
                  <p className="text-sm text-zinc-600 italic">No URLs added yet</p>
                )}
              </div>
            </div>

            {/* Save */}
            <button
              onClick={save}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Configuration"}
            </button>

            {message && (
              <p
                className={`text-sm text-center ${
                  message === "Saved successfully"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
