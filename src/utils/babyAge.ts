import type { BabyProfile } from "../types/profile";

export interface BabyAge {
  months: number;
  days: number;
  totalDays: number;
  label: string;
}

const DEFAULT_TOTAL_DAYS = 105;

export const getDefaultBabyAge = (): BabyAge => ({
  months: 3,
  days: 15,
  totalDays: DEFAULT_TOTAL_DAYS,
  label: "3 months 15 days",
});

export const calculateBabyAge = (
  dob?: string,
  referenceDate: Date = new Date(),
): BabyAge => {
  if (!dob) return getDefaultBabyAge();

  const birthDate = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birthDate.getTime()) || birthDate > referenceDate) {
    return getDefaultBabyAge();
  }

  let months =
    (referenceDate.getFullYear() - birthDate.getFullYear()) * 12 +
    (referenceDate.getMonth() - birthDate.getMonth());

  const anchorDate = new Date(birthDate);
  anchorDate.setMonth(anchorDate.getMonth() + months);

  if (anchorDate > referenceDate) {
    months -= 1;
    anchorDate.setMonth(anchorDate.getMonth() - 1);
  }

  const days = Math.max(
    0,
    Math.floor((referenceDate.getTime() - anchorDate.getTime()) / 86_400_000),
  );
  const totalDays = Math.max(
    0,
    Math.floor((referenceDate.getTime() - birthDate.getTime()) / 86_400_000),
  );

  return {
    months,
    days,
    totalDays,
    label: `${months} month${months === 1 ? "" : "s"} ${days} day${days === 1 ? "" : "s"}`,
  };
};

export const getBabyAgeFromProfile = (
  profile: BabyProfile,
  referenceDate?: Date,
) => calculateBabyAge(profile.dob, referenceDate);
