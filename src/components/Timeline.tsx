import { useState } from "react";
import type { BabyEvent } from "../types/events";
import { formatDuration } from "../utils/analytics";

interface TimelineProps {
  events: BabyEvent[];
  selectedDate: string;
  onDelete: (id: string) => void;
  onEdit: (event: BabyEvent) => void;
  compact?: boolean;
  highlightedEventId?: string | null;
}

const eventStyles: Record<string, string> = {
  sleep: "bg-indigo-50 text-indigo-700 border-indigo-100",
  feed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  stool: "bg-amber-50 text-amber-700 border-amber-100",
  tummy: "bg-rose-50 text-rose-700 border-rose-100",
  medicine: "bg-violet-50 text-violet-700 border-violet-100",
};

const eventIcons: Record<string, string> = {
  sleep: "😴",
  feed: "🍼",
  stool: "💩",
  tummy: "🧸",
  medicine: "💊",
};

const formatMetadata = (event: BabyEvent) => {
  if (!event.metadata) return null;
  return Object.entries(event.metadata)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" • ");
};

export const Timeline = ({
  events,
  selectedDate,
  onDelete,
  onEdit,
  compact = false,
  highlightedEventId,
}: TimelineProps) => {
  const [filter, setFilter] = useState<"all" | BabyEvent["type"]>("all");
  const selectedDay = new Date(`${selectedDate}T00:00:00`).toDateString();
  const filteredEvents = events.filter(
    (event) => event.timestamp.toDateString() === selectedDay,
  );

  const dayEvents = [...filteredEvents]
    .filter((event) => filter === "all" || event.type === filter)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const timelineHeight = 960;
  const pxPerMinute = timelineHeight / (24 * 60);
  const hourMarks = Array.from({ length: 25 }, (_, i) => i);

  return (
    <section
      className={`flex min-h-[60vh] flex-col rounded-3xl border border-white/60 bg-white/50 ${compact ? "p-3" : "p-5"} shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60`}
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Timeline
      </h2>
      <p className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {selectedDay}
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "sleep", "feed", "stool", "tummy", "medicine"] as const).map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1 text-xs transition ${filter === item ? "bg-sky-600 text-white" : "bg-white/80 text-slate-600 dark:bg-slate-800 dark:text-slate-200"}`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      {dayEvents.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No events logged for this day yet.
        </p>
      )}

      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/70 bg-white/60 p-2 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="relative" style={{ height: `${timelineHeight}px` }}>
          {hourMarks.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-dashed border-slate-200 dark:border-slate-700"
              style={{ top: `${hour * 60 * pxPerMinute}px` }}
            >
              <span className="-mt-2 inline-block bg-white/70 px-1 text-[10px] text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                {String(hour).padStart(2, "0")}:00
              </span>
            </div>
          ))}

          <div
            className="pointer-events-none absolute left-0 right-0 border-t-2 border-sky-300/70"
            style={{
              top: `${
                (new Date().getHours() * 60 + new Date().getMinutes()) *
                pxPerMinute
              }px`,
            }}
          />

          {(["Morning", "Afternoon", "Evening"] as const).map(
            (segment, index) => {
              const top = [6, 12, 18][index] * 60 * pxPerMinute;
              return (
                <div
                  key={segment}
                  className="absolute left-14 text-[10px] uppercase tracking-[0.2em] text-slate-300"
                  style={{ top: `${top + 6}px` }}
                >
                  {segment}
                </div>
              );
            },
          )}

          {dayEvents.map((event) => {
            const startMinutes =
              event.timestamp.getHours() * 60 + event.timestamp.getMinutes();
            const durationMinutes = Math.max(event.duration ?? 5, 5);
            const top = startMinutes * pxPerMinute;
            const height = Math.max(durationMinutes * pxPerMinute, 28);
            const isTiny = height < 56;
            const isCompactCard = height < 84;
            return (
              <article
                key={event.id}
                className={`absolute rounded-xl border border-white/80 bg-white/90 ${compact ? "p-1.5" : "p-2"} shadow-sm transition-all duration-500 dark:border-slate-700 dark:bg-slate-900/90 ${highlightedEventId === event.id ? "ring-2 ring-sky-300 animate-pulse" : ""}`}
                style={{
                  top: `${Math.max(0, top - 16)}px`,
                  left: "3.5rem",
                  right: "0.5rem",
                  minHeight: `${height}px`,
                }}
              >
                <div
                  className={`flex ${isTiny ? "items-center" : "items-start"} justify-between gap-2 overflow-hidden`}
                >
                  <span
                    className={`inline-flex max-w-[58%] items-center gap-1 rounded-full border ${isTiny ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"} font-medium ${eventStyles[event.type]}`}
                  >
                    <span>{eventIcons[event.type]}</span>
                    <span className="truncate">{event.type}</span>
                  </span>
                  <div
                    className={`flex ${isTiny ? "items-center gap-1" : "items-center gap-2"} shrink-0`}
                  >
                    {!isTiny && (
                      <button
                        type="button"
                        onClick={() => onEdit(event)}
                        className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-600 hover:bg-sky-100 dark:bg-sky-500/20 dark:text-sky-200"
                      >
                        Edit
                      </button>
                    )}
                    <p
                      className={`${isTiny ? "text-[10px]" : "text-xs"} text-slate-500 dark:text-slate-400`}
                    >
                      {event.timestamp.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <button
                      type="button"
                      onClick={() => onDelete(event.id)}
                      className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {!isTiny &&
                  event.type !== "stool" &&
                  event.type !== "medicine" && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Duration:{" "}
                      <span className="font-medium">
                        {formatDuration(event.duration)}
                      </span>
                    </p>
                  )}
                {!isCompactCard && formatMetadata(event) && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {formatMetadata(event)}
                  </p>
                )}
                {!isCompactCard && (
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {height >= 80 ? "Day story entry" : "Quick log"}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
