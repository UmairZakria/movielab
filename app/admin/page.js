"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAd } from "@/context/AdContext";
import AdminGuard from "@/app/components/AdminGuard";
import Navbar from "@/app/components/Navbar";
import DashboardTab from "@/app/components/admin/DashboardTab";
import SiteSettingsTab from "@/app/components/admin/SiteSettingsTab";
import ErrorLogsTab from "@/app/components/admin/ErrorLogsTab";
import ContentManagerTab from "@/app/components/admin/ContentManagerTab";
import {
  LayoutDashboard,
  Settings,
  Users,
  Power,
  Bug,
  Search,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
  Plus,
  Trash2,
  Save,
  ExternalLink,
} from "lucide-react";

const TOKEN_KEY = "movielab_admin_token";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "moderator"] },
  { id: "ad-config", label: "Ad Config", icon: Power, roles: ["super_admin", "moderator"] },
  { id: "users", label: "Users", icon: Users, roles: ["super_admin"] },
  { id: "site-settings", label: "Site Settings", icon: Settings, roles: ["super_admin", "moderator"] },
  { id: "content", label: "Content Manager", icon: Search, roles: ["super_admin", "moderator"] },
  { id: "error-logs", label: "Error Logs", icon: Bug, roles: ["super_admin", "moderator"] },
];

function AdConfigTab() {
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
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("moderator");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { logout } = useAd();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;

  const fetchUsers = async () => {
    if (!token) return;
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newUsername.trim() || !newPassword.trim()) {
      setError("Username and password are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`User "${data.user.username}" created (${data.user.role})`);
        setNewUsername("");
        setNewPassword("");
        setNewRole("moderator");
        fetchUsers();
      } else {
        setError(data.error || "Failed to create");
      }
    } catch {
      setError("Failed to create user");
    }
    setCreating(false);
  };

  const deleteUser = async (userId, username) => {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setSuccess(`User "${username}" deleted`);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Failed to delete user");
    }
  };

  const updateRole = async (userId, role) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        setSuccess("Role updated");
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update role");
      }
    } catch {
      setError("Failed to update role");
    }
  };

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="space-y-8">
      {/* Create User */}
      <form
        onSubmit={createUser}
        className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50 space-y-4"
      >
        <h3 className="font-semibold text-white">Create User</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Username"
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
          >
            <option value="moderator">Moderator</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg">
            {success}
          </p>
        )}
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {creating ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          {creating ? "Creating..." : "Add User"}
        </button>
      </form>

      {/* User List */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-700/50 flex items-center justify-between">
          <h3 className="font-semibold text-white">
            Users ({users.length})
          </h3>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
        <div className="divide-y divide-zinc-700/50">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{u.username}</p>
                  <p className="text-xs text-zinc-500">
                    Created {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    u.role === "super_admin"
                      ? "bg-primary/20 text-primary"
                      : "bg-zinc-700/50 text-zinc-400"
                  }`}
                >
                  {u.role === "super_admin" ? "Super Admin" : "Moderator"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {u.role !== "super_admin" && (
                  <button
                    onClick={() => updateRole(u._id, "super_admin")}
                    className="text-xs text-zinc-500 hover:text-primary transition-colors"
                    title="Promote to super admin"
                  >
                    <Shield size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteUser(u._id, u.username)}
                  className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                  title="Delete user"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-8">
              No users found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState("moderator");

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.user?.role || "moderator");
        }
      } catch (e) {}
    };
    check();
  }, []);

  const filteredTabs = tabs.filter((t) => t.roles.includes(userRole));

  const renderTab = () => {
    switch (tab) {
      case "dashboard":
        return <DashboardTab />;
      case "ad-config":
        return <AdConfigTab />;
      case "users":
        return <UsersTab />;
      case "site-settings":
        return <SiteSettingsTab userRole={userRole} />;
      case "content":
        return <ContentManagerTab />;
      case "error-logs":
        return <ErrorLogsTab userRole={userRole} />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <AdminGuard>
      <main className="w-full min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex pt-20">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-zinc-800 min-h-[calc(100vh-80px)] bg-zinc-900/30">
            <div className="px-4 py-5">
              <h2 className="text-sm font-comfortaa font-bold text-white">Admin Panel</h2>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {userRole === "super_admin" ? "Super Admin" : "Moderator"}
              </p>
            </div>
            <nav className="flex-1 px-2 space-y-0.5">
              {filteredTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    tab === t.id
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile sidebar */}
          <aside
            className={`fixed top-20 left-0 bottom-0 w-56 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform lg:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <nav className="p-3 space-y-0.5">
              {filteredTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    tab === t.id
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile top bar */}
            <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-sm font-medium text-white capitalize">{tab.replace("-", " ")}</h2>
                <p className="text-[10px] text-zinc-500">
                  {userRole === "super_admin" ? "Super Admin" : "Moderator"}
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="mb-6">
                <h1 className="text-2xl font-comfortaa font-bold capitalize hidden lg:block">
                  {tab.replace("-", " ")}
                </h1>
              </div>
              {renderTab()}
            </div>
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
