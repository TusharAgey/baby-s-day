import { useMemo } from "react";
import type { BabyEvent } from "../types/events";
import { getBabyProfile } from "../utils/profileStorage";
import { getScheduleInsights } from "../utils/scheduleInsights";

interface ChatAssistantProps {
  events: BabyEvent[];
  selectedDate: string;
  compact?: boolean;
}

export const ChatAssistant = ({
  events,
  selectedDate,
  compact = false,
}: ChatAssistantProps) => {
  const selectedDay = new Date(`${selectedDate}T00:00:00`).toDateString();
  const dayEvents = useMemo(
    () =>
      events.filter((event) => event.timestamp.toDateString() === selectedDay),
    [events, selectedDay],
  );

  const recommendation = useMemo(() => {
    const profile = getBabyProfile();
    return getScheduleInsights(profile, dayEvents);
  }, [dayEvents]);

  return (
    <aside
      className={`rounded-3xl border border-white/60 bg-white/50 ${compact ? "p-3" : "p-5"} shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-hidden`}
    >
      <div className="mb-2 flex w-full items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Schedule Guide
        </h2>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs text-sky-700">
          Always on
        </span>
      </div>

      <div className="space-y-2 lg:max-h-[52vh] lg:overflow-y-auto lg:pr-1">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {recommendation.title}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {recommendation.metrics.map((metric) => (
            <div
              key={metric.label}
              className={`rounded-2xl border border-white/70 bg-white/70 ${compact ? "p-2" : "p-3"} text-sm dark:border-slate-700 dark:bg-slate-800/60`}
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {metric.label}
              </p>
              <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
        {recommendation.messages.map((bullet) => (
          <div
            key={bullet}
            className={`rounded-2xl border border-sky-100 bg-sky-50/80 ${compact ? "p-2" : "p-3"} text-sm text-slate-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-slate-200`}
          >
            {bullet}
          </div>
        ))}
      </div>
    </aside>
  );
};
