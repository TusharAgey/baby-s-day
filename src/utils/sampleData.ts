import type { BabyEvent } from "../types/events";

const minutesAgo = (minutes: number): Date =>
  new Date(Date.now() - minutes * 60_000);

export const sampleEvents: BabyEvent[] = [
  {
    id: "evt-1",
    type: "sleep",
    timestamp: minutesAgo(600),
    duration: 95,
    metadata: {
      start: minutesAgo(695).toISOString(),
      end: minutesAgo(600).toISOString(),
    },
  },
  {
    id: "evt-2",
    type: "feed",
    timestamp: minutesAgo(520),
    duration: 20,
    metadata: { notes: "Bottle 90ml" },
  },
  {
    id: "evt-3",
    type: "tummy",
    timestamp: minutesAgo(455),
    duration: 14,
    metadata: {},
  },
  {
    id: "evt-4",
    type: "stool",
    timestamp: minutesAgo(390),
    metadata: { color: "Mustard", consistency: "Soft", notes: "No fuss" },
  },
  {
    id: "evt-5",
    type: "sleep",
    timestamp: minutesAgo(180),
    duration: 60,
    metadata: {
      start: minutesAgo(240).toISOString(),
      end: minutesAgo(180).toISOString(),
    },
  },
  {
    id: "evt-6",
    type: "feed",
    timestamp: minutesAgo(80),
    duration: 18,
    metadata: { notes: "Breastfeed" },
  },
];
