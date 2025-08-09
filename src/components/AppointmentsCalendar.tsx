import { useMemo, useState, useRef } from "react";
import {
  Calendar as RBCalendar,
  dateFnsLocalizer,
  Views,
  SlotInfo,
  Event as RBCEvent,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { format, parse, startOfWeek, getDay, addDays, addWeeks, addMonths } from "date-fns";
import { enAU } from "date-fns/locale/en-AU";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Filter } from "lucide-react";

type AppointmentType = "Skin Check" | "Long Consult" | "Suture Removal";

type Practitioner = "Dr. Patel" | "Dr. Wong" | "Dr. Nguyen" | "Nurse Smith";

type UploadedImage = {
  src: string;
  name: string;
  takenAt?: string; // yyyy-mm-dd
};

type AppointmentEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  practitioner: Practitioner;
  appointmentType: AppointmentType;
  receptionNotes?: string;
  clinicalNotes?: string;
  patientName: string;
  images?: UploadedImage[];
};

const PRACTITIONERS: Practitioner[] = [
  "Dr. Patel",
  "Dr. Wong",
  "Dr. Nguyen",
  "Nurse Smith",
];

const APPOINTMENT_TYPES: AppointmentType[] = [
  "Skin Check",
  "Long Consult",
  "Suture Removal",
];

const TYPE_COLOR: Record<AppointmentType, string> = {
  "Skin Check": "#2563eb",
  "Long Consult": "#059669",
  "Suture Removal": "#ea580c",
};

const MOCK_PATIENTS = [
  "Sarah Mitchell",
  "James Wilson",
  "Emma Thompson",
  "Robert Chen",
  "Michael Brown",
  "Lisa Anderson",
  "David Kim",
  "Anna Rodriguez",
  "Daniel Garcia",
  "Olivia Martin",
];

function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

const DnDCalendar = withDragAndDrop(RBCalendar as any);

