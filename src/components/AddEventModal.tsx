import { useState, type FormEvent } from "react";
import type { BabyEvent, EventType } from "../types/events";
import { toLocalInputDate } from "../utils/date";

interface AddEventModalProps {
  type: EventType | null;
  selectedDate: string;
  onClose: () => void;
  onSubmit: (event: BabyEvent) => void;
  initialEvent?: BabyEvent | null;
}

export const AddEventModal = ({
  type,
  selectedDate,
  onClose,
  onSubmit,
  initialEvent = null,
}: AddEventModalProps) => {
  const now = new Date();
  const todayKey = toLocalInputDate(now);
  const maxTimeForSelectedDate =
    selectedDate === todayKey ? now.toTimeString().slice(0, 5) : undefined;

  const [duration, setDuration] = useState<string>(
    String(initialEvent?.duration ?? "15"),
  );
  const [notes, setNotes] = useState<string>(
    String(initialEvent?.metadata?.notes ?? ""),
  );
  const [color, setColor] = useState<string>(
    String(initialEvent?.metadata?.color ?? "Brown"),
  );
  const [consistency, setConsistency] = useState<string>(
    String(initialEvent?.metadata?.consistency ?? "Soft"),
  );
  const [time, setTime] = useState<string>(
    initialEvent
      ? initialEvent.timestamp.toTimeString().slice(0, 5)
      : new Date().toTimeString().slice(0, 5),
  );

  if (!type) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const timestamp = new Date(`${selectedDate}T${time}:00`);
    if (timestamp.getTime() > Date.now()) return;

    const metadata: Record<string, string> = {};
    if (notes) metadata.notes = notes;
    if (type === "stool") {
      metadata.color = color;
      metadata.consistency = consistency;
    }

    onSubmit({
      id: initialEvent?.id ?? crypto.randomUUID(),
      type,
      timestamp,
      duration: type === "stool" ? undefined : Number(duration),
      metadata,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-5 shadow-glass dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {initialEvent ? "Edit" : "Add"} {type} event
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
              Time
            </span>
            <input
              type="time"
              value={time}
              max={maxTimeForSelectedDate}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </label>

          {type !== "stool" && (
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                Duration (minutes)
              </span>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </label>
          )}

          {type === "stool" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                  Color
                </span>
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                  Consistency
                </span>
                <input
                  value={consistency}
                  onChange={(e) => setConsistency(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-2 text-sm font-medium text-white dark:bg-sky-600"
          >
            Save Event
          </button>
        </form>
      </div>
    </div>
  );
};
