"use client";
import { useState, useEffect } from "react";
import { useAd } from "@/context/AdContext";

const TOKEN_KEY = "movielab_admin_token";

export default function DashboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      try {
        const res = await fetch("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-zinc-500 text-center py-10">Failed to load analytics</p>;
  }

  const cards = [
    { label: "Total Page Views", value: data.totalPageViews.toLocaleString(), color: "from-blue-600/20 to-blue-900/20 border-blue-800/40" },
    { label: "Views Today", value: data.todayViews.toLocaleString(), color: "from-green-600/20 to-green-900/20 border-green-800/40" },
    { label: "Unique Pages", value: data.uniquePageCount, color: "from-purple-600/20 to-purple-900/20 border-purple-800/40" },
    { label: "Admin Users", value: data.totalUsers, color: "from-amber-600/20 to-amber-900/20 border-amber-800/40" },
    { label: "Total Errors", value: data.totalErrors, color: data.unresolvedErrors > 0 ? "from-red-600/20 to-red-900/20 border-red-800/40" : "from-zinc-600/20 to-zinc-900/20 border-zinc-800/40" },
    { label: "Unresolved Errors", value: data.unresolvedErrors, color: data.unresolvedErrors > 0 ? "from-orange-600/20 to-orange-900/20 border-orange-800/40" : "from-zinc-600/20 to-zinc-900/20 border-zinc-800/40" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border rounded-xl p-5`}
          >
            <p className="text-zinc-400 text-sm">{card.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Views (last 14 days) */}
      {data.dailyViews && data.dailyViews.length > 0 && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Daily Views (Last 14 Days)</h3>
          <div className="flex items-end gap-1.5 h-32">
            {data.dailyViews.map((d) => {
              const maxVal = Math.max(...data.dailyViews.map((x) => x.total), 1);
              const height = Math.max((d.total / maxVal) * 100, 4);
              const day = d._id.slice(5);
              return (
                <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-zinc-500">{d.total}</span>
                  <div
                    className="w-full bg-primary/60 rounded-t-md hover:bg-primary transition-colors"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-zinc-600">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Pages */}
      {data.topPages && data.topPages.length > 0 && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Top Pages (This Week)</h3>
          <div className="space-y-2">
            {data.topPages.map((p, i) => (
              <div
                key={p._id}
                className="flex items-center gap-3 bg-zinc-900/50 rounded-lg px-4 py-2.5"
              >
                <span className="text-xs text-zinc-600 w-5">{i + 1}</span>
                <span className="flex-1 text-sm text-zinc-300 truncate">{p._id}</span>
                <span className="text-sm text-primary font-medium">{p.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
