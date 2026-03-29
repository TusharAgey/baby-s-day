import type { BabyEvent } from "../types/events";

export interface PositionedEvent {
  event: BabyEvent;
  column: number;
  totalColumns: number;
  startMinutes: number;
  endMinutes: number;
}

const getStartMinutes = (event: BabyEvent) =>
  event.timestamp.getHours() * 60 + event.timestamp.getMinutes();

const getEndMinutes = (event: BabyEvent) =>
  getStartMinutes(event) + Math.max(event.duration ?? 5, 5);

export const layoutEvents = (events: BabyEvent[]): PositionedEvent[] => {
  const sorted = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  const positioned: PositionedEvent[] = [];
  const active: PositionedEvent[] = [];

  sorted.forEach((event) => {
    const startMinutes = getStartMinutes(event);
    const endMinutes = getEndMinutes(event);

    for (let i = active.length - 1; i >= 0; i -= 1) {
      if (active[i].endMinutes <= startMinutes) {
        active.splice(i, 1);
      }
    }

    const usedColumns = new Set(active.map((item) => item.column));
    let column = 0;
    while (usedColumns.has(column)) column += 1;

    const positionedEvent: PositionedEvent = {
      event,
      column,
      totalColumns: Math.max(active.length + 1, column + 1),
      startMinutes,
      endMinutes,
    };

    active.push(positionedEvent);
    const totalColumns = Math.max(...active.map((item) => item.column + 1));
    active.forEach((item) => {
      item.totalColumns = Math.max(item.totalColumns, totalColumns);
    });
    positioned.push(positionedEvent);
  });

  return positioned;
};
