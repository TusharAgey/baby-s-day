import type { BabyEvent } from "../types/events";
import { sampleEvents } from "./sampleData";

const STORAGE_KEY = "baby-tracker-events";

type StoredEvent = Omit<BabyEvent, "timestamp"> & { timestamp: string };

const serializeEvents = (events: BabyEvent[]): StoredEvent[] =>
  events.map((event) => ({
    ...event,
    timestamp: event.timestamp.toISOString(),
  }));

const deserializeEvents = (events: StoredEvent[]): BabyEvent[] =>
  events.map((event) => ({ ...event, timestamp: new Date(event.timestamp) }));

export const getEventsFromStorage = (): BabyEvent[] => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    saveEventsToStorage(sampleEvents);
    return [...sampleEvents].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  try {
    const parsed = JSON.parse(raw) as StoredEvent[];
    return deserializeEvents(parsed).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  } catch {
    saveEventsToStorage(sampleEvents);
    return [...sampleEvents].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }
};

export const saveEventsToStorage = (events: BabyEvent[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeEvents(events)));
};
