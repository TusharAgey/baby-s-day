import type { BabyEvent } from "../types/events";
import { calculateDailyTypeCounts } from "../utils/analytics";

interface TrendCardsProps {
  events: BabyEvent[];
}

const trendConfig = [
  { type: "sleep" as const, title: "Sleep trend", color: "bg-indigo-400" },
  { type: "feed" as const, title: "Feed trend", color: "bg-emerald-400" },
  { type: "stool" as const, title: "Stool trend", color: "bg-amber-400" },
];

export const TrendCards = ({ events }: TrendCardsProps) => (
  <section className="grid gap-3 md:grid-cols-3">
    {trendConfig.map((trend) => {
      const items = calculateDailyTypeCounts(events, trend.type);
      const max = Math.max(...items.map((item) => item.count), 1);
      return (
        <div
          key={trend.type}
          className="rounded-3xl border border-white/70 bg-white/60 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60"
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {trend.title}
          </p>
          <div className="mt-4 flex items-end gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-20 items-end">
                  <div
                    className={`w-8 rounded-t-2xl ${trend.color}`}
                    style={{
                      height: `${Math.max((item.count / max) * 100, item.count ? 18 : 8)}%`,
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {item.count}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </section>
);
