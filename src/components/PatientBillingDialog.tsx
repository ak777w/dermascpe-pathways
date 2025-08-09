import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Patient, BillingItem, BillingLedgerEntry } from "@/types/patient";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  patient: Patient;
  trigger: React.ReactNode;
  onSave?: (updated: Patient) => void | Promise<void>;
};

export default function PatientBillingDialog({ patient, trigger, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [billingNotes, setBillingNotes] = useState<string>(patient.billingNotes ?? "");
  const [balance, setBalance] = useState<string>(
    Number.isFinite(patient.outstandingBalanceCents)
      ? ((patient.outstandingBalanceCents ?? 0) / 100).toFixed(2)
      : "0.00"
  );
  const [items, setItems] = useState<BillingItem[]>(patient.billingItems ?? []);
  const [selectedItemCode, setSelectedItemCode] = useState<string>("");
  const [ledger, setLedger] = useState<BillingLedgerEntry[]>(patient.billingLedger ?? []);

  // Minimal illustrative lists (extend as needed or source from backend)
  // Example rebate values (AUD cents). Replace with authoritative schedule as needed.
  const gpConsultationItems: BillingItem[] = [
    { code: "3", description: "Level A GP consultation", rebateCents: 1785 },
    { code: "23", description: "Level B GP consultation", rebateCents: 4350 },
    { code: "36", description: "Level C GP consultation", rebateCents: 7965 },
    { code: "44", description: "Level D GP consultation", rebateCents: 11600 },
  ];
  const excisionItems: BillingItem[] = [
    { code: "30071", description: "Excision of skin lesion - benign, head/neck/limb", rebateCents: 4700 },
    { code: "30072", description: "Excision of skin lesion - benign, trunk", rebateCents: 3950 },
    { code: "31356", description: "Excision of malignant skin lesion <10mm - trunk/limbs", rebateCents: 12765 },
    { code: "31357", description: "Excision of malignant skin lesion 10–20mm - trunk/limbs", rebateCents: 16645 },
    { code: "31360", description: "Excision of malignant skin lesion - face/scalp/neck/hand/feet", rebateCents: 21230 },
  ];

  useEffect(() => {
    if (open) {
      setBillingNotes(patient.billingNotes ?? "");
      setBalance(Number.isFinite(patient.outstandingBalanceCents) ? ((patient.outstandingBalanceCents ?? 0) / 100).toFixed(2) : "0.00");
      setItems(patient.billingItems ?? []);
      setSelectedItemCode("");
      setLedger(patient.billingLedger ?? []);
    }
  }, [open, patient]);

  async function save() {
    try {
      setWorking(true);
      const cents = Math.round(parseFloat(balance || "0") * 100);
      await Promise.resolve(onSave?.({ ...patient, billingNotes, billingItems: items, billingLedger: ledger, outstandingBalanceCents: Number.isFinite(cents) ? cents : 0 } as Patient));
      setOpen(false);
    } finally {
      setWorking(false);
    }
  }

  function addSelectedItem() {
    const catalog = [...gpConsultationItems, ...excisionItems];
    const found = catalog.find((x) => x.code === selectedItemCode);
    if (!found) return;
    const entry: BillingItem = { ...found, date: new Date().toISOString().slice(0, 10) };
    setItems((prev) => [entry, ...prev]);
    // Autofill outstanding balance as 2x rebate if empty or zero
    const rebate = found.rebateCents ?? 0;
    const currentCents = Math.round(parseFloat(balance || "0") * 100) || 0;
    if (rebate > 0 && currentCents === 0) {
      const newCents = rebate * 2;
      setBalance((newCents / 100).toFixed(2));
    }
    const newBalanceCents = Math.round(parseFloat((rebate * 2 / 100).toFixed(2)) * 100);
    const entryLedger: BillingLedgerEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      action: `Added item ${found.code}`,
      amountCents: rebate * 2,
      balanceCents: (Math.round(parseFloat(balance || "0") * 100) || 0) + (rebate * 2),
      note: found.description,
    };
    setLedger((prev) => [entryLedger, ...prev]);
    setSelectedItemCode("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Billing</DialogTitle>
          <DialogDescription>Record billing notes and outstanding balance.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Outstanding Balance (AUD)</label>
            <input className="mt-1 w-full border rounded px-2 py-1" type="number" step="0.01" min="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Add Medicare Item</div>
            <div className="flex items-center gap-2">
              <Select value={selectedItemCode} onValueChange={setSelectedItemCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose GP consultation or excision item" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <div className="px-2 py-1 text-xs text-muted-foreground">GP Consultations</div>
                  {gpConsultationItems.map((i) => (
                    <SelectItem key={i.code} value={i.code}>{i.code} — {i.description} (rebate ${((i.rebateCents ?? 0)/100).toFixed(2)})</SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-muted-foreground">Excision Items</div>
                  {excisionItems.map((i) => (
                    <SelectItem key={i.code} value={i.code}>{i.code} — {i.description} (rebate ${((i.rebateCents ?? 0)/100).toFixed(2)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addSelectedItem} disabled={!selectedItemCode}>Add</Button>
            </div>
            {items.length > 0 && (
              <div className="border rounded divide-y mt-2">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                    <div className="truncate">
                      <span className="font-medium mr-2">{it.code}</span>
                      <span className="text-muted-foreground">{it.description}</span>
                      {it.date && <span className="ml-2 text-muted-foreground">({it.date})</span>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Billing Notes</label>
            <Textarea value={billingNotes} onChange={(e) => setBillingNotes(e.target.value)} placeholder="e.g., Medicare claim lodged 08/09; awaiting gap payment" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
          <Button type="button" onClick={save} disabled={working} aria-busy={working}>{working ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Billing History</div>
          {ledger.length === 0 ? (
            <div className="text-sm text-muted-foreground">No billing actions recorded.</div>
          ) : (
            <div className="border rounded divide-y max-h-60 overflow-auto">
              {ledger.map((l) => (
                <div key={l.id} className="px-3 py-2 text-sm flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-muted-foreground mr-2">{new Date(l.date).toLocaleString()}</span>
                    <span className="font-medium">{l.action}</span>
                    {l.note && <span className="text-muted-foreground ml-2">— {l.note}</span>}
                  </div>
                  <div className="ml-2 whitespace-nowrap text-right">
                    {typeof l.amountCents === 'number' && <div>{l.amountCents >= 0 ? '+' : '-'}${Math.abs(l.amountCents/100).toFixed(2)}</div>}
                    {typeof l.balanceCents === 'number' && <div className="text-xs text-muted-foreground">Bal: ${ (l.balanceCents/100).toFixed(2) }</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


