import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Clock3, Microscope, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition.jsx";

const features = [
  ["AI Dermoscopy", "Upload lesion images for rapid benign or malignant screening.", BrainCircuit],
  ["Clinical Reports", "Receive plain-language interpretation, risk notes, and next steps.", Sparkles],
  ["Patient Timeline", "Track previous scans and compare changing lesion activity.", Clock3],
  ["Secure Portal", "JWT authentication and private prediction history.", ShieldCheck]
];

export default function Landing() {
  return (
    <PageTransition>
      <main className="text-slate-950">
        <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-sky-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-500 text-white shadow-sm"><Microscope /></div>
              <div>
                <p className="text-xl font-extrabold">SkinWatcher</p>
                <p className="text-xs text-slate-500">AI-Powered Early Skin Cancer Detection</p>
              </div>
            </div>
            <Link to="/login" className="button-secondary px-4 py-2">Login</Link>
          </nav>

          <div className="mx-auto grid max-w-7xl items-center gap-12 pt-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-kicker mb-4">Premium medical AI platform</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
                SkinWatcher
              </motion.h1>
              <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-600">
                AI-powered skin cancer detection for dermoscopic image screening, melanoma classification, subtype insight, and clinician-ready reports.
              </p>
              <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                {["Clinical workflow", "Secure records", "AI triage support"].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm">{item}</div>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/signup" className="button-primary">Get Started <ArrowRight className="h-4 w-4" /></Link>
                <a href="#learn" className="button-secondary">Learn More</a>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="medical-card relative rounded-2xl p-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-semibold text-slate-950">Live Dermoscopy Analysis</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">AI Ready</span>
                </div>
                <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-gradient-to-br from-sky-50 to-slate-100">
                  <div className="grid h-48 w-48 place-items-center rounded-full border border-sky-100 bg-white shadow-xl shadow-sky-100">
                    <Stethoscope className="h-20 w-20 text-sky-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="learn" className="page space-y-16 pb-24">
          <div className="grid gap-4 md:grid-cols-4">
            {features.map(([title, body, Icon]) => (
              <motion.div whileHover={{ y: -4 }} key={title} className="medical-card rounded-2xl p-5">
                <Icon className="mb-4 h-8 w-8 text-sky-500" />
                <h3 className="font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {["What is melanoma?", "Why early detection matters", "Built for clinical review"].map((title, index) => (
              <div key={title} className="medical-card rounded-2xl p-6">
                <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
                <p className="mt-3 leading-7 text-slate-600">
                  {index === 0 && "Melanoma can spread faster than many skin cancers, making timely recognition of changing lesions critical."}
                  {index === 1 && "Earlier dermatologist review improves treatment options and can reduce avoidable progression risk."}
                  {index === 2 && "A professional MERN platform experience with dashboards, reports, charts, auth, and AI assistance."}
                </p>
              </div>
            ))}
          </div>
        </section>
        <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">SkinWatcher (c) 2026. AI-assisted screening, not a medical diagnosis.</footer>
      </main>
    </PageTransition>
  );
}
