"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RefreshCw, Search } from "lucide-react";

const TOKEN_KEY = "movielab_admin_token";

export default function ErrorLogsTab({ userRole }) {
  const [errors, setErrors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchErrors = async (p = 1) => {
    setLoading(true);
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const res = await fetch(`/api/admin/error-logs?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setErrors(data.errors);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchErrors(1);
  }, []);

  const markResolved = async (errorId) => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const res = await fetch("/api/admin/error-logs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ errorId, resolved: true }),
      });
      if (res.ok) {
        setErrors((prev) =>
          prev.map((e) => (e._id === errorId ? { ...e, resolved: true } : e))
        );
      }
    } catch (e) {}
  };

  const isSuperAdmin = userRole === "super_admin";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{total} total errors</p>
        <button
          onClick={() => fetchErrors(page)}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errors.length === 0 ? (
        <p className="text-zinc-500 text-center py-10">No errors logged</p>
      ) : (
        <div className="space-y-2">
          {errors.map((err) => (
            <div
              key={err._id}
              className={`bg-zinc-800/50 border rounded-xl overflow-hidden transition-colors ${
                err.resolved ? "border-zinc-700/30 opacity-60" : "border-zinc-700/50"
              }`}
            >
              <button
                onClick={() => setExpanded(expanded === err._id ? null : err._id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                {err.resolved ? (
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-500 shrink-0" />
                )}
                <span className="flex-1 text-sm text-zinc-300 truncate">
                  {err.message}
                </span>
                <span className="text-xs text-zinc-500 shrink-0">
                  {new Date(err.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs text-zinc-600 shrink-0">{err.statusCode}</span>
              </button>

              {expanded === err._id && (
                <div className="px-4 pb-4 space-y-2 border-t border-zinc-700/30 pt-3">
                  {err.url && (
                    <p className="text-xs text-zinc-400">
                      <span className="text-zinc-600">URL:</span> {err.url}
                    </p>
                  )}
                  {err.method && (
                    <p className="text-xs text-zinc-400">
                      <span className="text-zinc-600">Method:</span> {err.method}
                    </p>
                  )}
                  {err.statusCode && (
                    <p className="text-xs text-zinc-400">
                      <span className="text-zinc-600">Status:</span> {err.statusCode}
                    </p>
                  )}
                  {err.stack && (
                    <pre className="text-xs text-zinc-500 bg-zinc-900/50 rounded-lg p-3 max-h-40 overflow-auto">
                      {err.stack}
                    </pre>
                  )}
                  {!err.resolved && isSuperAdmin && (
                    <button
                      onClick={() => markResolved(err._id)}
                      className="text-xs text-green-400 hover:text-green-300 transition-colors"
                    >
                      Mark as resolved
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchErrors(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchErrors(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
