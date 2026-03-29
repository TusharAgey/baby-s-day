import { useEffect, useState } from "react";
import type { BabyProfile } from "../types/profile";
import { calculateBabyAge } from "../utils/babyAge";
import { toLocalInputDate } from "../utils/date";
import { saveBabyProfile } from "../utils/profileStorage";

const STORAGE_KEY = "baby-tracker-profile";

const initialProfile: BabyProfile = {
  name: "",
  dob: "",
  gender: "",
  notes: "",
  medicines: [],
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
  const [medicineName, setMedicineName] = useState("");
  const [medicineDosage, setMedicineDosage] = useState("");
  const [medicineNotes, setMedicineNotes] = useState("");

  useEffect(() => {
    saveBabyProfile(profile);
  }, [profile]);

  const age = calculateBabyAge(profile.dob);

  const addMedicinePreset = () => {
    if (!medicineName.trim()) return;
    setProfile((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          id: crypto.randomUUID(),
          name: medicineName.trim(),
          dosage: medicineDosage.trim() || "as advised",
          notes: medicineNotes.trim() || undefined,
        },
      ],
    }));
    setMedicineName("");
    setMedicineDosage("");
    setMedicineNotes("");
  };

  const removeMedicinePreset = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((medicine) => medicine.id !== id),
    }));
  };

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

          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-slate-700 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-slate-200">
            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
              Baby age
            </span>
            <p className="font-medium">{age.label}</p>
          </div>

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

          <div className="sm:col-span-2 rounded-2xl border border-white/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Medicine presets
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add commonly used medicines for quick daily logging.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <input
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="Medicine name"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <input
                value={medicineDosage}
                onChange={(e) => setMedicineDosage(e.target.value)}
                placeholder="Dosage"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={addMedicinePreset}
                className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white"
              >
                Save preset
              </button>
            </div>
            <input
              value={medicineNotes}
              onChange={(e) => setMedicineNotes(e.target.value)}
              placeholder="Optional default notes"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />

            <div className="mt-3 space-y-2">
              {profile.medicines.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No medicine presets yet.
                </p>
              )}
              {profile.medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-100">
                      {medicine.name} • {medicine.dosage}
                    </p>
                    {medicine.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {medicine.notes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedicinePreset(medicine.id)}
                    className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-500/20 dark:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