export default function AppointmentsCalendar() {
  // Filters
  const [selectedView, setSelectedView] = useState<typeof Views[keyof typeof Views]>(Views.WEEK);
  const [filterPractitioner, setFilterPractitioner] = useState<Practitioner | "All">("All");
  const [filterType, setFilterType] = useState<AppointmentType | "All">("All");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Events
  const [events, setEvents] = useState<AppointmentEvent[]>([
    {
      id: "1",
      title: "Sarah Mitchell — Skin Check",
      start: addMinutes(new Date(), 60),
      end: addMinutes(new Date(), 90),
      practitioner: "Dr. Patel",
      appointmentType: "Skin Check",
      patientName: "Sarah Mitchell",
      receptionNotes: "New lesion on left forearm",
    },
    {
      id: "2",
      title: "James Wilson — Long Consult",
      start: addMinutes(new Date(), 150),
      end: addMinutes(new Date(), 180),
      practitioner: "Dr. Wong",
      appointmentType: "Long Consult",
      patientName: "James Wilson",
      receptionNotes: "Review biopsy results",
    },
  ]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesPractitioner = filterPractitioner === "All" || ev.practitioner === filterPractitioner;
      const matchesType = filterType === "All" || ev.appointmentType === filterType;
      return matchesPractitioner && matchesType;
    });
  }, [events, filterPractitioner, filterType]);

  // Creation/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [practitioner, setPractitioner] = useState<Practitioner>(PRACTITIONERS[0]);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>(APPOINTMENT_TYPES[0]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addMinutes(new Date(), 30));
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [durationInput, setDurationInput] = useState<string>("30");
  const [receptionNotes, setReceptionNotes] = useState("");
  // 12-hour time controls for edit dialog
  const [startDatePart, setStartDatePart] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [startHour12, setStartHour12] = useState<number>(12);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [startMeridiem, setStartMeridiem] = useState<"AM" | "PM">("AM");

  const patientSuggestions = useMemo(() => {
    const q = patientName.trim().toLowerCase();
    if (!q) return [] as string[];
    return MOCK_PATIENTS.filter((p) => p.toLowerCase().includes(q)).slice(0, 5);
  }, [patientName]);

  function openCreateDialog(slot: SlotInfo) {
    const start = slot.start as Date;
    const end = (slot.end as Date) ?? addMinutes(start, 30);
    setEditingEventId(null);
    setPatientName("");
    setPractitioner(PRACTITIONERS[0]);
    setAppointmentType(APPOINTMENT_TYPES[0]);
    setStartDate(start);
    setEndDate(end);
    const mins = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));
    setDurationMinutes(mins);
    setDurationInput(String(mins));
    setReceptionNotes("");
    // initialize 12h controls
    setStartDatePart(format(start, "yyyy-MM-dd"));
    const h = start.getHours();
    const m = start.getMinutes();
    setStartMeridiem(h >= 12 ? "PM" : "AM");
    setStartHour12(((h % 12) || 12));
    setStartMinute(m);
    setDialogOpen(true);
  }

  function openEditDialog(evClicked: AppointmentEvent) {
    const ev = events.find((e) => e.id === evClicked.id);
    if (!ev) return;
    setEditingEventId(ev.id);
    setPatientName(ev.patientName);
    setPractitioner(ev.practitioner);
    setAppointmentType(ev.appointmentType);
    setStartDate(ev.start);
    setEndDate(ev.end || addMinutes(ev.start, 30));
    const mins = Math.max(15, Math.round(((ev.end?.getTime() || 0) - ev.start.getTime()) / 60000));
    setDurationMinutes(mins);
    setDurationInput(String(mins));
    setReceptionNotes(ev.receptionNotes || "");
    // initialize 12h controls from existing event time
    setStartDatePart(format(ev.start, "yyyy-MM-dd"));
    const eh = ev.start.getHours();
    const em = ev.start.getMinutes();
    setStartMeridiem(eh >= 12 ? "PM" : "AM");
    setStartHour12(((eh % 12) || 12));
    setStartMinute(em);
    setDialogOpen(true);
  }

  function resetDialog() {
    setDialogOpen(false);
    setEditingEventId(null);
    setPatientName("");
    setReceptionNotes("");
  }

  function handleDurationChange(minsString: string) {
    setDurationInput(minsString);
    if (minsString.trim() === "") {
      return;
    }
    const mins = Number(minsString);
    if (!Number.isFinite(mins)) return;
    if (mins < 5 || mins > 480) return;
    setDurationMinutes(mins);
    const start = new Date(startDate);
    const newEnd = addMinutes(start, mins);
    setEndDate(newEnd);
  }

  function saveAppointment() {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const title = `${patientName || "Untitled"} — ${appointmentType}`;

    if (editingEventId) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEventId
            ? {
                ...e,
                title,
                start,
                end,
                practitioner,
                appointmentType,
                receptionNotes,
                patientName: patientName || "Untitled",
              }
            : e
        )
      );
    } else {
      const newEvent: AppointmentEvent = {
        id: `${Date.now()}`,
        title,
        start,
        end,
        practitioner,
        appointmentType,
        receptionNotes,
        patientName: patientName || "Untitled",
      };
      setEvents((prev) => [...prev, newEvent]);
    }

    resetDialog();
  }

  function deleteAppointment() {
    if (!editingEventId) return;
    setEvents((prev) => prev.filter((e) => e.id !== editingEventId));
    resetDialog();
  }

  // date-fns localizer for react-big-calendar
  const locales = { "en-AU": enAU } as const;
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
  });

  const eventPropGetter = (event: AppointmentEvent) => {
    const backgroundColor = TYPE_COLOR[event.appointmentType];
    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color: "#fff",
        padding: "2px 6px",
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.1,
      },
    };
  };

  function EventContent({ event }: { event: AppointmentEvent }) {
    return (
      <div className="leading-tight">
        <div className="truncate text-[11px]">
          <span className="font-semibold">{event.patientName}</span>
          <span className="opacity-90"> — {event.appointmentType}</span>
        </div>
      </div>
    );
  }

  function updateStartFromParts(part?: Partial<{ datePart: string; hour12: number; minute: number; meridiem: "AM" | "PM" }>) {
    const datePart = part?.datePart ?? startDatePart;
    const hour12 = part?.hour12 ?? startHour12;
    const minute = part?.minute ?? startMinute;
    const meridiem = part?.meridiem ?? startMeridiem;

    const base = parse(datePart, "yyyy-MM-dd", new Date());
    const hour24 = (hour12 % 12) + (meridiem === "PM" ? 12 : 0);
    const next = new Date(base);
    next.setHours(hour24, minute, 0, 0);
    setStartDate(next);
    setEndDate(addMinutes(next, durationMinutes));
  }

  function updateEventTimes(eventId: string, start: Date, end: Date) {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, start, end } : e)));
    if (editingEventId === eventId) {
      setStartDate(start);
      setEndDate(end);
      const mins = Math.max(5, Math.round((end.getTime() - start.getTime()) / 60000));
      setDurationMinutes(mins);
      setDurationInput(String(mins));
      setStartDatePart(format(start, "yyyy-MM-dd"));
      const h = start.getHours();
      setStartMeridiem(h >= 12 ? "PM" : "AM");
      setStartHour12(((h % 12) || 12));
      setStartMinute(start.getMinutes());
    }
  }

  function navigateCalendar(direction: "prev" | "next" | "today") {
    if (direction === "today") {
      setCurrentDate(new Date());
      return;
    }
    if (selectedView === Views.DAY) {
      setCurrentDate((d) => (direction === "next" ? addDays(d, 1) : addDays(d, -1)));
    } else if (selectedView === Views.WEEK) {
      setCurrentDate((d) => (direction === "next" ? addWeeks(d, 1) : addWeeks(d, -1)));
    } else {
      setCurrentDate((d) => (direction === "next" ? addMonths(d, 1) : addMonths(d, -1)));
    }
  }

  // Distinguish single vs double click with a timer
  const singleClickTimerRef = useRef<number | undefined>(undefined);
  function handleEventClick(e: AppointmentEvent) {
    if (singleClickTimerRef.current) {
      window.clearTimeout(singleClickTimerRef.current);
    }
    singleClickTimerRef.current = window.setTimeout(() => {
      openEditDialog(e);
      singleClickTimerRef.current = undefined;
    }, 250);
  }
  function handleEventDoubleClick(e: AppointmentEvent) {
    if (singleClickTimerRef.current) {
      window.clearTimeout(singleClickTimerRef.current);
      singleClickTimerRef.current = undefined;
    }
    openNotesDialog(e);
  }

  // Clinical Notes & Images dialog state
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesEventId, setNotesEventId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>("");

  function openNotesDialog(ev: AppointmentEvent) {
    setNotesEventId(ev.id);
    setNotesText(ev.clinicalNotes || "");
    setNotesDialogOpen(true);
  }

  function saveNotesDialog() {
    if (!notesEventId) return;
    setEvents((prev) => prev.map((e) => (e.id === notesEventId ? { ...e, clinicalNotes: notesText } : e)));
    setNotesDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="clinical-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateCalendar("prev")}>
                Back
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateCalendar("today")}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateCalendar("next")}>
                Next
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={selectedView === Views.MONTH ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView(Views.MONTH)}
                className="gap-2"
              >
                <CalendarIcon className="h-4 w-4" /> Month
              </Button>
              <Button
                variant={selectedView === Views.WEEK ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView(Views.WEEK)}
              >
                Week
              </Button>
              <Button
                variant={selectedView === Views.DAY ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView(Views.DAY)}
              >
                Day
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Practitioner</Label>
                <Select
                  value={filterPractitioner}
                  onValueChange={(v) => setFilterPractitioner(v as Practitioner | "All")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {PRACTITIONERS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Type</Label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as AppointmentType | "All")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {APPOINTMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setFilterPractitioner("All");
                  setFilterType("All");
                }}
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <div className="rounded-md border bg-surface-primary overflow-hidden">
        <DndProvider backend={HTML5Backend}>
        <DnDCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          view={selectedView}
          onView={(v) => setSelectedView(v)}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          showAllDay={false}
          selectable
          onSelectSlot={openCreateDialog}
          onSelectEvent={(e) => handleEventClick(e as AppointmentEvent)}
          onDoubleClickEvent={(e) => handleEventDoubleClick(e as AppointmentEvent)}
          defaultDate={new Date()}
          step={15}
          timeslots={2}
          min={new Date(new Date().setHours(0, 0, 0, 0))}
          max={new Date(new Date().setHours(23, 59, 59, 999))}
          toolbar={false}
          formats={{
            weekdayFormat: (date, culture, local) => local!.format(date, "dd EEE"),
            dayFormat: (date, culture, local) => local!.format(date, "dd EEE"),
          }}
          scrollToTime={new Date(new Date().setHours(8, 0, 0, 0))}
          style={{ height: "80vh" }}
          eventPropGetter={eventPropGetter}
          components={{ event: EventContent as unknown as RBCEvent }}
          popup
          dayPropGetter={() => ({ style: { overflow: 'hidden' } })}
          resizable
          draggableAccessor={() => true}
          onEventDrop={({ event, start, end }) => {
            updateEventTimes((event as any).id as string, start as Date, end as Date);
          }}
          onEventResize={({ event, start, end }) => {
            updateEventTimes((event as any).id as string, start as Date, end as Date);
          }}
        />
        </DndProvider>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => (o ? setDialogOpen(true) : resetDialog())}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editingEventId ? "Edit Appointment" : "New Appointment"}</DialogTitle>
            <DialogDescription>
              {editingEventId ? "Update appointment details" : "Fill in the details to schedule an appointment"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="patient">Patient</Label>
              <Input
                id="patient"
                placeholder="Type patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              {patientSuggestions.length > 0 && (
                <div className="mt-1 rounded-md border bg-surface-secondary p-2 text-sm">
                  <div className="text-xs text-muted-foreground mb-1">Suggestions</div>
                  <div className="flex flex-wrap gap-2">
                    {patientSuggestions.map((s) => (
                      <Button key={s} variant="secondary" size="sm" onClick={() => setPatientName(s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Practitioner</Label>
              <Select value={practitioner} onValueChange={(v) => setPractitioner(v as Practitioner)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PRACTITIONERS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={appointmentType}
                onValueChange={(v) => setAppointmentType(v as AppointmentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={startDatePart}
                onChange={(e) => {
                  setStartDatePart(e.target.value);
                  updateStartFromParts({ datePart: e.target.value });
                }}
              />
              <div className="mt-2 flex items-center gap-2">
                <Select value={String(startHour12)} onValueChange={(v) => { setStartHour12(Number(v)); updateStartFromParts({ hour12: Number(v) }); }}>
                  <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <SelectItem key={h} value={String(h)}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(startMinute)} onValueChange={(v) => { setStartMinute(Number(v)); updateStartFromParts({ minute: Number(v) }); }}>
                  <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0,5,10,15,20,25,30,35,40,45,50,55].map((m) => (
                      <SelectItem key={m} value={String(m)}>{m.toString().padStart(2, '0')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={startMeridiem} onValueChange={(v) => { setStartMeridiem(v as any); updateStartFromParts({ meridiem: v as any }); }}>
                  <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                max={480}
                step={5}
                value={durationInput}
                onChange={(e) => handleDurationChange(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Reception Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any clinical or admin notes..."
                value={receptionNotes}
                onChange={(e) => setReceptionNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingEventId && (
              <Button variant="destructive" onClick={deleteAppointment}>
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button onClick={saveAppointment}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clinical Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={(o) => setNotesDialogOpen(o)}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Clinical Notes</DialogTitle>
            <DialogDescription>
              {(() => {
                const ev = events.find((e) => e.id === notesEventId);
                if (!ev) return null;
                return (
                  <span>
                    {ev.patientName} — {ev.appointmentType} • {format(ev.start, "EEE d MMM p")}
                  </span>
                );
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div>
              <Label htmlFor="clin-notes">Notes</Label>
              <Textarea
                id="clin-notes"
                placeholder="Clinical notes for this appointment..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="min-h-[140px]"
              />
            </div>

            {/* image upload section removed per request */}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={saveNotesDialog}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* image preview removed */}
    </div>
  );
}

