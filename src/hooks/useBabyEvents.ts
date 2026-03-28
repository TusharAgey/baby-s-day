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
      const next = previous.filter((event) => event.id !== id);
      saveEventsToStorage(next);
      return next;
    });
  };

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [events],
  );

  return { events: sortedEvents, addEvent, deleteEvent };
};
