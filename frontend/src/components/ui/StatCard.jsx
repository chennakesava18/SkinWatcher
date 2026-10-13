import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, accent = "text-cyan-200" }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="medical-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{value}</p>
        </div>
        {Icon && (
          <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 ${accent}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
