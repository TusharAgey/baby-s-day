import { useMemo, useState } from "react";
import type { BabyEvent } from "../types/events";
import { getBabyProfile } from "../utils/profileStorage";

interface MedicineTrackerProps {
  events: BabyEvent[];
  selectedDate: string;
  onAddMedicine: (event: BabyEvent) => void;
  compact?: boolean;
}

export const MedicineTracker = ({
  events,
  selectedDate,
  onAddMedicine,
  compact = false,
}: MedicineTrackerProps) => {
  const [expanded, setExpanded] = useState(false);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:00");
  const [notes, setNotes] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("");

  const medicinePresets = getBabyProfile().medicines;

  const medicines = useMemo(
    () =>
      events
        .filter(
          (event) =>
            event.type === "medicine" &&
            event.timestamp.toDateString() ===
              new Date(`${selectedDate}T00:00:00`).toDateString(),
        )
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [events, selectedDate],
  );

  const addMedicine = () => {
    const selectedPreset = medicinePresets.find(
      (medicine) => medicine.id === selectedPresetId,
    );
    const finalName = selectedPreset?.name ?? name.trim();
    if (!finalName) return;
    onAddMedicine({
      id: crypto.randomUUID(),
      type: "medicine",
      timestamp: new Date(`${selectedDate}T${time}:00`),
      metadata: {
        name: finalName,
        dosage: (selectedPreset?.dosage ?? dosage.trim()) || "as advised",
        notes: notes.trim() || selectedPreset?.notes || undefined,
      },
    });
    setName("");
    setDosage("");
    setTime("08:00");
    setNotes("");
    setSelectedPresetId("");
  };

  return (
    <section
      className={`rounded-3xl border border-white/60 bg-white/50 ${compact ? "p-3" : "p-5"} shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Today's medicines
        </h2>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300"
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>

      {expanded && (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <select
              value={selectedPresetId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedPresetId(id);
                const preset = medicinePresets.find(
                  (medicine) => medicine.id === id,
                );
                if (preset) {
                  setName(preset.name);
                  setDosage(preset.dosage);
                  setNotes(preset.notes ?? "");
                }
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Pick saved medicine</option>
              {medicinePresets.map((medicine) => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name} • {medicine.dosage}
                </option>
              ))}
            </select>
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
        </>
      )}

      <div className="mt-3 space-y-2">
        {medicines.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No medicines logged for this day.
          </p>
        )}
        {medicines.map((med) => {
          return (
            <div
              key={med.id}
              className="flex items-center justify-between rounded-xl border border-white/70 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-800/70"
            >
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-100">
                  {String(med.metadata?.name ?? "Medicine")} •{" "}
                  {String(med.metadata?.dosage ?? "as advised")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {med.timestamp.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {med.metadata?.notes
                    ? ` • ${String(med.metadata.notes)}`
                    : ""}
                </p>
              </div>
              <span className="rounded-lg bg-violet-100 px-2 py-1 text-xs text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                Logged
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
