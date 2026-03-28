import type { BabyEvent, EventType } from "../types/events";
import { toLocalInputDate } from "./date";

interface ParseResult {
  event?: BabyEvent;
  error?: string;
}

const parseType = (input: string): EventType | null => {
  if (/\bsleep\b/.test(input)) return "sleep";
  if (/\bfeed\b|\bfed\b/.test(input)) return "feed";
  if (/\bstool\b|\bpoop\b/.test(input)) return "stool";
  if (/\btummy\b/.test(input)) return "tummy";
  return null;
};

const parseDuration = (input: string): number | undefined => {
  const match = input.match(
    /(\d{1,3})\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours)\b/,
  );
  if (!match) return undefined;
  const value = Number(match[1]);
  const unit = match[2];
  if (Number.isNaN(value)) return undefined;
  return /h|hr|hrs|hour|hours/.test(unit) ? value * 60 : value;
};

const parseTime = (input: string): string | null => {
  if (/\bnow\b/.test(input)) return null;
  const match = input.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour > 23 || minutes > 59) return null;

  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const parseNotes = (input: string): string | undefined => {
  const notesMatch = input.match(/(?:notes?|note)\s*[:\-]?\s*(.+)$/);
  return notesMatch?.[1]?.trim();
};

export const parseNaturalEvent = (
  rawInput: string,
  selectedDate: string,
): ParseResult => {
  const input = rawInput.trim().toLowerCase();
  if (!input) return { error: "Please type something to parse." };

  const type = parseType(input);
  if (!type) {
    return {
      error:
        "Couldn't detect event type. Try sleep/feed/stool/tummy in your sentence.",
    };
  }

  const duration = parseDuration(input);
  const time = parseTime(input);
  const notes = parseNotes(rawInput);

  const now = new Date();
  const today = toLocalInputDate(now);
  const fallbackTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const timestamp = new Date(`${selectedDate}T${time ?? fallbackTime}:00`);

  if (timestamp.getTime() > Date.now()) {
    return { error: "Future events are not allowed." };
  }

  const metadata: Record<string, string> = {};
  if (notes) metadata.notes = notes;

  if (type === "stool") {
    const color = rawInput.match(
      /\b(yellow|green|brown|mustard|black)\b/i,
    )?.[1];
    const consistency = rawInput.match(/\b(loose|soft|watery|firm)\b/i)?.[1];
    if (color) metadata.color = color;
    if (consistency) metadata.consistency = consistency;
  }

  const event: BabyEvent = {
    id: crypto.randomUUID(),
    type,
    timestamp,
    duration: type === "stool" ? undefined : (duration ?? 15),
    metadata,
  };

  if (selectedDate === today && !time && timestamp.getTime() > Date.now()) {
    return { error: "Future events are not allowed." };
  }

  return { event };
};
