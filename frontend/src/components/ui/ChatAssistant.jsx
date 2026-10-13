import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

export default function ChatAssistant() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I can answer melanoma awareness and prevention questions." }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) return null;

  const send = async () => {
    if (!message.trim()) return;
    const userMessage = { role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/chat", { message });
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", text: error.response?.data?.message || "I could not reach the assistant right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.96 }} className="medical-card mb-4 flex h-[30rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-cyan-200/10">
              <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                <Bot className="h-5 w-5 text-sky-500" /> Clinical AI Assistant
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-auto p-4">
              {messages.map((item, index) => (
                <div key={index} className={`rounded-xl px-3 py-2 text-sm ${item.role === "user" ? "ml-8 bg-sky-500 text-white" : "mr-8 bg-slate-100 text-slate-700 dark:bg-white/8 dark:text-slate-200"}`}>
                  {item.text}
                </div>
              ))}
              {loading && <div className="mr-8 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-white/8 dark:text-cyan-100">Thinking...</div>}
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-3 dark:border-cyan-200/10">
              <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="input py-2" placeholder="Ask about skin cancer" />
              <button onClick={send} className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white transition hover:bg-sky-600"><Send className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((value) => !value)} className="grid h-14 w-14 place-items-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/25 transition hover:scale-105 hover:bg-sky-600">
        <Bot />
      </button>
    </div>
  );
}
