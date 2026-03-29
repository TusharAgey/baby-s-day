import { useMemo, useState } from "react";
import type { BabyEvent } from "../types/events";
import {
  getEventsFromStorage,
  saveEventsToStorage,
} from "../utils/eventStorage";

export const useBabyEvents = () => {
  const [events, setEvents] = useState<BabyEvent[]>(() =>
    getEventsFromStorage(),
  );
  const [lastRemovedEvent, setLastRemovedEvent] = useState<BabyEvent | null>(
    null,
  );

  const addEvent = (event: BabyEvent) => {
    setEvents((previous) => {
      const next = [event, ...previous].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
      saveEventsToStorage(next);
      return next;
    });
  };

  const deleteEvent = (id: string) => {
    setEvents((previous) => {
      const removed = previous.find((event) => event.id === id) ?? null;
      const next = previous.filter((event) => event.id !== id);
      setLastRemovedEvent(removed);
      saveEventsToStorage(next);
      return next;
    });
  };

  const updateEvent = (updatedEvent: BabyEvent) => {
    setEvents((previous) => {
      const next = previous
        .map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      saveEventsToStorage(next);
      return next;
    });
  };

  const undoDelete = () => {
    if (!lastRemovedEvent) return;
    setEvents((previous) => {
      const next = [lastRemovedEvent, ...previous].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
      saveEventsToStorage(next);
      return next;
    });
    setLastRemovedEvent(null);
  };

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [events],
  );

  return {
    events: sortedEvents,
    addEvent,
    deleteEvent,
    updateEvent,
    undoDelete,
    lastRemovedEvent,
    setLastRemovedEvent,
  };
};
