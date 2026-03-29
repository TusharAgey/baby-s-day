import type { BabyEvent } from "../types/events";
import type { EventSuggestion } from "../utils/suggestions";
import { formatDuration } from "../utils/analytics";

interface TodayFocusStripProps {
  events: BabyEvent[];
  selectedDate: string;
  suggestions: EventSuggestion[];
}

const toneStyles = [
  "from-sky-100 to-cyan-50 text-sky-800",
  "from-emerald-100 to-teal-50 text-emerald-800",
  "from-violet-100 to-fuchsia-50 text-violet-800",
];

export const TodayFocusStrip = ({
  events,
  selectedDate,
  suggestions,
}: TodayFocusStripProps) => {
  const selectedDay = new Date(`${selectedDate}T00:00:00`).toDateString();
  const dayEvents = events.filter(
    (event) => event.timestamp.toDateString() === selectedDay,
  );

  const latestFeed = [...dayEvents]
    .filter((event) => event.type === "feed")
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  const latestMedicine = [...dayEvents]
    .filter((event) => event.type === "medicine")
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  const sleepToday = dayEvents
    .filter((event) => event.type === "sleep")
    .reduce((sum, event) => sum + (event.duration ?? 0), 0);
  const dueSoon: string[] = [];

  if (suggestions[0]) {
    dueSoon.push(`${suggestions[0].label} around ${suggestions[0].time}`);
  }
  if (latestFeed) {
    const dueFeed = new Date(latestFeed.timestamp.getTime() + 150 * 60_000);
    dueSoon.push(
      `Feed due near ${dueFeed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
    );
  }
  if (latestMedicine) {
    dueSoon.push(
      `Last medicine: ${String(latestMedicine.metadata?.name ?? "Medicine")}`,
    );
  }

  const cards = [
    {
      label: "Next best step",
      value: suggestions[0]
        ? `${suggestions[0].label} · ${suggestions[0].time}`
        : "Log one event to unlock smart suggestions",
      helper: "Smart cue",
    },
    {
      label: "Last feed",
      value: latestFeed
        ? latestFeed.timestamp.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        : "No feed logged yet",
      helper: "Feeding rhythm",
    },
    {
      label: "Day sleep",
      value: sleepToday ? formatDuration(sleepToday) : "No naps yet",
      helper: "Rest so far",
    },
    {
      label: "Medicine check",
      value: latestMedicine
        ? `${String(latestMedicine.metadata?.name ?? "Medicine")} logged`
        : "No medicine logged today",
      helper: "Daily care",
    },
    {
      label: "Due soon",
      value: dueSoon[0] ?? "Nothing urgent right now",
      helper: "Heads up",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={`rounded-3xl border border-white/70 bg-gradient-to-br ${toneStyles[index % toneStyles.length]} p-4 shadow-glass backdrop-blur-xl`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {card.helper}
          </p>
          <p className="mt-3 text-sm text-slate-600">{card.label}</p>
          <p className="mt-1 text-lg font-semibold leading-snug">
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
};
