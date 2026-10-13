import { Calendar, Eye, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import api from "../services/api.js";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [params, setParams] = useState({
    q: searchParams.get("q") || "",
    result: searchParams.get("result") || "all",
    sort: searchParams.get("sort") || "desc"
  });
  const [selected, setSelected] = useState(null);

  const load = async (nextParams = params) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/history", { params: nextParams });
      setItems(data);
    } catch (requestError) {
      setItems([]);
      setError(requestError.response?.data?.message || "Unable to load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextUrlParams = {};
      if (params.q.trim()) nextUrlParams.q = params.q.trim();
      if (params.result !== "all") nextUrlParams.result = params.result;
      if (params.sort !== "desc") nextUrlParams.sort = params.sort;
      setSearchParams(nextUrlParams, { replace: true });
      load({ ...params, q: params.q.trim() }).catch(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [params.q, params.result, params.sort]);

  const remove = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this report.");
    }
  };

  return (
    <PageTransition>
      <section className="page pb-28 lg:pb-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-kicker">Clinical archive</p>
            <h1 className="page-title">Prediction Records</h1>
            <p className="page-subtitle">Search, filter, and review every AI screening record with report-level clinical context.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex min-w-72 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm dark:border-cyan-200/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-sky-600 dark:text-cyan-200" />
              <input value={params.q} onChange={(e) => setParams({ ...params, q: e.target.value })} className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white" placeholder="Search by result, subtype, or report text" />
              {params.q && <button onClick={() => setParams({ ...params, q: "" })} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"><X className="h-4 w-4" /></button>}
            </div>
            <select className="input w-40" value={params.result} onChange={(e) => setParams({ ...params, result: e.target.value })}><option value="all">All</option><option value="Benign">Benign</option><option value="Malignant">Malignant</option></select>
            <select className="input w-40" value={params.sort} onChange={(e) => setParams({ ...params, sort: e.target.value })}><option value="desc">Newest</option><option value="asc">Oldest</option></select>
          </div>
        </div>

        {error ? (
          <div className="medical-card grid min-h-80 place-items-center p-8 text-center"><div><h2 className="text-xl font-extrabold text-slate-950 dark:text-white">History unavailable</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{error}</p><button onClick={() => load()} className="button-primary mt-5">Retry</button></div></div>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
        ) : items.length ? (
          <>
            <div className="medical-card hidden overflow-hidden xl:block">
              <table className="medical-table">
                <thead>
                  <tr>
                    <th>Case image</th>
                    <th>Result</th>
                    <th>Subtype</th>
                    <th>Confidence</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td><img src={item.imageUrl} alt="Uploaded lesion" className="h-16 w-20 rounded-xl object-cover" /></td>
                      <td><Status result={item.result} /></td>
                      <td className="font-medium">{item.subtype}</td>
                      <td>{item.confidence}%</td>
                      <td><span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-sky-500" />{new Date(item.createdAt).toLocaleDateString()}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => setSelected(item)} className="button-secondary px-3 py-2"><Eye className="h-4 w-4" />View</button>
                          <button onClick={() => remove(item._id)} className="rounded-xl border border-red-100 bg-red-50 px-3 text-red-600 transition hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 xl:hidden">
              {items.map((item) => (
                <article key={item._id} className="medical-card overflow-hidden">
                  <img src={item.imageUrl} alt="Uploaded lesion" className="h-44 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between"><Status result={item.result} /><span className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span></div>
                    <p className="font-bold text-slate-950 dark:text-white">{item.confidence}% confidence</p>
                    <p className="text-sm font-medium text-sky-700 dark:text-cyan-100">{item.subtype}</p>
                    <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.explanation}</p>
                    <div className="flex gap-2"><button onClick={() => setSelected(item)} className="button-secondary flex-1 py-2"><Eye className="h-4 w-4" />View full report</button><button onClick={() => remove(item._id)} className="rounded-xl border border-red-100 bg-red-50 px-3 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button></div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="medical-card grid min-h-80 place-items-center rounded-2xl p-8 text-center">
            <div><Search className="mx-auto mb-4 h-10 w-10 text-sky-500" /><h2 className="text-xl font-extrabold text-slate-950 dark:text-white">No matching reports</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Try a different keyword, result filter, or date order.</p></div>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4" onClick={() => setSelected(null)}>
            <div className="medical-card max-h-[86vh] max-w-2xl overflow-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">{selected.result} Report</h2>
              <img src={selected.imageUrl} className="my-4 max-h-72 w-full rounded-xl object-contain" alt="Selected lesion" />
              <p className="font-bold text-slate-900 dark:text-white">{selected.confidence}% confidence - {selected.subtype}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{selected.explanation}</p>
              <button className="button-primary mt-5" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </section>
    </PageTransition>
  );
}

function Status({ result }) {
  const style = result === "Malignant" ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  return <span className={`status-pill ${style}`}>{result}</span>;
}
