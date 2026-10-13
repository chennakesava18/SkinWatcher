import { Camera, KeyRound, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import PageTransition from "../components/ui/PageTransition.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function Profile() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get("/profile").then(({ data }) => setProfile(data)).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load profile.")); }, []);
  if (!profile && error) return <section className="page"><div className="medical-card grid min-h-80 place-items-center p-8 text-center"><div><h1 className="text-xl font-extrabold text-slate-950 dark:text-white">Profile unavailable</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{error}</p></div></div></section>;
  if (!profile) return <section className="page"><div className="medical-card h-80 animate-pulse rounded-2xl" /></section>;

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.put("/profile", profile.user);
      setProfile({ ...profile, user: data.user });
      setUser(data.user);
      setMessage("Profile updated");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };
  const changePassword = async () => {
    setError("");
    try {
      const { data } = await api.put("/profile/password", passwords);
      setMessage(data.message);
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to change password.");
    }
  };

  return (
    <PageTransition>
      <section className="page pb-28 lg:pb-8">
        <div className="mb-7">
          <p className="page-kicker">Patient profile</p>
          <h1 className="page-title">Profile & Activity</h1>
          <p className="page-subtitle">Manage account details, review clinical screening statistics, and monitor secure activity history.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="medical-card p-6">
            <div className="flex items-center gap-4">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">{profile.user.avatar ? <img src={profile.user.avatar} className="h-full w-full object-cover" /> : <UserRound className="h-12 w-12" />}</div>
              <div><p className="text-2xl font-extrabold text-slate-950 dark:text-white">{profile.user.name}</p><p className="text-slate-500 dark:text-slate-300">{profile.user.email}</p><p className="mt-1 text-sm text-sky-700 dark:text-cyan-100/70">Joined {new Date(profile.user.joinDate).toLocaleDateString()}</p></div>
            </div>
            <div className="mt-6 space-y-3">
              <input className="input" value={profile.user.name} onChange={(e) => setProfile({ ...profile, user: { ...profile.user, name: e.target.value } })} />
              <input className="input" value={profile.user.email} onChange={(e) => setProfile({ ...profile, user: { ...profile.user, email: e.target.value } })} />
              <input className="input" placeholder="Avatar image URL" value={profile.user.avatar || ""} onChange={(e) => setProfile({ ...profile, user: { ...profile.user, avatar: e.target.value } })} />
              <button disabled={saving} onClick={save} className="button-primary w-full disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving..." : "Edit profile"}</button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard icon={Camera} label="Total scans" value={profile.stats.totalScans} accent="text-sky-500" />
              <StatCard label="Benign" value={profile.stats.benign} accent="text-emerald-500" />
              <StatCard label="Malignant" value={profile.stats.malignant} accent="text-rose-500" />
              <StatCard label="Accuracy" value={profile.stats.accuracy ? `${profile.stats.accuracy}%` : "N/A"} accent="text-sky-500" />
            </div>
            <div className="medical-card p-6">
              <h2 className="mb-4 text-xl font-extrabold text-slate-950 dark:text-white">Security Settings</h2>
              <div className="grid gap-3 md:grid-cols-2"><input type="password" className="input" placeholder="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} /><input type="password" className="input" placeholder="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} /></div>
              <button onClick={changePassword} className="button-secondary mt-4"><KeyRound className="h-4 w-4" />Update password</button>
              {message && <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
              {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            </div>
            <div className="medical-card p-6">
              <h2 className="mb-4 text-xl font-extrabold text-slate-950 dark:text-white">Recent Activity Timeline</h2>
              <div className="space-y-3">
                {profile.activities.map((a) => <div key={a._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-cyan-200/10 dark:bg-white/5"><p className="font-semibold text-slate-900 dark:text-white">{a.message}</p><p className="mt-1 text-slate-500 dark:text-slate-400">{new Date(a.createdAt).toLocaleString()}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
