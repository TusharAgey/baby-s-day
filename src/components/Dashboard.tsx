import { useEffect, useRef, useState } from "react";
import type { EventType } from "../types/events";

interface NaturalLogFeedback {
  kind: "success" | "error";
  message: string;
}

interface DashboardProps {
  onAdd: (type: EventType) => void;
  onNaturalLog: (input: string) => NaturalLogFeedback;
  suggestions?: Array<{ label: string; time: string }>;
  compact?: boolean;
  toast?: string | null;
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

export const Dashboard = ({
  onAdd,
  onNaturalLog,
  suggestions = [],
  compact = false,
  toast,
}: DashboardProps) => {
  const [naturalInput, setNaturalInput] = useState("");
  const [feedback, setFeedback] = useState<NaturalLogFeedback | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submitNaturalLog = () => {
    if (!naturalInput.trim()) return;
    const result = onNaturalLog(naturalInput);
    setFeedback(result);
    if (result.kind === "success") {
      setNaturalInput("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <section
      className={`sticky top-2 z-20 rounded-3xl border border-white/70 bg-white/80 ${compact ? "p-3" : "p-5"} shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/85`}
    >
      <div className="mb-4 border-b border-white/70 pb-4 dark:border-slate-700">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
          Natural log
        </p>
        <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/70 p-3 dark:border-sky-900/60 dark:bg-sky-950/20">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitNaturalLog();
                }
              }}
              rows={2}
              placeholder={"nap 20 min, fed 5 min, sleep 9:30, stool at 11"}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-sky-900/30"
            />
            <button
              type="button"
              onClick={submitNaturalLog}
              className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700"
            >
              Log
            </button>
          </div>
          {feedback && (
            <p
              className={`mt-2 rounded-xl px-3 py-2 text-xs ${feedback.kind === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"}`}
            >
              {feedback.message}
            </p>
          )}
          {!feedback && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Try: nap 20 min · fed 5 min at 10:30 · stool loose · tummy 5 min
            </p>
          )}
          {toast && (
            <div className="mt-2 rounded-xl bg-sky-100 px-3 py-2 text-xs font-medium text-sky-700 dark:bg-sky-950/30 dark:text-sky-200">
              {toast}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Today at a glance
        </h2>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Quick log · sticky
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.type}
            type="button"
            onClick={() => onAdd(action.type)}
            className={`rounded-2xl border border-white/80 bg-white/70 ${compact ? "p-2" : "p-3"} text-left transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800`}
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
      {suggestions.length > 0 && (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Gentle suggestions
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {suggestions.map((suggestion) => (
              <div
                key={`${suggestion.label}-${suggestion.time}`}
                className="rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {suggestion.label}
                </p>
                <p className="font-medium">Around {suggestion.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
