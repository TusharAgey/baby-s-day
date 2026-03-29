import { useEffect, useState } from "react";
import { AddEventModal } from "../components/AddEventModal";
import { BabyProfileCard } from "../components/BabyProfileCard";
import { ChatAssistant } from "../components/ChatAssistant";
import { DateNavigator } from "../components/DateNavigator";
import { Dashboard } from "../components/Dashboard";
import { MedicineTracker } from "../components/MedicineTracker";
import { SummaryCards } from "../components/SummaryCards";
import { Timeline } from "../components/Timeline";
import { TodayFocusStrip } from "../components/TodayFocusStrip";
import { TrendCards } from "../components/TrendCards";
import { useBabyEvents } from "../hooks/useBabyEvents";
import type { EventType } from "../types/events";
import { toLocalInputDate } from "../utils/date";
import { getBabyProfile } from "../utils/profileStorage";
import { parseNaturalEvent } from "../utils/naturalParser";
import { getNextSuggestions } from "../utils/suggestions";

const ACTIVE_ACTIVITY_KEY = "baby-tracker-active-activities";

export const HomePage = () => {
  const {
    events,
    addEvent,
    deleteEvent,
    updateEvent,
    undoDelete,
    lastRemovedEvent,
    setLastRemovedEvent,
  } = useBabyEvents();
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
  const [editingEvent, setEditingEvent] = useState<
    (typeof events)[number] | null
  >(null);
  const [activeActivities, setActiveActivities] = useState<
    Array<{ type: "sleep" | "tummy"; startedAt: Date }>
  >(() => {
    const raw = localStorage.getItem(ACTIVE_ACTIVITY_KEY);
    if (!raw) return [];
    try {
      return (
        JSON.parse(raw) as Array<{ type: "sleep" | "tummy"; startedAt: string }>
      ).map((item) => ({
        ...item,
        startedAt: new Date(item.startedAt),
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("baby-tracker-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem(
      ACTIVE_ACTIVITY_KEY,
      JSON.stringify(
        activeActivities.map((item) => ({
          ...item,
          startedAt: item.startedAt.toISOString(),
        })),
      ),
    );
  }, [activeActivities]);

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

  const handleSubmitEvent = (event: (typeof events)[number]) => {
    if (editingEvent) {
      updateEvent(event);
      setEditingEvent(null);
      setToast(`Updated: ${event.type}`);
    } else {
      addEvent(event);
    }
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleStartActivity = (type: "sleep" | "tummy") => {
    setActiveActivities((previous) => {
      if (previous.some((item) => item.type === type)) return previous;
      return [...previous, { type, startedAt: new Date() }];
    });
    setToast(`${type === "sleep" ? "Nap" : "Tummy time"} started`);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleEndActivity = (type: "sleep" | "tummy") => {
    const current = activeActivities.find((item) => item.type === type);
    if (!current) {
      setToast(`No active ${type} session to end`);
      window.setTimeout(() => setToast(null), 2200);
      return;
    }
    const endedAt = new Date();
    const duration = Math.max(
      1,
      Math.round((endedAt.getTime() - current.startedAt.getTime()) / 60000),
    );
    const event = {
      id: crypto.randomUUID(),
      type,
      timestamp: current.startedAt,
      duration,
      metadata: {
        notes: `${type === "sleep" ? "Ended nap" : "Ended tummy time"} at ${endedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
        endedAt: endedAt.toISOString(),
      },
    } as (typeof events)[number];
    addEvent(event);
    setHighlightedEventId(event.id);
    setActiveActivities((previous) =>
      previous.filter((item) => item.type !== type),
    );
    setToast(
      `${type === "sleep" ? "Nap" : "Tummy time"} ended · ${duration} min`,
    );
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
              onNaturalLog={handleNaturalLog}
              onStartActivity={handleStartActivity}
              onEndActivity={handleEndActivity}
              activeActivities={activeActivities}
              suggestions={suggestions}
              compact={compactMode}
              toast={toast}
              selectedDate={selectedDate}
            />
            {!compactMode && (
              <>
                <TodayFocusStrip
                  events={events}
                  selectedDate={selectedDate}
                  suggestions={suggestions}
                />
                <TrendCards events={events} />
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
                  onEdit={setEditingEvent}
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

      {lastRemovedEvent && (
        <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          Event removed.
          <button
            type="button"
            onClick={undoDelete}
            className="ml-3 rounded-full bg-white/20 px-3 py-1 text-xs"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => setLastRemovedEvent(null)}
            className="ml-3 rounded-full bg-white/20 px-3 py-1 text-xs"
          >
            X
          </button>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-full border border-white/70 bg-white/90 p-2 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90 md:hidden">
        {(
          [
            ["😴", "sleep"],
            ["🍼", "feed"],
            ["💩", "stool"],
            ["🧸", "tummy"],
          ] as const
        ).map(([icon, type]) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveType(type)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-lg"
          >
            {icon}
          </button>
        ))}
      </div>

      <AddEventModal
        type={editingEvent?.type ?? activeType}
        selectedDate={selectedDate}
        initialEvent={editingEvent}
        onClose={() => {
          setActiveType(null);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmitEvent}
      />
    </main>
  );
};
