import { useEffect, useState } from "react";
import type { BabyProfile } from "../types/profile";
import { toLocalInputDate } from "../utils/date";

const STORAGE_KEY = "baby-tracker-profile";

const initialProfile: BabyProfile = {
  name: "",
  dob: "",
  gender: "",
  notes: "",
};

export const BabyProfileCard = () => {
  const [expanded, setExpanded] = useState(false);
  const [profile, setProfile] = useState<BabyProfile>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProfile;
    try {
      return {
        ...initialProfile,
        ...(JSON.parse(raw) as Partial<BabyProfile>),
      };
    } catch {
      return initialProfile;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  return (
    <section className="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-2 flex w-full items-center justify-between"
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Baby profile (optional)
        </h2>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
              Name
            </span>
            <input
              value={profile.name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
              Date of birth
            </span>
            <input
              type="date"
              value={profile.dob}
              max={toLocalInputDate(new Date())}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, dob: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
              Gender
            </span>
            <select
              value={profile.gender}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, gender: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Select</option>
              <option value="girl">Girl</option>
              <option value="boy">Boy</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
              Notes (allergies, pediatrician, etc.)
            </span>
            <textarea
              rows={2}
              value={profile.notes}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </label>
        </div>
      )}
    </section>
  );
};
