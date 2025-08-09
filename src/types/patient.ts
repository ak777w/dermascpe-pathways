export type Patient = {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  medicare: string;
  lastVisit: string;
  nextAppointment: string;
  riskLevel: "High" | "Medium" | "Low";
  totalLesions: number;
  newLesions: number;
  status: string;
  skinType: string;
  familyHistory: string;
  photos?: string[];
};


