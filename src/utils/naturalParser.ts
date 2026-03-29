import type { BabyEvent, EventType } from "../types/events";

export interface NaturalParseResult {
  success: boolean;
  event?: BabyEvent;
  error?: string;
}

const parseClock = (
  value?: string,
): { hours: number; minutes: number } | null => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridiem = match[3]?.toLowerCase();
  if (minutes > 59 || hours > 23) return null;
  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  return { hours, minutes };
};

const withClock = (selectedDate: string, clock?: string): Date => {
  const now = new Date();
  const parsed = parseClock(clock);
  const hours = parsed?.hours ?? now.getHours();
  const minutes = parsed?.minutes ?? now.getMinutes();
  return new Date(
    `${selectedDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`,
  );
};

const parseDuration = (input: string): number | undefined => {
  const match = input.match(
    /(\d{1,3})\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours)\b/i,
  );
  if (!match) return undefined;
  const amount = Number(match[1]);
  return /h|hr|hrs|hour|hours/i.test(match[2]) ? amount * 60 : amount;
};

const buildEvent = (
  type: EventType,
  timestamp: Date,
  duration?: number,
  metadata?: Record<string, unknown>,
): BabyEvent => ({
  id: crypto.randomUUID(),
  type,
  timestamp,
  duration,
  metadata,
});

export const parseNaturalEvent = (
  rawInput: string,
  selectedDate: string,
): NaturalParseResult => {
  const input = rawInput.trim();
  const normalized = input.toLowerCase();

  if (!input) {
    return {
      success: false,
      error: "Hmm, I couldn't understand that yet. Try: nap 20 min",
    };
  }

  const sleepRange = normalized.match(
    /(?:sleep|nap)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
  );
  if (sleepRange) {
    const start = withClock(selectedDate, sleepRange[1]);
    const end = withClock(selectedDate, sleepRange[2]);
    const duration = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / 60_000),
    );
    return { success: true, event: buildEvent("sleep", start, duration || 15) };
  }

  if (/(?:sleep|nap)\b/i.test(normalized)) {
    const time = normalized.match(
      /(?:sleep|nap)\s+(at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    )?.[2];
    const duration = parseDuration(normalized);
    const timestamp = withClock(selectedDate, time);
    return {
      success: true,
      event: buildEvent("sleep", timestamp, duration ?? 20),
    };
  }

  if (/(?:feed|fed)\b/i.test(normalized)) {
    const time = normalized.match(
      /(?:feed|fed)\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    )?.[1];
    const duration = parseDuration(normalized);
    const timestamp = withClock(selectedDate, time);
    return {
      success: true,
      event: buildEvent("feed", timestamp, duration ?? 5),
    };
  }

  if (/(?:stool|poop)\b/i.test(normalized)) {
    const time = normalized.match(
      /(?:stool|poop)\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    )?.[1];
    const consistency = normalized.match(/\b(loose|soft|watery|firm)\b/i)?.[1];
    const color = normalized.match(
      /\b(yellow|green|brown|mustard|black)\b/i,
    )?.[1];
    return {
      success: true,
      event: buildEvent("stool", withClock(selectedDate, time), undefined, {
        ...(consistency ? { consistency } : {}),
        ...(color ? { color } : {}),
        ...(input !== rawInput.trim() ? { notes: input } : {}),
      }),
    };
  }

  if (/tummy(?:\s+time)?\b/i.test(normalized)) {
    const time = normalized.match(
      /tummy(?:\s+time)?\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    )?.[1];
    const duration = parseDuration(normalized);
    return {
      success: true,
      event: buildEvent("tummy", withClock(selectedDate, time), duration ?? 5),
    };
  }

  return {
    success: false,
    error:
      "Hmm, I couldn't understand that yet. Try: nap 20 min or fed 5 min at 10:30",
  };
};
