export type Patient = {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  medicare: string;
  dateOfBirth?: string; // ISO yyyy-mm-dd
  // New fields
  insuranceProvider?: string;
  insuranceMemberNumber?: string;
  residentialAddress?: string;
  postalAddress?: string;
  lastVisit: string;
  nextAppointment: string;
  riskLevel: "High" | "Medium" | "Low";
  // Optional free-form category label if needed
  riskCategory?: string;
  // Billing-related optional fields
  billingNotes?: string;
  outstandingBalanceCents?: number;
  billingItems?: BillingItem[];
  billingLedger?: BillingLedgerEntry[];
  totalLesions: number;
  newLesions: number;
  status: string;
  skinType: string;
  familyHistory: string;
  photos?: string[];
  photoMeta?: Record<string, PhotoTag>;
  notes?: PatientNote[];
  pathologyReports?: PathologyReport[];
};

export type PatientNote = {
  id: string;
  createdAt: string; // ISO string
  author?: string;
  text: string;
};

export type PathologyReport = {
  id: string;
  date: string; // ISO string or yyyy-mm-dd
  title: string;
  resultSummary?: string;
  fileUrl?: string; // future use
};

export type BillingItem = {
  code: string; // MBS item number
  description: string;
  feeCents?: number; // deprecated, use rebateCents
  rebateCents?: number;
  date?: string; // yyyy-mm-dd
  notes?: string;
};

export type BillingLedgerEntry = {
  id: string;
  date: string; // ISO or yyyy-mm-dd HH:mm
  action: string; // e.g., "Added item 23", "Updated balance", "Saved billing"
  amountCents?: number; // positive charge or negative payment
  balanceCents?: number; // resulting balance snapshot
  note?: string;
};

export type PhotoTag = {
  location?: string;
  cancerType?: string;
};


