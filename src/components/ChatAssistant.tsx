import { useMemo, useState } from "react";
import type { BabyEvent } from "../types/events";
import { getBabyProfile } from "../utils/profileStorage";
import { getScheduleRecommendation } from "../utils/scheduleRules";

interface ChatAssistantProps {
  events: BabyEvent[];
  selectedDate: string;
}

export const ChatAssistant = ({ events, selectedDate }: ChatAssistantProps) => {
  const [expanded, setExpanded] = useState(false);
  const selectedDay = new Date(`${selectedDate}T00:00:00`).toDateString();
  const dayEvents = useMemo(
    () =>
      events.filter((event) => event.timestamp.toDateString() === selectedDay),
    [events, selectedDay],
  );

  const recommendation = useMemo(() => {
    const profile = getBabyProfile();
    return getScheduleRecommendation(profile, dayEvents);
  }, [dayEvents]);

  return (
    <aside className="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-2 flex w-full items-center justify-between"
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Schedule Guide
        </h2>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs text-sky-700">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 lg:max-h-[52vh] lg:overflow-y-auto lg:pr-1">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {recommendation.title}
          </p>
          {recommendation.bullets.map((bullet) => (
            <div
              key={bullet}
              className="rounded-2xl border border-sky-100 bg-sky-50/80 p-3 text-sm text-slate-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-slate-200"
            >
              {bullet}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
