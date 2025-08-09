import { useEffect, useMemo, useRef, useState } from "react";
// Client-side QR generation as a fallback
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/types/patient";
import { Input } from "@/components/ui/input";

type ManagePatientPhotosDialogProps = {
  patient: Patient;
  onSave: (updatedPhotos: string[]) => void;
  trigger: React.ReactNode;
};

export default function ManagePatientPhotosDialog({ patient, onSave, trigger }: ManagePatientPhotosDialogProps) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>(patient.photos ?? []);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [serverOrigin, setServerOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (open) setPhotos(patient.photos ?? []);
  }, [open, patient]);

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((newImages) => setPhotos((prev) => [...newImages, ...prev]));
  }

  function handleSubmit() {
    onSave(photos);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    // Try to discover LAN address of upload server for mobile devices
    (async () => {
      try {
        const res = await fetch(`http://localhost:8787/addresses`);
        const json = await res.json();
        if (Array.isArray(json.addresses) && json.addresses.length > 0) {
          setServerOrigin(json.addresses[0]);
        } else {
          setServerOrigin(`http://localhost:8787`);
        }
      } catch {
        setServerOrigin(`http://localhost:8787`);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // assume upload server on localhost:8787
    const origin = serverOrigin ?? `http://localhost:8787`;
    const quick = `${origin}/quick-upload?patientId=${encodeURIComponent(String(patient.id))}`;
    setQrUrl(`${origin}/qr?text=${encodeURIComponent(quick)}`);
    // Client-side QR fallback
    QRCode.toDataURL(quick, { margin: 1, width: 240 })
      .then((dataUrl: string) => setQrDataUrl(dataUrl))
      .catch(() => setQrDataUrl(null));
  }, [open, patient.id, serverOrigin]);

  async function syncFromServer() {
    try {
      const origin = serverOrigin ?? `http://localhost:8787`;
      const res = await fetch(`${origin}/photos?patientId=${encodeURIComponent(String(patient.id))}`);
      const json = await res.json();
      if (Array.isArray(json.photos)) setPhotos((prev) => [...json.photos, ...prev]);
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Patient Photos</DialogTitle>
          <DialogDescription>Add or remove photos for this patient.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
            <Button type="button" onClick={() => inputRef.current?.click()}>Add Photos</Button>
          </div>
          <div className="flex items-center gap-4">
            {(qrUrl || qrDataUrl) && (
              <div className="flex items-center gap-3">
                <img src={qrUrl ?? qrDataUrl ?? undefined} alt="QR to upload" className="w-28 h-28 border rounded bg-white" />
                <div className="text-sm text-muted-foreground">
                  Scan to upload from phone
                  <div>
                    <Button type="button" variant="outline" size="sm" onClick={syncFromServer} className="mt-2">Sync</Button>
                  </div>
                  {serverOrigin && (
                    <div className="mt-2">
                      Or open: <a className="underline" href={`${serverOrigin}/quick-upload?patientId=${encodeURIComponent(String(patient.id))}`} target="_blank" rel="noreferrer">{`${serverOrigin}/quick-upload`}</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((src, idx) => (
              <div key={idx} className="relative group border rounded overflow-hidden">
                <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-28 object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white/90 text-sm px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100"
                  onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


