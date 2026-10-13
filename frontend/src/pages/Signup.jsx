import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "./Login.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(form);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return <AuthShell title="Create your account" subtitle="Start secure AI-assisted skin screening"><form onSubmit={submit} className="space-y-4"><input className="input" required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input className="input" type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input className="input" type="password" required minLength={6} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="button-primary w-full"><UserPlus className="h-4 w-4" />Signup</button><p className="text-sm text-slate-500">Already registered? <Link className="font-semibold text-sky-700" to="/login">Login</Link></p></form></AuthShell>;
}
