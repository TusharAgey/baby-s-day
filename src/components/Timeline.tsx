import type { BabyEvent } from "../types/events";
import { formatDuration } from "../utils/analytics";

interface TimelineProps {
  events: BabyEvent[];
  selectedDate: string;
  onDelete: (id: string) => void;
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
  compact = false,
  highlightedEventId,
}: TimelineProps) => {
  const selectedDay = new Date(`${selectedDate}T00:00:00`).toDateString();
  const filteredEvents = events.filter(
    (event) => event.timestamp.toDateString() === selectedDay,
  );

  const dayEvents = [...filteredEvents].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

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

          {dayEvents.map((event) => {
            const startMinutes =
              event.timestamp.getHours() * 60 + event.timestamp.getMinutes();
            const durationMinutes = Math.max(event.duration ?? 5, 5);
            const top = startMinutes * pxPerMinute;
            const height = Math.max(durationMinutes * pxPerMinute, 28);
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
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${eventStyles[event.type]}`}
                  >
                    {event.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                {event.type !== "stool" && event.type !== "medicine" && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Duration:{" "}
                    <span className="font-medium">
                      {formatDuration(event.duration)}
                    </span>
                  </p>
                )}
                {formatMetadata(event) && (
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {formatMetadata(event)}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
