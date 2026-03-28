import { useState } from "react";
import type { EventType } from "../types/events";

interface DashboardProps {
  onAdd: (type: EventType) => void;
  onNaturalLog: (input: string) => string | null;
}

const actions: Array<{ type: EventType; label: string; color: string }> = [
  { type: "sleep", label: "Add Sleep", color: "bg-indigo-100 text-indigo-700" },
  { type: "feed", label: "Add Feed", color: "bg-emerald-100 text-emerald-700" },
  { type: "stool", label: "Add Stool", color: "bg-amber-100 text-amber-700" },
  {
    type: "tummy",
    label: "Add Tummy Time",
    color: "bg-rose-100 text-rose-700",
  },
];

export const Dashboard = ({ onAdd, onNaturalLog }: DashboardProps) => {
  const [naturalInput, setNaturalInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const submitNaturalLog = () => {
    const result = onNaturalLog(naturalInput);
    setFeedback(result ?? "Logged successfully.");
    if (!result) setNaturalInput("");
  };

  return (
    <section className="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mb-4 border-b border-white/70 pb-4 dark:border-slate-700">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          Natural log (example: "fed 20 min at 9:30 am" or "sleep 1h at 14:00")
        </p>
        <div className="flex gap-2">
          <input
            value={naturalInput}
            onChange={(e) => setNaturalInput(e.target.value)}
            placeholder="Type a natural event..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={submitNaturalLog}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-sky-600"
          >
            Log
          </button>
        </div>
        {feedback && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {feedback}
          </p>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Today at a glance
        </h2>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Quick log
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.type}
            type="button"
            onClick={() => onAdd(action.type)}
            className="rounded-2xl border border-white/80 bg-white/70 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
          >
            <div
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${action.color}`}
            >
              {action.type}
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {action.label}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};
