import type { BabyEvent } from "../types/events";

const toHoursAndMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const calculateWakeWindows = (
  events: BabyEvent[],
): {
  lastWakeWindow: number | null;
  averageWakeWindow: number | null;
} => {
  const sleeps = [...events]
    .filter((event) => event.type === "sleep")
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (sleeps.length < 2) {
    return { lastWakeWindow: null, averageWakeWindow: null };
  }

  const windows: number[] = [];

  for (let i = 1; i < sleeps.length; i += 1) {
    const prev = sleeps[i - 1];
    const current = sleeps[i];
    const prevSleepDuration = prev.duration ?? 0;
    const prevWakeAt = new Date(
      prev.timestamp.getTime() + prevSleepDuration * 60_000,
    );
    const wakeWindowMinutes = Math.max(
      0,
      Math.round((current.timestamp.getTime() - prevWakeAt.getTime()) / 60_000),
    );
    windows.push(wakeWindowMinutes);
  }

  const lastWakeWindow = windows.length ? windows[windows.length - 1] : null;
  const averageWakeWindow =
    windows.length > 0
      ? Math.round(
          windows.reduce((sum, value) => sum + value, 0) / windows.length,
        )
      : null;

  return { lastWakeWindow, averageWakeWindow };
};

export const analyzeBabyData = (events: BabyEvent[]): string[] => {
  if (events.length === 0) {
    return ["Log a few events to generate personalized baby insights."];
  }

  const { lastWakeWindow, averageWakeWindow } = calculateWakeWindows(events);
  const feedCountToday = events.filter(
    (event) =>
      event.type === "feed" &&
      event.timestamp.toDateString() === new Date().toDateString(),
  ).length;

  const insights: string[] = [];

  if (lastWakeWindow && lastWakeWindow > 140) {
    insights.push(
      `Overtired signal: last wake window is ${toHoursAndMinutes(lastWakeWindow)}. Consider an earlier nap wind-down.`,
    );
  } else if (lastWakeWindow) {
    insights.push(
      `Wake window looks balanced at ${toHoursAndMinutes(lastWakeWindow)} — nice rhythm today.`,
    );
  }

  if (averageWakeWindow) {
    const suggestedBedtimeOffset = Math.max(60, 150 - averageWakeWindow);
    const bedtime = new Date(Date.now() + suggestedBedtimeOffset * 60_000);
    insights.push(
      `Suggested bedtime: around ${bedtime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })} based on recent wake windows (${toHoursAndMinutes(averageWakeWindow)} average).`,
    );
  }

  if (feedCountToday < 4) {
    insights.push(
      "Feeding cadence seems light today — track cues and offer an additional feed if needed.",
    );
  } else {
    insights.push(
      "Feeding pattern is steady today. Keep hydration and burping breaks consistent.",
    );
  }

  return insights;
};

export const formatDuration = (minutes?: number): string => {
  if (!minutes) return "—";
  return toHoursAndMinutes(minutes);
};
