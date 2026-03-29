import type { BabyEvent } from "../types/events";
import type { BabyProfile } from "../types/profile";
import { calculateWakeWindows, formatDuration } from "./analytics";
import { getBabyAgeFromProfile, getDefaultBabyAge } from "./babyAge";

export interface ScheduleInsightSummary {
  title: string;
  metrics: Array<{ label: string; value: string }>;
  messages: string[];
}

const getRecommendedWakeWindow = (months: number) => {
  if (months <= 2) return 75;
  if (months <= 4) return 90;
  if (months <= 6) return 120;
  return 150;
};

export const getScheduleInsights = (
  profile: BabyProfile,
  events: BabyEvent[],
  now: Date = new Date(),
): ScheduleInsightSummary => {
  const age = profile.dob
    ? getBabyAgeFromProfile(profile, now)
    : getDefaultBabyAge();
  const { lastWakeWindow } = calculateWakeWindows(events);

  const totalDaySleep = events
    .filter((event) => event.type === "sleep")
    .reduce((sum, event) => sum + (event.duration ?? 0), 0);

  const lastFeed = [...events]
    .filter((event) => event.type === "feed")
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  const timeSinceLastFeed = lastFeed
    ? Math.max(
        0,
        Math.round((now.getTime() - lastFeed.timestamp.getTime()) / 60_000),
      )
    : null;

  const recommendedWakeWindow = getRecommendedWakeWindow(age.months);
  const messages: string[] = [];

  if (lastWakeWindow !== null) {
    if (lastWakeWindow > 120) {
      messages.push("Last wake window is long — consider nap soon 😴");
      messages.push("Baby may be overtired.");
    } else if (lastWakeWindow < 45) {
      messages.push("That was a short wake window.");
      messages.push("Baby may be undertired right now.");
    } else {
      messages.push("Looks like a good rhythm today 👌");
    }
  } else {
    messages.push("You're doing great today.");
  }

  if (totalDaySleep < 120) {
    messages.push("Day sleep looks a little low — another nap may help.");
  }

  if (timeSinceLastFeed !== null && timeSinceLastFeed > 180) {
    messages.push("It’s been a while since the last feed — check hunger cues.");
  }

  if (messages.length === 0) {
    messages.push("You're doing great today.");
  }

  return {
    title: `Schedule guide for ${age.label}`,
    metrics: [
      {
        label: "Last wake window",
        value:
          lastWakeWindow === null
            ? `Target ~${formatDuration(recommendedWakeWindow)}`
            : formatDuration(lastWakeWindow),
      },
      { label: "Day sleep", value: formatDuration(totalDaySleep) },
      {
        label: "Since last feed",
        value:
          timeSinceLastFeed === null
            ? "No feeds yet"
            : formatDuration(timeSinceLastFeed),
      },
    ],
    messages,
  };
};
