export type Appointment = {
  id: number;
  patientId: number;
  practitionerId: string; // e.g., 'dr_smith'
  practitionerName: string;
  typeCode?: string; // MBS/clinic code
  typeDescription?: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  notes?: string;
};

export type Practitioner = {
  id: string;
  name: string;
  color?: string;
};


