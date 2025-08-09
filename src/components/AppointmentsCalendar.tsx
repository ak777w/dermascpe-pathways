import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Appointment, Practitioner } from "@/types/appointment";
import type { Patient } from "@/types/patient";

const API = "/api";

const defaultPractitioners: Practitioner[] = [
  { id: "dr_lee", name: "Dr Lee", color: "#2563eb" },
  { id: "dr_singh", name: "Dr Singh", color: "#16a34a" },
  { id: "nurse_kim", name: "Nurse Kim", color: "#d97706" },
];

type Props = { patients: Patient[] };

export default function AppointmentsCalendar({ patients }: Props) {
  const [view, setView] = useState<"day" | "week">("day");
  const [date, setDate] = useState(() => new Date());
  const [practitioner, setPractitioner] = useState<string>("all");
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patientName: "",
    patientId: 0,
    practitionerId: defaultPractitioners[0].id,
    typeCode: "",
    typeDescription: "",
    start: "",
    end: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/appointments`);
        const json = await res.json();
        if (Array.isArray(json.appointments)) setAppts(json.appointments);
      } catch {}
    })();
  }, []);

  const patientsIndex = useMemo(() => {
    const idx = new Map<number, Patient>();
    patients.forEach(p => idx.set(p.id, p));
    return idx;
  }, [patients]);

  function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
  function endOfDay(d: Date) { const x = new Date(d); x.setHours(23,59,59,999); return x; }
  function startOfWeek(d: Date) { const x = startOfDay(d); const wd = x.getDay(); return addDays(x, -wd); }
  function endOfWeek(d: Date) { return endOfDay(addDays(startOfWeek(d), 6)); }

  const filteredAppts = useMemo(() => {
    const start = view === "day" ? startOfDay(date).toISOString() : startOfWeek(date).toISOString();
    const end = view === "day" ? endOfDay(date).toISOString() : endOfWeek(date).toISOString();
    return appts.filter(a => a.start >= start && a.end <= end && (practitioner === "all" || a.practitionerId === practitioner));
  }, [appts, date, view, practitioner]);

  function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

  function toTimeLabel(i: number) { return `${String(i).padStart(2,'0')}:00`; }

  function createSlotAppt(slotHour: number) {
    const base = startOfDay(date);
    const s = new Date(base); s.setHours(slotHour, 0, 0, 0);
    const e = new Date(base); e.setHours(slotHour + 1, 0, 0, 0);
    setForm((f) => ({ ...f, start: s.toISOString(), end: e.toISOString() }));
    setOpen(true);
  }

  async function saveAppt() {
    const p = patients.find(p => p.id === form.patientId) || patients.find(p => p.name.toLowerCase() === form.patientName.toLowerCase());
    if (!p) return;
    const prac = defaultPractitioners.find(x => x.id === form.practitionerId) || defaultPractitioners[0];
    const payload: Appointment = {
      id: 0,
      patientId: p.id,
      practitionerId: prac.id,
      practitionerName: prac.name,
      typeCode: form.typeCode,
      typeDescription: form.typeDescription,
      start: form.start,
      end: form.end,
      notes: form.notes,
    };
    try {
      const res = await fetch(`${API}/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const created = await res.json();
        setAppts((prev) => [...prev, created]);
        setOpen(false);
      }
    } catch {}
  }

  const timeSlots = Array.from({ length: 24 }).map((_, i) => i);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(date), i));

  return (
    <Card className="clinical-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Appointments</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={view} onValueChange={(v) => setView(v as any)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="View" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>
            <Select value={practitioner} onValueChange={setPractitioner}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Practitioner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All practitioners</SelectItem>
                {defaultPractitioners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setDate(addDays(date, view === 'day' ? -1 : -7))}>{"<"}</Button>
            <div className="w-40 text-center">{date.toDateString()}</div>
            <Button variant="outline" onClick={() => setDate(addDays(date, view === 'day' ? 1 : 7))}>{">"}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple grid for day view */}
        {view === 'day' && (
          <div className="grid grid-cols-1 gap-2">
            {timeSlots.map((h) => (
              <div key={h} className="border rounded p-2 hover:bg-surface-secondary cursor-pointer" onClick={() => createSlotAppt(h)}>
                <div className="text-xs text-muted-foreground">{toTimeLabel(h)}</div>
                <div className="mt-1 flex flex-col gap-1">
                  {filteredAppts.filter(a => new Date(a.start).getHours() === h).map(a => (
                    <div key={a.id} className="text-sm px-2 py-1 rounded" style={{ background: (defaultPractitioners.find(p => p.id === a.practitionerId)?.color || '#64748b') + '22', borderLeft: `4px solid ${defaultPractitioners.find(p => p.id === a.practitionerId)?.color || '#64748b'}` }}>
                      <span className="font-medium">{patientsIndex.get(a.patientId)?.name ?? 'Patient'}</span>
                      <span className="ml-2 text-muted-foreground">{a.typeCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Week view: columns per day, rows per hour */}
        {view === 'week' && (
          <div className="overflow-auto">
            <div className="min-w-[900px]">
              <div className="grid" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
                {/* Header row */}
                <div></div>
                {weekDays.map((d, idx) => (
                  <div key={idx} className="text-center font-medium py-2 border-b">{d.toDateString()}</div>
                ))}
                {/* Time rows */}
                {timeSlots.map((h) => (
                  <>
                    <div key={`t-${h}`} className="text-xs text-muted-foreground py-2 border-r px-2">{toTimeLabel(h)}</div>
                    {weekDays.map((d, c) => {
                      const slotStart = new Date(d); slotStart.setHours(h, 0, 0, 0);
                      const slotEnd = new Date(d); slotEnd.setHours(h + 1, 0, 0, 0);
                      const inSlot = filteredAppts.filter(a => new Date(a.start) >= slotStart && new Date(a.start) < slotEnd);
                      return (
                        <div key={`c-${h}-${c}`} className="border p-1 hover:bg-surface-secondary cursor-pointer min-h-[44px]" onClick={() => { setDate(d); createSlotAppt(h); }}>
                          {inSlot.map(a => (
                            <div key={a.id} className="text-xs px-2 py-1 rounded mb-1" style={{ background: (defaultPractitioners.find(p => p.id === a.practitionerId)?.color || '#64748b') + '22', borderLeft: `3px solid ${defaultPractitioners.find(p => p.id === a.practitionerId)?.color || '#64748b'}` }}>
                              {patientsIndex.get(a.patientId)?.name ?? 'Patient'} <span className="text-muted-foreground">{a.typeCode}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* New appointment dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Set patient, practitioner, time and notes.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Patient</div>
              <Input placeholder="Type patient name" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
              {/* Lightweight inline suggestions */}
              {form.patientName && (
                <div className="border mt-1 rounded max-h-32 overflow-auto">
                  {patients.filter(p => p.name.toLowerCase().includes(form.patientName.toLowerCase())).slice(0,8).map(p => (
                    <div key={p.id} className="px-2 py-1 cursor-pointer hover:bg-surface-secondary" onClick={() => setForm({ ...form, patientName: p.name, patientId: p.id })}>{p.name}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Practitioner</div>
              <Select value={form.practitionerId} onValueChange={(v) => setForm({ ...form, practitionerId: v })}>
                <SelectTrigger><SelectValue placeholder="Practitioner" /></SelectTrigger>
                <SelectContent>
                  {defaultPractitioners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Start</div>
              <Input type="datetime-local" value={toLocalInput(form.start)} onChange={(e) => setForm({ ...form, start: fromLocalInput(e.target.value) })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">End</div>
              <Input type="datetime-local" value={toLocalInput(form.end)} onChange={(e) => setForm({ ...form, end: fromLocalInput(e.target.value) })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Item Code</div>
              <Input placeholder="e.g., 23" value={form.typeCode} onChange={(e) => setForm({ ...form, typeCode: e.target.value })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Appointment Type</div>
              <Input placeholder="General Consult" value={form.typeDescription} onChange={(e) => setForm({ ...form, typeDescription: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground mb-1">Notes</div>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={saveAppt}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string) {
  if (!v) return ""; return new Date(v).toISOString();
}


