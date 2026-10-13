import { BookOpen, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageTransition from "../components/ui/PageTransition.jsx";
import api from "../services/api.js";

const categories = ["all", "Basics", "Symptoms", "Prevention", "Treatment", "AI Research"];

export default function Learn() {
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get("/blogs", { params: { category } })
      .then(({ data }) => setPosts(data))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load education articles."))
      .finally(() => setLoading(false));
  }, [category]);
  const filtered = useMemo(() => posts.filter((p) => `${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase())), [posts, q]);

  const summarize = async (post) => {
    setSummaryLoading(post._id);
    try {
      const { data } = await api.post(`/blogs/${post._id}/summary`);
      setPosts((prev) => prev.map((item) => item._id === post._id ? { ...item, summary: data.summary } : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to generate the article summary.");
    } finally {
      setSummaryLoading(null);
    }
  };

  return (
    <PageTransition>
      <section className="page pb-28 lg:pb-8">
        <div className="mb-6"><p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Education center</p><h1 className="mt-2 text-3xl font-extrabold">Learn About Melanoma</h1></div>
        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-cyan-200/15 bg-white/5 px-3"><Search className="h-4 w-4" /><input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="Search blog posts" /></div>
          <div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${category === item ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-cyan-100 hover:bg-white/10"}`}>{item}</button>)}</div>
        </div>
        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div className="medical-card h-64 animate-pulse" /><div className="medical-card h-64 animate-pulse" /><div className="medical-card h-64 animate-pulse" /></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => (
            <article key={post._id} className="glass rounded-xl p-5">
              <BookOpen className="mb-4 h-8 w-8 text-cyan-200" />
              <span className="rounded-full bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">{post.category}</span>
              <h2 className="mt-4 text-xl font-extrabold">{post.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm text-slate-300">{post.excerpt}</p>
              <div className="mt-5 flex gap-2"><button className="button-primary flex-1 py-2" onClick={() => setOpen(post)}>Read More</button><button disabled={summaryLoading === post._id} className="button-secondary py-2 disabled:opacity-50" onClick={() => summarize(post)}><Sparkles className="h-4 w-4" />{summaryLoading === post._id ? "Working..." : "Summary"}</button></div>
              {post.summary && <p className="mt-4 rounded-lg bg-white/5 p-3 text-sm text-cyan-100">{post.summary}</p>}
            </article>
          ))}
        </div>}
        {!loading && !error && !filtered.length && <div className="medical-card mt-4 grid min-h-48 place-items-center p-8 text-center text-sm text-slate-500 dark:text-slate-300">No education articles match this search.</div>}
        {open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4" onClick={() => setOpen(null)}><div className="glass max-w-2xl rounded-xl p-6" onClick={(e) => e.stopPropagation()}><p className="text-sm text-cyan-100">{open.category} · {open.readTime}</p><h2 className="mt-2 text-3xl font-extrabold">{open.title}</h2><p className="mt-4 leading-7 text-slate-300">{open.content}</p><button className="button-primary mt-6" onClick={() => setOpen(null)}>Close</button></div></div>}
      </section>
    </PageTransition>
  );
}
