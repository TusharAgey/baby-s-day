import { toLocalInputDate } from "../utils/date";

interface DateNavigatorProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

const weekday = (date: Date): string =>
  date.toLocaleDateString([], { weekday: "short" });

const dayNum = (date: Date): string =>
  date.toLocaleDateString([], { day: "numeric" });

export const DateNavigator = ({
  selectedDate,
  onChange,
}: DateNavigatorProps) => {
  const selected = new Date(`${selectedDate}T00:00:00`);
  const today = new Date();
  const todayKey = toLocalInputDate(today);

  const days = Array.from({ length: 9 }, (_, index) => {
    const offset = index - 4;
    const date = new Date(selected);
    date.setDate(selected.getDate() + offset);
    return date;
  });

  const shiftSelected = (delta: number) => {
    const date = new Date(selected);
    date.setDate(selected.getDate() + delta);
    if (toLocalInputDate(date) > todayKey) return;
    onChange(toLocalInputDate(date));
  };

  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-800/70">
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => shiftSelected(-1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          ←
        </button>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {selected.toLocaleDateString([], { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(todayKey)}
            className="h-7 rounded-lg bg-white px-2 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shiftSelected(1)}
            disabled={selectedDate >= todayKey}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-9 gap-1">
        {days.map((date) => {
          const value = toLocalInputDate(date);
          const isSelected = value === selectedDate;
          const isToday = value === todayKey;
          const isFuture = value > todayKey;

          return (
            <button
              key={value}
              type="button"
              disabled={isFuture}
              onClick={() => onChange(value)}
              className={`rounded-xl border px-1 py-2 text-center transition ${
                isSelected
                  ? "border-sky-300 bg-sky-500 text-white"
                  : isFuture
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
                    : "border-white/70 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <p className="text-[10px] uppercase opacity-80">
                {weekday(date)}
              </p>
              <p className="text-sm font-semibold">{dayNum(date)}</p>
              <p className="text-[10px] opacity-80">{isToday ? "Today" : ""}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
