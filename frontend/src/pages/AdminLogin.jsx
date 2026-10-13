import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLogin() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form, "admin");
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Administrator login failed");
    }
  };
  return <PageTransition><main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10"><div className="w-full max-w-md rounded-2xl border border-cyan-200/20 bg-slate-900 p-7 text-white shadow-2xl"><div className="mb-8 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-400 text-slate-950"><ShieldCheck /></span><div><p className="text-xl font-extrabold">SkinWatcher Admin</p><p className="text-xs text-cyan-100/70">Website management portal</p></div></div><h1 className="text-3xl font-extrabold">Administrator sign in</h1><p className="mb-6 mt-2 text-slate-300">Manage users, doctors, and website operations.</p><form onSubmit={submit} className="space-y-4"><input className="input" type="email" required placeholder="Admin email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><input className="input" type="password" required minLength={6} placeholder="Admin password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />{error && <p className="rounded-xl border border-red-300/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p>}<button disabled={loading} className="button-primary w-full disabled:opacity-50"><KeyRound className="h-4 w-4" />{loading ? "Signing in..." : "Sign in to admin portal"}</button></form><Link to="/login" className="mt-5 block text-center text-sm text-cyan-200 hover:text-white">Return to user login</Link></div></main></PageTransition>;
}
