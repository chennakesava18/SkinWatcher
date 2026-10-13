import { Activity, BookOpen, Cross, HeartPulse, LayoutDashboard, ScanSearch, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/predict", label: "Predict", icon: ScanSearch },
  { to: "/app/history", label: "History", icon: Activity },
  { to: "/app/learn", label: "Learn", icon: BookOpen },
  { to: "/app/doctors", label: "Doctors", icon: HeartPulse },
  { to: "/app/profile", label: "Profile", icon: UserRound }
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? [...nav, { to: "/admin", label: "Overview", icon: UsersRound }, { to: "/admin/users", label: "Users", icon: UsersRound }, { to: "/admin/doctors", label: "Doctors", icon: HeartPulse }, { to: "/admin/status", label: "Website Status", icon: ShieldCheck }, { to: "/admin/activity", label: "Activity Logs", icon: Activity }] : nav;
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-100 bg-white/95 px-3 py-2 text-slate-700 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-cyan-200/10 dark:bg-navy/90 dark:text-white lg:inset-y-0 lg:left-0 lg:right-auto lg:w-72 lg:border-r lg:border-t-0 lg:p-6 lg:shadow-none">
      <div className="mb-10 hidden items-center gap-3 lg:flex">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500 text-white shadow-sm">
          <Cross />
        </div>
        <div>
          <p className="text-xl font-extrabold">SkinWatcher</p>
          <p className="text-xs text-slate-500 dark:text-cyan-100/70">Dermatology Screening Portal</p>
        </div>
      </div>
      <nav className="flex justify-around gap-2 lg:block lg:space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                isActive ? "bg-sky-500 text-white shadow-sm" : "text-slate-600 hover:bg-sky-50 hover:text-sky-700 dark:text-cyan-50/75 dark:hover:bg-white/8 dark:hover:text-white"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 hidden rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-600 dark:border-cyan-200/10 dark:bg-white/5 dark:text-slate-300 lg:block">
        <ShieldCheck className="mb-3 h-5 w-5 text-emerald-500" />
        <p className="font-bold text-slate-900 dark:text-white">Clinical AI Support</p>
        <p className="mt-1 leading-5">Screening reports are designed for informed follow-up, not standalone diagnosis.</p>
      </div>
    </aside>
  );
}
