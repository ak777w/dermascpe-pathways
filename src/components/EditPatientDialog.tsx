import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Patient } from "@/types/patient";

type EditPatientDialogProps = {
  patient: Patient;
  onSave: (updated: Patient) => void | Promise<void>;
  trigger: React.ReactNode;
};

export default function EditPatientDialog({ patient, onSave, trigger }: EditPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Patient>(patient);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(patient);
  }, [open, patient]);

  function handleChange<K extends keyof Patient>(key: K, value: Patient[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function doSave() {
    try {
      setIsSaving(true);
      await Promise.resolve(onSave({ ...form }));
    } finally {
      setIsSaving(false);
    }
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doSave();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>Update patient details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min={0} value={form.age} onChange={(e) => handleChange("age", Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" value={form.dateOfBirth ?? ''} onChange={(e) => handleChange("dateOfBirth", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => handleChange("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="medicare">Medicare</Label>
              <Input id="medicare" value={form.medicare} onChange={(e) => handleChange("medicare", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Private Health Insurance Provider</Label>
              <Input id="insuranceProvider" value={form.insuranceProvider ?? ''} onChange={(e) => handleChange("insuranceProvider", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceMemberNumber">Insurance Member Number</Label>
              <Input id="insuranceMemberNumber" value={form.insuranceMemberNumber ?? ''} onChange={(e) => handleChange("insuranceMemberNumber", e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="residentialAddress">Residential Address</Label>
              <Input id="residentialAddress" value={form.residentialAddress ?? ''} onChange={(e) => handleChange("residentialAddress", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="postalAddress">Postal Address</Label>
              <Input id="postalAddress" value={form.postalAddress ?? ''} onChange={(e) => handleChange("postalAddress", e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="riskCategory">Risk Category</Label>
              <Input id="riskCategory" placeholder="e.g., High risk melanoma family history" value={form.riskCategory ?? ''} onChange={(e) => handleChange("riskCategory", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" onClick={() => { void doSave(); }} disabled={isSaving} aria-busy={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


