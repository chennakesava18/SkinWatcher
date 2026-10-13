import { Mail } from "lucide-react";
import { useState } from "react";
import api from "../services/api.js";
import { AuthShell } from "./Login.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send reset instructions.");
    } finally {
      setLoading(false);
    }
  };

  return <AuthShell title="Reset access" subtitle="Request password reset instructions"><form onSubmit={submit} className="space-y-4"><input className="input" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><button disabled={loading} className="button-primary w-full disabled:opacity-50"><Mail className="h-4 w-4" />{loading ? "Sending..." : "Send reset link"}</button>{message && <p className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-700">{message}</p>}{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}</form></AuthShell>;
}
