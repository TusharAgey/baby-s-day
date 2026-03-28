import type { BabyEvent } from "../types/events";
import { calculateWakeWindows, formatDuration } from "../utils/analytics";

interface SummaryCardsProps {
  events: BabyEvent[];
  selectedDate: string;
}

const cardBase =
  "rounded-3xl border border-white/60 bg-white/50 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60";

export const SummaryCards = ({ events, selectedDate }: SummaryCardsProps) => {
  const today = new Date(`${selectedDate}T00:00:00`).toDateString();
  const todayEvents = events.filter(
    (event) => event.timestamp.toDateString() === today,
  );

  const sleepTotal = todayEvents
    .filter((event) => event.type === "sleep")
    .reduce((sum, event) => sum + (event.duration ?? 0), 0);

  const feeds = todayEvents.filter((event) => event.type === "feed").length;
  const stools = todayEvents.filter((event) => event.type === "stool").length;
  const { lastWakeWindow } = calculateWakeWindows(events);

  const cards = [
    {
      label: "Total sleep",
      value: formatDuration(sleepTotal),
      tone: "text-indigo-700",
    },
    { label: "Feeds", value: String(feeds), tone: "text-emerald-700" },
    { label: "Stools", value: String(stools), tone: "text-amber-700" },
    {
      label: "Last wake window",
      value: lastWakeWindow ? formatDuration(lastWakeWindow) : "—",
      tone: "text-rose-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={cardBase}>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <p className={`mt-2 text-xl font-semibold ${card.tone}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};
