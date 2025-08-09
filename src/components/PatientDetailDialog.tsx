import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Patient, PatientNote, PathologyReport } from "@/types/patient";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  patient: Patient;
  trigger: React.ReactNode;
  onSave?: (updated: Patient) => void | Promise<void>;
};

export default function PatientDetailDialog({ patient, trigger, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [notes, setNotes] = useState<PatientNote[]>(patient.notes ?? []);
  const [reports, setReports] = useState<PathologyReport[]>(patient.pathologyReports ?? []);
  const images = useMemo(() => patient.photos ?? [], [patient.photos]);

  useEffect(() => {
    if (open) {
      setNotes(patient.notes ?? []);
      setReports(patient.pathologyReports ?? []);
    }
  }, [open, patient]);

  async function saveAll() {
    try {
      setWorking(true);
      await Promise.resolve(onSave?.({ ...patient, notes, pathologyReports: reports }));
      setOpen(false);
    } finally {
      setWorking(false);
    }
  }

  function addNote() {
    const n: PatientNote = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      text: "",
    };
    setNotes((prev) => [n, ...prev]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Patient Record</DialogTitle>
          <DialogDescription>Notes, pathology reports, images and history.</DialogDescription>
        </DialogHeader>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Name</div>
            <div className="font-medium">{patient.name}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Age</div>
            <div className="font-medium">{patient.age}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Date of Birth</div>
            <div className="font-medium">{patient.dateOfBirth ?? '—'}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-muted-foreground">Address</div>
            <div className="font-medium">{patient.residentialAddress ?? '—'}</div>
          </div>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="pathology">Pathology</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Free-form clinical notes</div>
              <Button size="sm" onClick={addNote}>New Note</Button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
              {notes.length === 0 && <div className="text-sm text-muted-foreground">No notes yet.</div>}
              {notes.map((n, idx) => (
                <div key={n.id} className="border rounded p-3 space-y-2">
                  <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                  <Textarea value={n.text} onChange={(e) => setNotes((prev) => prev.map((x, i) => i === idx ? { ...x, text: e.target.value } : x))} placeholder="Enter note..." />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pathology" className="mt-4 space-y-3">
            <div className="text-sm text-muted-foreground">Record summaries of pathology results. File uploads can be added later.</div>
            <div className="space-y-3">
              {reports.length === 0 && <div className="text-sm text-muted-foreground">No pathology records.</div>}
              {reports.map((r, idx) => (
                <div key={r.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center border rounded p-3">
                  <input className="border rounded px-2 py-1" placeholder="Date" value={r.date} onChange={(e) => setReports((prev) => prev.map((x, i) => i === idx ? { ...x, date: e.target.value } : x))} />
                  <input className="border rounded px-2 py-1" placeholder="Title" value={r.title} onChange={(e) => setReports((prev) => prev.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} />
                  <input className="border rounded px-2 py-1 md:col-span-1 col-span-1" placeholder="Summary" value={r.resultSummary ?? ''} onChange={(e) => setReports((prev) => prev.map((x, i) => i === idx ? { ...x, resultSummary: e.target.value } : x))} />
                </div>
              ))}
              <Button size="sm" onClick={() => setReports((prev) => [{ id: crypto.randomUUID(), date: new Date().toISOString().slice(0,10), title: "", resultSummary: "" }, ...prev])}>Add Report</Button>
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            {images.length === 0 ? (
              <div className="text-sm text-muted-foreground">No images.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[60vh] overflow-auto pr-1">
                {images.map((src, i) => (
                  <img key={i} src={src} alt="patient" className="w-full h-28 object-cover rounded border" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-2">
            <div className="text-sm text-muted-foreground">Timeline of notes and report entries.</div>
            <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
              {[...reports.map((r) => ({ t: r.date, type: 'Report', title: r.title })), ...notes.map((n) => ({ t: n.createdAt, type: 'Note', title: n.text.slice(0,60) }))]
                .sort((a, b) => (a.t < b.t ? 1 : -1))
                .map((e, idx) => (
                  <div key={idx} className="text-sm border rounded px-3 py-2 flex items-center justify-between">
                    <div className="truncate">
                      <span className="text-muted-foreground mr-2">{new Date(e.t).toLocaleString()}</span>
                      <span className="font-medium">{e.type}:</span> {e.title}
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
          <Button type="button" onClick={saveAll} disabled={working} aria-busy={working}>{working ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


