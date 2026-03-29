import { useEffect, useRef, useState } from "react";
import type { EventType } from "../types/events";
import { parseNaturalEvent } from "../utils/naturalParser";

interface NaturalLogFeedback {
  kind: "success" | "error";
  message: string;
}

interface DashboardProps {
  onAdd: (type: EventType) => void;
  onNaturalLog: (input: string) => NaturalLogFeedback;
  onStartActivity: (type: Extract<EventType, "sleep" | "tummy">) => void;
  onEndActivity: (type: Extract<EventType, "sleep" | "tummy">) => void;
  activeActivities: Array<{ type: "sleep" | "tummy"; startedAt: Date }>;
  suggestions?: Array<{ label: string; time: string }>;
  compact?: boolean;
  toast?: string | null;
  selectedDate: string;
}

export const Dashboard = ({
  onAdd,
  onNaturalLog,
  onStartActivity,
  onEndActivity,
  activeActivities,
  suggestions = [],
  compact = false,
  toast,
  selectedDate,
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

  const preview = naturalInput.trim()
    ? parseNaturalEvent(naturalInput, selectedDate)
    : null;

  const quickChips: Array<{ label: string; action: () => void }> = [
    { label: "Nap started", action: () => onStartActivity("sleep") },
    { label: "Nap ended", action: () => onEndActivity("sleep") },
    { label: "Fed 10 min", value: "fed 10 min" },
    { label: "Poop", value: "stool" },
    { label: "Tummy started", action: () => onStartActivity("tummy") },
    { label: "Tummy ended", action: () => onEndActivity("tummy") },
  ].map((chip) =>
    "value" in chip
      ? {
          label: chip.label,
          action: () => {
            setNaturalInput(chip.value ?? "");
            window.setTimeout(() => inputRef.current?.focus(), 0);
          },
        }
      : chip,
  );

  return (
    <section
      className={`top-2 z-20 rounded-3xl border border-white/70 bg-white/80 ${compact ? "p-3" : "p-5"} shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/85`}
    >
      <div className="mb-4 border-b border-white/70 pb-4 dark:border-slate-700">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
            Quick capture
          </span>
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.action}
              className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs text-slate-600 transition hover:border-sky-200 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
            >
              {chip.label}
            </button>
          ))}
        </div>
        {activeActivities.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {activeActivities.map((activity) => (
              <div
                key={activity.type}
                className="rounded-full bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
              >
                {activity.type} running since{" "}
                {activity.startedAt.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            ))}
          </div>
        )}
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
          {preview && naturalInput.trim() && (
            <div className="mt-2 rounded-xl border border-dashed border-sky-200 bg-white/80 px-3 py-2 text-xs text-slate-600 dark:border-sky-900/50 dark:bg-slate-900/50 dark:text-slate-300">
              {preview.success && preview.event
                ? `Will log: ${preview.event.type} at ${preview.event.timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}${preview.event.duration ? ` for ${preview.event.duration} min` : ""}`
                : preview.error}
            </div>
          )}
        </div>
      </div>

      {compact && (
        <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
          You’re in focused mode. Quick log now, review the guide on the right,
          and keep moving ✨
        </div>
      )}

      {!compact && (
        <>
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
        </>
      )}
    </section>
  );
};
