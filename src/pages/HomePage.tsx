import { useEffect, useState } from "react";
import { AddEventModal } from "../components/AddEventModal";
import { BabyProfileCard } from "../components/BabyProfileCard";
import { ChatAssistant } from "../components/ChatAssistant";
import { DateNavigator } from "../components/DateNavigator";
import { Dashboard } from "../components/Dashboard";
import { MedicineTracker } from "../components/MedicineTracker";
import { SummaryCards } from "../components/SummaryCards";
import { Timeline } from "../components/Timeline";
import { useBabyEvents } from "../hooks/useBabyEvents";
import type { EventType } from "../types/events";
import { toLocalInputDate } from "../utils/date";
import { getBabyProfile } from "../utils/profileStorage";
import { parseNaturalEvent } from "../utils/naturalParser";
import { getNextSuggestions } from "../utils/suggestions";

export const HomePage = () => {
  const { events, addEvent, deleteEvent } = useBabyEvents();
  const [activeType, setActiveType] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    toLocalInputDate(new Date()),
  );
  const [isDark, setIsDark] = useState<boolean>(
    localStorage.getItem("baby-tracker-theme") === "dark",
  );
  const [suggestions, setSuggestions] = useState<
    Array<{ label: string; time: string }>
  >([]);
  const [compactMode, setCompactMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("baby-tracker-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleNaturalLog = (input: string) => {
    const parsed = parseNaturalEvent(input, selectedDate);
    if (!parsed.success || !parsed.event) {
      return {
        kind: "error" as const,
        message:
          parsed.error ??
          "Hmm, I couldn't understand that yet. Try: nap 20 min",
      };
    }
    addEvent(parsed.event);
    setHighlightedEventId(parsed.event.id);
    const profile = getBabyProfile();
    setSuggestions(
      getNextSuggestions(parsed.event, [parsed.event, ...events], profile),
    );
    const label = `${parsed.event.type[0].toUpperCase()}${parsed.event.type.slice(1)}${parsed.event.duration ? ` ${parsed.event.duration} min` : ""}`;
    setToast(`Logged: ${label}`);
    window.setTimeout(() => setToast(null), 2200);
    window.setTimeout(() => setHighlightedEventId(null), 2400);
    return { kind: "success" as const, message: "Logged successfully ✨" };
  };

  const handleAddMedicine = (event: (typeof events)[number]) => {
    addEvent(event);
    setHighlightedEventId(event.id);
    setToast(`Logged: ${String(event.metadata?.name ?? "Medicine")}`);
    window.setTimeout(() => setToast(null), 2200);
    window.setTimeout(() => setHighlightedEventId(null), 2400);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-emerald-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col p-4 md:p-6">
        <header className="mb-4 rounded-3xl border border-white/60 bg-white/55 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60 md:mb-6 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                baby-tracker
              </p>
              <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                Baby Day Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompactMode((value) => !value)}
                className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {compactMode ? "Comfort" : "Compact"} mode
              </button>
              <button
                type="button"
                onClick={() => setIsDark((v) => !v)}
                className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {isDark ? "Light" : "Dark"} mode
              </button>
            </div>
          </div>
        </header>

        <div className="mb-4 md:mb-6">
          <DateNavigator
            selectedDate={selectedDate}
            onChange={setSelectedDate}
          />
        </div>

        <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden">
          <section className="flex min-h-0 flex-col gap-4">
            {!compactMode && <BabyProfileCard />}
            <Dashboard
              onAdd={setActiveType}
              onNaturalLog={handleNaturalLog}
              suggestions={suggestions}
              compact={compactMode}
              toast={toast}
            />
            {!compactMode && (
              <>
                <SummaryCards
                  events={events}
                  selectedDate={selectedDate}
                  compact={compactMode}
                />
                <MedicineTracker
                  events={events}
                  selectedDate={selectedDate}
                  onAddMedicine={handleAddMedicine}
                  compact={compactMode}
                />
                <Timeline
                  events={events}
                  selectedDate={selectedDate}
                  onDelete={deleteEvent}
                  compact={compactMode}
                  highlightedEventId={highlightedEventId}
                />
              </>
            )}
          </section>
          <ChatAssistant
            events={events}
            selectedDate={selectedDate}
            compact={compactMode}
          />
        </div>
      </div>

      <AddEventModal
        type={activeType}
        selectedDate={selectedDate}
        onClose={() => setActiveType(null)}
        onSubmit={addEvent}
      />
    </main>
  );
};
