import { Bell, LogOut, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = q.trim();
    navigate(query ? `/app/history?q=${encodeURIComponent(query)}` : "/app/history");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/85 px-4 py-4 text-slate-800 shadow-sm backdrop-blur-xl dark:border-cyan-200/10 dark:bg-navy/80 dark:text-white lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={submitSearch} className="hidden max-w-md flex-1 items-center gap-3 rounded-lg border border-sky-100 bg-slate-50 px-3 py-2 shadow-inner md:flex dark:border-cyan-200/10 dark:bg-white/5">
          <Search className="h-4 w-4 text-sky-600 dark:text-cyan-200" />
          <input value={q} onChange={(event) => setQ(event.target.value)} className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-white" placeholder="Search scans, reports, insights" />
        </form>
        <div className="ml-auto flex items-center gap-3">
          <button aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-lg border border-sky-100 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700 dark:border-cyan-200/15 dark:bg-white/5 dark:text-white dark:hover:bg-cyan-200/10">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)} className="relative grid h-10 w-10 place-items-center rounded-lg border border-sky-100 bg-white text-slate-600 shadow-sm dark:border-cyan-200/15 dark:bg-white/5 dark:text-white">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-cyan-100/60">{user?.email}</p>
          </div>
          <button aria-label="Log out" onClick={logout} className="grid h-10 w-10 place-items-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-100 dark:hover:bg-red-400/20">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      {notificationsOpen && (
        <div className="absolute right-4 top-20 w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-lg dark:border-cyan-200/15 dark:bg-slate-900 dark:text-slate-200 lg:right-8">
          <p className="font-bold text-slate-900 dark:text-white">Notifications</p>
          <p className="mt-1">No new notifications.</p>
        </div>
      )}
    </header>
  );
}
