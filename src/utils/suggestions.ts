import type { BabyEvent } from "../types/events";
import type { BabyProfile } from "../types/profile";
import { getBabyAgeFromProfile, getDefaultBabyAge } from "./babyAge";

export interface EventSuggestion {
  label: string;
  time: string;
}

const getWakeWindowMinutes = (months: number) => {
  if (months <= 2) return 75;
  if (months <= 4) return 90;
  if (months <= 6) return 120;
  return 150;
};

const formatClock = (date: Date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const getNextSuggestions = (
  latestEvent: BabyEvent | null,
  events: BabyEvent[],
  profile: BabyProfile,
): EventSuggestion[] => {
  if (!latestEvent) return [];

  const age = profile.dob
    ? getBabyAgeFromProfile(profile)
    : getDefaultBabyAge();
  const wakeWindow = getWakeWindowMinutes(age.months);
  const latestTime = latestEvent.timestamp;
  const lastFeed = [...events]
    .filter((event) => event.type === "feed")
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  const suggestions: EventSuggestion[] = [];

  if (latestEvent.type === "sleep") {
    const wakeAt = new Date(
      latestTime.getTime() + (latestEvent.duration ?? 20) * 60_000,
    );
    suggestions.push({
      label: "Next nap",
      time: formatClock(new Date(wakeAt.getTime() + wakeWindow * 60_000)),
    });
    suggestions.push({
      label: "Tummy time",
      time: formatClock(new Date(wakeAt.getTime() + 20 * 60_000)),
    });
  }

  const feedBase =
    latestEvent.type === "feed"
      ? latestTime
      : (lastFeed?.timestamp ?? latestTime);
  suggestions.push({
    label: "Next feed",
    time: formatClock(new Date(feedBase.getTime() + 150 * 60_000)),
  });

  if (latestEvent.type !== "sleep") {
    suggestions.push({
      label: "Next nap",
      time: formatClock(new Date(latestTime.getTime() + wakeWindow * 60_000)),
    });
  }

  return suggestions.slice(0, 3);
};
