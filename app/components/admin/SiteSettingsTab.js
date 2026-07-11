"use client";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";

const TOKEN_KEY = "movielab_admin_token";

export default function SiteSettingsTab({ userRole }) {
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [robotsEnabled, setRobotsEnabled] = useState(true);
  const [features, setFeatures] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      try {
        const res = await fetch("/api/admin/site-config", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMaintenance(data.maintenance?.enabled || false);
          setMaintenanceMsg(data.maintenance?.message || "Site is under maintenance. We'll be back soon!");
          setSeoTitle(data.seo?.title || "");
          setSeoDescription(data.seo?.description || "");
          setSeoKeywords(data.seo?.keywords?.join(", ") || "");
          setOgImage(data.seo?.ogImage || "/og-image.jpg");
          setRobotsEnabled(data.seo?.robotsEnabled !== false);
          setFeatures(data.features || {});
        }
      } catch (e) {}
    };
    fetchConfig();
  }, []);

  const toggleFeature = (key) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maintenance,
          maintenanceMessage: maintenanceMsg,
          seoTitle,
          seoDescription,
          seoKeywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          ogImage,
          robotsEnabled,
          features,
        }),
      });
      if (res.ok) {
        setMessage("Settings saved");
      } else {
        const d = await res.json();
        setMessage(d.error || "Failed to save");
      }
    } catch {
      setMessage("Failed to save");
    }
    setSaving(false);
  };

  const isSuperAdmin = userRole === "super_admin";

  return (
    <div className="space-y-8">
      {/* Maintenance Mode */}
      <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Maintenance Mode</h3>
            <p className="text-sm text-zinc-400 mt-0.5">
              When enabled, all visitors see a maintenance page
            </p>
          </div>
          <button
            onClick={() => setMaintenance(!maintenance)}
            disabled={!isSuperAdmin}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              maintenance ? "bg-primary" : "bg-zinc-600"
            } ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                maintenance ? "translate-x-7.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        {maintenance && (
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Maintenance Message</label>
            <input
              type="text"
              value={maintenanceMsg}
              onChange={(e) => setMaintenanceMsg(e.target.value)}
              disabled={!isSuperAdmin}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary disabled:opacity-50"
            />
          </div>
        )}
      </div>

      {/* SEO Settings */}
      <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50 space-y-4">
        <h3 className="font-semibold text-white">SEO Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Site Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Meta Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Keywords (comma-separated)</label>
            <input
              type="text"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">OG Image URL</label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Enable search engine indexing</span>
            <button
              onClick={() => setRobotsEnabled(!robotsEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                robotsEnabled ? "bg-primary" : "bg-zinc-600"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  robotsEnabled ? "translate-x-7.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50 space-y-4">
        <h3 className="font-semibold text-white">Feature Toggles</h3>
        <p className="text-sm text-zinc-400">Enable or disable sections of the site</p>
        <div className="space-y-3">
          {[
            { key: "searchEnabled", label: "Search" },
            { key: "discoverEnabled", label: "Discover / Browse" },
            { key: "studioEnabled", label: "Studios" },
            { key: "actorsEnabled", label: "Actors" },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between bg-zinc-900/40 rounded-lg px-4 py-3">
              <span className="text-sm text-zinc-300">{f.label}</span>
              <button
                onClick={() => toggleFeature(f.key)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  features[f.key] !== false ? "bg-primary" : "bg-zinc-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    features[f.key] !== false ? "translate-x-7.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving || !isSuperAdmin}
        className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save size={18} />
        )}
        {saving ? "Saving..." : "Save Settings"}
      </button>

      {!isSuperAdmin && (
        <p className="text-xs text-zinc-500 text-center">Only super admins can save settings</p>
      )}

      {message && (
        <p
          className={`text-sm text-center ${
            message === "Settings saved" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
