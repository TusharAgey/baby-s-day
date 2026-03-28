import type { BabyProfile } from "../types/profile";

const STORAGE_KEY = "baby-tracker-profile";

const defaultProfile: BabyProfile = {
  name: "",
  dob: "",
  gender: "",
  notes: "",
};

export const getBabyProfile = (): BabyProfile => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultProfile;
  try {
    return { ...defaultProfile, ...(JSON.parse(raw) as Partial<BabyProfile>) };
  } catch {
    return defaultProfile;
  }
};
