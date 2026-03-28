import type { BabyEvent } from "../types/events";
import type { BabyProfile } from "../types/profile";
import { calculateWakeWindows, formatDuration } from "./analytics";

interface MonthRule {
  minMonth: number;
  maxMonth: number;
  wakeWindowMin: number;
  wakeWindowMax: number;
  naps: string;
  bedtime: string;
  feeds: string;
}

const rules: MonthRule[] = [
  {
    minMonth: 0,
    maxMonth: 2,
    wakeWindowMin: 45,
    wakeWindowMax: 75,
    naps: "5-6 naps",
    bedtime: "7:30-9:00 PM",
    feeds: "8-12 feeds/day",
  },
  {
    minMonth: 3,
    maxMonth: 4,
    wakeWindowMin: 75,
    wakeWindowMax: 150,
    naps: "4 naps",
    bedtime: "7:00-8:30 PM",
    feeds: "6-8 feeds/day",
  },
  {
    minMonth: 5,
    maxMonth: 6,
    wakeWindowMin: 120,
    wakeWindowMax: 180,
    naps: "3 naps",
    bedtime: "6:45-8:00 PM",
    feeds: "5-7 feeds/day",
  },
  {
    minMonth: 7,
    maxMonth: 9,
    wakeWindowMin: 150,
    wakeWindowMax: 210,
    naps: "2-3 naps",
    bedtime: "6:30-7:45 PM",
    feeds: "4-6 feeds/day",
  },
  {
    minMonth: 10,
    maxMonth: 12,
    wakeWindowMin: 180,
    wakeWindowMax: 240,
    naps: "2 naps",
    bedtime: "6:30-7:30 PM",
    feeds: "4-5 feeds/day",
  },
];

const monthsBetween = (from: Date, to: Date): number => {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  const rough = years * 12 + months;
  return Math.max(0, rough);
};

export const getScheduleRecommendation = (
  profile: BabyProfile,
  events: BabyEvent[],
): { title: string; bullets: string[] } => {
  if (events.length === 0) {
    return {
      title: "No logs for selected day",
      bullets: [
        "You're doing great — add a few sleep/feed/stool/tummy events for this date and we’ll tailor your schedule guidance.",
      ],
    };
  }

  if (!profile.dob) {
    return {
      title: "Add baby's DOB for month-wise schedule",
      bullets: [
        "Once DOB is set, recommendations will use age-based wake windows and routine guidance.",
      ],
    };
  }

  const ageMonths = monthsBetween(
    new Date(`${profile.dob}T00:00:00`),
    new Date(),
  );
  const matched =
    rules.find(
      (rule) => ageMonths >= rule.minMonth && ageMonths <= rule.maxMonth,
    ) ?? rules[rules.length - 1];
  const wake = calculateWakeWindows(events);

  const bullets = [
    `Age: ${ageMonths} months`,
    `Wake window target: ${formatDuration(matched.wakeWindowMin)} - ${formatDuration(matched.wakeWindowMax)}`,
    `Typical naps: ${matched.naps}`,
    `Typical bedtime: ${matched.bedtime}`,
    `Typical feeds: ${matched.feeds}`,
  ];

  if (wake.lastWakeWindow) {
    if (wake.lastWakeWindow > matched.wakeWindowMax) {
      bullets.push(
        `Last wake window ${formatDuration(wake.lastWakeWindow)} is above recommended range.`,
      );
    } else if (wake.lastWakeWindow < matched.wakeWindowMin) {
      bullets.push(
        `Last wake window ${formatDuration(wake.lastWakeWindow)} is shorter than the recommended range.`,
      );
    } else {
      bullets.push(
        `Last wake window ${formatDuration(wake.lastWakeWindow)} is within recommended range.`,
      );
    }
  }

  return {
    title: `Month-wise routine guide (${matched.minMonth}-${matched.maxMonth} months)`,
    bullets,
  };
};
