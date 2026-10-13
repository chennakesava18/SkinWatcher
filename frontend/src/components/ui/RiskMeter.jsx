export default function RiskMeter({ score = 0 }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="relative mx-auto h-44 w-44">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(#0EA5E9 ${clamped * 3.6}deg, #E2E8F0 0deg)` }}
      />
      <div className="absolute inset-3 grid place-items-center rounded-full bg-white text-center shadow-inner dark:bg-slate-900">
        <div>
          <p className="text-4xl font-extrabold text-slate-950 dark:text-white">{clamped}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-600 dark:text-cyan-100/70">Risk score</p>
        </div>
      </div>
    </div>
  );
}
