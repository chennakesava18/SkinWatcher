import { motion } from "framer-motion";
import { ClipboardCheck, Download, ImagePlus, ScanSearch, ShieldAlert, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition.jsx";
import RiskMeter from "../components/ui/RiskMeter.jsx";
import api from "../services/api.js";
import { downloadReport } from "../utils/report.js";

const stages = ["Uploading image", "Processing image", "Running AI detection", "Analyzing melanoma type", "Generating Gemini explanation"];
const captureChecks = [
  "Close-up lesion fills most of the frame",
  "Photo is bright and in focus",
  "No makeup, shadows, ruler marks, or hair covering the lesion"
];
const abcdeFields = [
  { key: "asymmetry", label: "Asymmetry", prompt: "One half looks unlike the other" },
  { key: "border", label: "Border", prompt: "Edges are irregular, notched, or blurred" },
  { key: "color", label: "Color", prompt: "Multiple colors or uneven pigmentation" },
  { key: "diameter", label: "Diameter", prompt: "Larger than 6 mm or visibly growing" },
  { key: "evolving", label: "Evolving", prompt: "Changing size, shape, color, itching, or bleeding" }
];

export default function Predict() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [checks, setChecks] = useState(() => captureChecks.reduce((acc, item) => ({ ...acc, [item]: false }), {}));
  const [abcde, setAbcde] = useState(() => abcdeFields.reduce((acc, field) => ({ ...acc, [field.key]: false }), {}));
  const passedChecks = useMemo(() => Object.values(checks).filter(Boolean).length, [checks]);
  const concernCount = useMemo(() => Object.values(abcde).filter(Boolean).length, [abcde]);
  const canPredict = useMemo(() => file && !progress && passedChecks >= 2, [file, progress, passedChecks]);
  const triage = useMemo(() => getTriagePlan(result, concernCount), [result, concernCount]);

  const chooseFile = (selected) => {
    const image = selected?.[0];
    if (!image) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > 5 * 1024 * 1024) {
      setError("Upload a JPG, PNG, or WEBP image under 5 MB.");
      return;
    }
    setError("");
    setFile(image);
    setPreview(URL.createObjectURL(image));
  };

  const predict = async () => {
    setResult(null);
    setProgress(4);
    const timer = setInterval(() => {
      setProgress((value) => {
        const next = Math.min(value + 7, 94);
        setStage(stages[Math.min(stages.length - 1, Math.floor(next / 20))]);
        return next;
      });
    }, 320);
    try {
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/predict", form);
      setResult(data);
      setProgress(100);
      setStage("Prediction complete");
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed. Upload a clear skin lesion image and confirm AI vision is configured.");
    } finally {
      clearInterval(timer);
      setTimeout(() => setProgress(0), 900);
    }
  };

  return (
    <PageTransition>
      <section className="page pb-28 lg:pb-8">
        <div className="mb-7">
          <p className="page-kicker">AI detection lab</p>
          <h1 className="page-title">Predict Melanoma Risk</h1>
          <p className="page-subtitle">Upload a clear lesion image, validate capture quality, and generate a clinician-ready AI screening report.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="medical-card p-6">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Image Acquisition</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Accepted formats: JPG, PNG, WEBP up to 5 MB.</p>
            </div>
            <label onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()} className="grid min-h-80 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/70 p-5 text-center transition hover:border-sky-400 hover:bg-sky-50 dark:border-cyan-200/25 dark:bg-white/5 dark:hover:bg-cyan-200/10">
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => chooseFile(e.target.files)} />
              {preview ? <img src={preview} className="max-h-72 rounded-xl object-contain shadow-sm" alt="Skin lesion preview" /> : <div><ImagePlus className="mx-auto mb-4 h-12 w-12 text-sky-500" /><p className="font-bold text-slate-950 dark:text-white">Drag and drop dermoscopic image</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use bright, focused, close-up lesion photography</p></div>}
            </label>
            {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <p className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-900">
              SkinWatcher accepts only clear close-up skin lesion or dermoscopic images. Unrelated images are rejected before disease screening.
            </p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-200/10 dark:bg-white/5">
              <div className="mb-3 flex items-center gap-2 font-bold text-slate-950 dark:text-cyan-100"><ClipboardCheck className="h-5 w-5 text-sky-500" />Image quality gate</div>
              <div className="space-y-2">
                {captureChecks.map((item) => (
                  <label key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 dark:border-cyan-200/10 dark:bg-slate-950/20 dark:text-slate-200">
                    <input type="checkbox" checked={checks[item]} onChange={(e) => setChecks({ ...checks, [item]: e.target.checked })} className="mt-1 accent-sky-500" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{passedChecks}/3 checks passed. At least 2 are required before AI screening.</p>
            </div>
            <button disabled={!canPredict} onClick={predict} className="button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"><ScanSearch className="h-4 w-4" />Predict</button>
            {progress > 0 && <div className="mt-5"><div className="mb-2 flex justify-between text-sm text-sky-700 dark:text-cyan-100"><span>{stage}</span><span>{progress}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><motion.div className="h-full bg-sky-500" animate={{ width: `${progress}%` }} /></div></div>}
          </div>

          <div id="prediction-report" className="medical-card p-6">
            {result ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-cyan-100/70">AI-generated observation</p>
                    <h2 className={`text-4xl font-extrabold ${result.result === "Malignant" ? "text-rose-600" : "text-emerald-600"}`}>{result.result}</h2>
                  </div>
                  <button onClick={() => downloadReport("prediction-report")} className="button-secondary py-2"><Download className="h-4 w-4" />PDF Report</button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Metric label="Confidence" value={`${result.confidence}%`} />
                  <Metric label="Subtype" value={result.subtype} />
                  <Metric label="Date" value={new Date(result.createdAt).toLocaleDateString()} />
                </div>
                <RiskMeter score={result.riskScore} />
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-200/10 dark:bg-white/5">
                    <h3 className="flex items-center gap-2 font-bold text-slate-950 dark:text-cyan-100"><Stethoscope className="h-5 w-5 text-sky-500" />ABCDE observations</h3>
                    <div className="mt-4 space-y-2">
                      {abcdeFields.map((field) => (
                        <label key={field.key} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 dark:border-cyan-200/10 dark:bg-slate-950/20 dark:text-slate-200">
                          <input type="checkbox" checked={abcde[field.key]} onChange={(e) => setAbcde({ ...abcde, [field.key]: e.target.checked })} className="mt-1 accent-sky-500" />
                          <span><strong>{field.label}:</strong> {field.prompt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-xl border p-5 ${triage.tone}`}>
                    <p className="text-sm uppercase tracking-[0.18em] opacity-75">Patient triage plan</p>
                    <h3 className="mt-2 text-2xl font-extrabold">{triage.title}</h3>
                    <p className="mt-3 text-sm leading-6">{triage.body}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {triage.steps.map((step) => <li key={step} className="rounded-lg bg-white/10 p-3">{step}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-cyan-200/10 dark:bg-white/5"><h3 className="font-bold text-slate-950 dark:text-cyan-100">Gemini medical interpretation</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{result.explanation}</p></div>
                {Boolean(result.recommendations?.length) && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <h3 className="font-bold text-emerald-900">Personalized recommendations</h3>
                    <ul className="mt-3 space-y-2 text-sm text-emerald-800">
                      {result.recommendations.map((item) => <li key={item} className="rounded-lg bg-white/10 p-3">{item}</li>)}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:flex-row sm:items-center"><div><h3 className="font-bold text-sky-950">Consider professional evaluation</h3><p className="mt-1 text-sm text-sky-900">For medical advice, consult a qualified healthcare professional.</p></div><Link to="/app/doctors" className="button-primary whitespace-nowrap py-2">Consult a Doctor</Link></div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><ShieldAlert className="mb-2 h-5 w-5" />This is an AI-assisted screening tool and not a substitute for professional medical diagnosis.</div>
              </div>
            ) : (
              <div className="grid min-h-[32rem] place-items-center text-center text-slate-500"><div><ScanSearch className="mx-auto mb-4 h-14 w-14 text-sky-500" /><p className="font-semibold text-slate-950 dark:text-white">Upload an image to generate a full prediction report.</p><p className="mt-2 text-sm">Your AI analysis, risk score, and triage plan will appear here.</p></div></div>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

function Metric({ label, value }) {
  return <div className="metric-tile"><p className="text-xs uppercase tracking-[0.18em] text-sky-600">{label}</p><p className="mt-2 font-bold text-slate-950 dark:text-white">{value}</p></div>;
}

function getTriagePlan(result, concernCount) {
  if (!result) return { title: "", body: "", steps: [], tone: "" };
  if (result.result === "Malignant" || result.riskScore >= 70 || concernCount >= 3) {
    return {
      title: "High-priority clinical review",
      body: "The AI result or your ABCDE observations suggest this lesion should be reviewed promptly by a qualified clinician.",
      tone: "border-rose-200 bg-rose-50 text-rose-900",
      steps: ["Book a dermatology appointment as soon as possible.", "Save this report and bring the original image to the visit.", "Avoid scratching, treating, or covering the lesion before assessment."]
    };
  }
  if (result.riskScore >= 35 || concernCount >= 1) {
    return {
      title: "Monitor and schedule routine review",
      body: "The current screen is not in the highest-risk band, but continued observation is useful because lesion changes matter.",
      tone: "border-amber-200 bg-amber-50 text-amber-900",
      steps: ["Retake a comparable photo in 30 days.", "Track any change in size, color, border, itching, or bleeding.", "Seek medical advice sooner if new ABCDE signs appear."]
    };
  }
  return {
    title: "Routine skin awareness",
    body: "The scan and your observations look lower risk, so the focus is prevention and consistent self-checks.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    steps: ["Keep monthly skin self-checks on your calendar.", "Use sun protection and avoid tanning beds.", "Repeat screening if the lesion changes or symptoms appear."]
  };
}
