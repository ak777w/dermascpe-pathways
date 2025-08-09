import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Medication, Prescription } from "@/types/patient";

type Drug = {
  id: string;
  name: string;
  forms?: { form: string; strengths: string[] }[];
  standardRegimens?: Array<{
    dose: string;
    route: string;
    frequency: string;
    duration?: string;
    maxDailyDose?: string;
  }>;
};

async function searchFormulary(q: string): Promise<Drug[]> {
  const res = await fetch(`/api/formulary?q=${encodeURIComponent(q)}`);
  const json = await res.json();
  return json.drugs ?? [];
}

async function checkInteractions(drugIds: string[]): Promise<
  { a: string; b: string; severity: string; summary: string }[]
> {
  if (drugIds.length < 2) return [];
  const res = await fetch(`/api/interactions/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drugIds }),
  });
  const json = await res.json();
  return json.interactions ?? [];
}

type Props = {
  value: Prescription | null;
  onChange: (p: Prescription) => void;
};

export default function PrescriptionComposer({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Drug[]>([]);
  const [items, setItems] = useState<Medication[]>(value?.items ?? []);
  const [advice, setAdvice] = useState<string>(value?.advice ?? "");
  const [interactions, setInteractions] = useState<
    { a: string; b: string; severity: string; summary: string }[]
  >([]);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setResults(await searchFormulary(query));
    }, 200);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const id = setTimeout(async () => {
      const ids = items.map((i) => i.drugId);
      setInteractions(await checkInteractions(ids));
    }, 150);
    return () => clearTimeout(id);
  }, [items]);

  function addDrug(d: Drug, regimen?: Drug["standardRegimens"][number]) {
    const med: Medication = {
      drugId: d.id,
      name: d.name,
      dose: regimen?.dose ?? d.forms?.[0]?.strengths?.[0] ?? "",
      route: regimen?.route ?? "PO",
      frequency: regimen?.frequency ?? "",
      duration: regimen?.duration,
    };
    const next = [med, ...items];
    setItems(next);
    ensureEmit(next, advice);
  }

  function updateItem(index: number, part: Partial<Medication>) {
    const next = items.map((m, i) => (i === index ? { ...m, ...part } : m));
    setItems(next);
    ensureEmit(next, advice);
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    ensureEmit(next, advice);
  }

  function ensureEmit(nextItems: Medication[], nextAdvice: string) {
    onChange({ id: value?.id ?? crypto.randomUUID(), createdAt: value?.createdAt ?? new Date().toISOString(), items: nextItems, advice: nextAdvice });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <Label>Search drug</Label>
          <Input placeholder="Start typing a drug name..." value={query} onChange={(e) => setQuery(e.target.value)} />
          {results.length > 0 && (
            <div className="mt-2 border rounded p-2 max-h-56 overflow-auto text-sm bg-surface-secondary">
              {results.map((d) => (
                <div key={d.id} className="py-1">
                  <div className="font-medium">{d.name}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(d.standardRegimens?.length ? d.standardRegimens : [{} as any]).map((r, idx) => (
                      <Button key={idx} size="sm" variant="secondary" onClick={() => addDrug(d, r as any)}>
                        {r?.dose ? `${r.dose} ${r.route ?? ""} ${r.frequency ?? ""}` : "Add"}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label>Advice to patient</Label>
          <Textarea value={advice} onChange={(e) => { setAdvice(e.target.value); ensureEmit(items, e.target.value); }} placeholder="Counseling notes, precautions, non‑pharmacological advice..." />
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No items yet.</div>
        ) : (
          items.map((m, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-2 items-end border rounded p-2">
              <div className="col-span-1">
                <Label>Drug</Label>
                <Input value={m.name} onChange={(e) => updateItem(idx, { name: e.target.value })} />
              </div>
              <div>
                <Label>Dose</Label>
                <Input value={m.dose} onChange={(e) => updateItem(idx, { dose: e.target.value })} />
              </div>
              <div>
                <Label>Route</Label>
                <Input value={m.route} onChange={(e) => updateItem(idx, { route: e.target.value })} />
              </div>
              <div>
                <Label>Freq</Label>
                <Input value={m.frequency} onChange={(e) => updateItem(idx, { frequency: e.target.value })} />
              </div>
              <div>
                <Label>Duration</Label>
                <Input value={m.duration ?? ""} onChange={(e) => updateItem(idx, { duration: e.target.value })} />
              </div>
              <div className="col-span-5 flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => removeItem(idx)}>Remove</Button>
              </div>
            </div>
          ))
        )}
      </div>

      {interactions.length > 0 && (
        <div className="border rounded p-2 bg-amber-50 text-amber-900">
          <div className="font-medium mb-1">Potential interactions</div>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {interactions.map((x, i) => (
              <li key={i}><span className="font-medium">{x.a} ↔ {x.b}</span> — {x.severity}: {x.summary}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


