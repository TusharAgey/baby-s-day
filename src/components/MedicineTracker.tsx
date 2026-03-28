import { useMemo, useState } from "react";
import { toLocalInputDate } from "../utils/date";

interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  time: string;
  notes?: string;
}

const MEDS_KEY = "baby-tracker-medicines";
const TAKEN_KEY = "baby-tracker-medicines-taken";

const readMedicines = (): MedicineItem[] => {
  const raw = localStorage.getItem(MEDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MedicineItem[];
  } catch {
    return [];
  }
};

const readTaken = (): Record<string, boolean> => {
  const raw = localStorage.getItem(TAKEN_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
};

export const MedicineTracker = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>(() =>
    readMedicines(),
  );
  const [takenMap, setTakenMap] = useState<Record<string, boolean>>(() =>
    readTaken(),
  );

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:00");
  const [notes, setNotes] = useState("");

  const today = toLocalInputDate(new Date());

  const persistMeds = (next: MedicineItem[]) => {
    setMedicines(next);
    localStorage.setItem(MEDS_KEY, JSON.stringify(next));
  };

  const toggleTaken = (id: string) => {
    const key = `${today}:${id}`;
    const next = { ...takenMap, [key]: !takenMap[key] };
    setTakenMap(next);
    localStorage.setItem(TAKEN_KEY, JSON.stringify(next));
  };

  const addMedicine = () => {
    if (!name.trim()) return;
    const med: MedicineItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      dosage: dosage.trim() || "as advised",
      time,
      notes: notes.trim() || undefined,
    };
    persistMeds([med, ...medicines]);
    setName("");
    setDosage("");
    setTime("08:00");
    setNotes("");
  };

  const completion = useMemo(() => {
    if (medicines.length === 0) return 0;
    const count = medicines.filter(
      (med) => takenMap[`${today}:${med.id}`],
    ).length;
    return Math.round((count / medicines.length) * 100);
  }, [medicines, takenMap, today]);

  return (
    <section className="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Medicines
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Today: {completion}% done
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Medicine"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
        <input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="Dosage"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
        <button
          type="button"
          onClick={addMedicine}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-sky-600"
        >
          Add
        </button>
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes"
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      />

      <div className="mt-3 space-y-2">
        {medicines.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No scheduled medicines yet.
          </p>
        )}
        {medicines.map((med) => {
          const done = takenMap[`${today}:${med.id}`];
          return (
            <div
              key={med.id}
              className="flex items-center justify-between rounded-xl border border-white/70 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-800/70"
            >
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-100">
                  {med.name} • {med.dosage}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {med.time}
                  {med.notes ? ` • ${med.notes}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleTaken(med.id)}
                className={`rounded-lg px-2 py-1 text-xs ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"}`}
              >
                {done ? "Taken" : "Mark taken"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
