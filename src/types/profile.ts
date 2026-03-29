export interface MedicinePreset {
  id: string;
  name: string;
  dosage: string;
  notes?: string;
}

export interface BabyProfile {
  name: string;
  dob: string;
  gender: string;
  notes: string;
  medicines: MedicinePreset[];
}
