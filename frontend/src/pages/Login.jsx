import { motion } from "framer-motion";
import { Cross, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return <AuthShell title="Welcome back" subtitle="Sign in to continue monitoring your skin health"><form onSubmit={submit} className="space-y-4"><input className="input" type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input className="input" type="password" required minLength={6} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="button-primary w-full"><LogIn className="h-4 w-4" />{loading ? "Signing in..." : "Login"}</button><div className="flex justify-between text-sm text-slate-500"><Link to="/forgot-password">Forgot password?</Link><Link to="/signup" className="font-semibold text-sky-700">Create account</Link></div><Link to="/admin/login" className="block text-center text-xs font-semibold text-slate-500 hover:text-sky-700">Administrator portal</Link></form></AuthShell>;
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <PageTransition>
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-white via-sky-50 to-slate-100 px-4 py-10">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="medical-card w-full max-w-md rounded-2xl p-7">
          <Link to="/" className="mb-8 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-500 text-white shadow-sm"><Cross /></span><span className="text-xl font-extrabold text-slate-950">SkinWatcher</span></Link>
          <h1 className="text-3xl font-extrabold text-slate-950">{title}</h1>
          <p className="mb-6 mt-2 text-slate-500">{subtitle}</p>
          {children}
        </motion.div>
      </main>
    </PageTransition>
  );
}
