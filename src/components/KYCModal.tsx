"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Camera, CheckCircle2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useAppStore } from "@/lib/store";
import { personalInfoIsValid } from "@/lib/kycValidation";
import type { KycDocumentType } from "@/lib/types";

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const DOCUMENT_TYPE_LABELS: Record<KycDocumentType, string> = {
  PASSPORT: "Passport",
  NATIONAL_ID: "National ID",
  DRIVERS_LICENSE: "Driver's License",
};

interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
}

type Step = 1 | 2 | 3 | "done";

// Document/selfie images are only ever held here as local preview object
// URLs — they're never sent to submitKyc or persisted. See the comment on
// submitKyc in mock/service.ts for why.
export function KYCModal({ onClose }: { onClose: () => void }) {
  const currentUser = useAppStore((s) => s.state.currentUser);
  const submitKyc = useAppStore((s) => s.submitKyc);
  const error = useAppStore((s) => s.error);

  const [step, setStep] = useState<Step>(1);
  const [info, setInfo] = useState<PersonalInfo>({
    fullName: currentUser.name,
    dateOfBirth: "",
    country: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  });
  const [documentType, setDocumentType] = useState<KycDocumentType>("PASSPORT");
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const containerRef = useFocusTrap<HTMLDivElement>(onClose);

  useEffect(() => {
    return () => {
      [frontPreview, backPreview, selfiePreview].forEach((url) => url && URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  const step1Valid = personalInfoIsValid(info);
  const step2Valid = frontPreview && backPreview;
  const step3Valid = selfiePreview && confirmed;

  function handleSubmit() {
    submitKyc({
      fullName: info.fullName.trim(),
      dateOfBirth: info.dateOfBirth,
      country: info.country,
      addressLine1: info.addressLine1.trim(),
      addressLine2: info.addressLine2.trim() || undefined,
      city: info.city.trim(),
      postalCode: info.postalCode.trim(),
      documentType,
    });
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kyc-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="kyc-modal-title" className="text-lg font-semibold text-ink">
            {step === "done" ? "Verification submitted" : "Identity verification"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-secondary hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {step !== "done" && (
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-secondary">Step {step} of 3</p>
        )}

        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="kyc-fullname" className="text-sm font-medium text-ink">
                Full name
              </label>
              <input
                id="kyc-fullname"
                value={info.fullName}
                onChange={(e) => setInfo({ ...info, fullName: e.target.value })}
                className={FIELD_CLASSES}
              />
            </div>
            <div>
              <label htmlFor="kyc-dob" className="text-sm font-medium text-ink">
                Date of birth
              </label>
              <input
                id="kyc-dob"
                type="date"
                value={info.dateOfBirth}
                onChange={(e) => setInfo({ ...info, dateOfBirth: e.target.value })}
                className={FIELD_CLASSES}
              />
            </div>
            <div>
              <label htmlFor="kyc-country" className="text-sm font-medium text-ink">
                Country
              </label>
              <CountrySelect
                id="kyc-country"
                value={info.country}
                onChange={(code) => setInfo({ ...info, country: code })}
              />
            </div>
            <div>
              <label htmlFor="kyc-address1" className="text-sm font-medium text-ink">
                Address line 1
              </label>
              <input
                id="kyc-address1"
                value={info.addressLine1}
                onChange={(e) => setInfo({ ...info, addressLine1: e.target.value })}
                className={FIELD_CLASSES}
              />
            </div>
            <div>
              <label htmlFor="kyc-address2" className="text-sm font-medium text-ink">
                Address line 2 <span className="text-ink-secondary">(optional)</span>
              </label>
              <input
                id="kyc-address2"
                value={info.addressLine2}
                onChange={(e) => setInfo({ ...info, addressLine2: e.target.value })}
                className={FIELD_CLASSES}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="kyc-city" className="text-sm font-medium text-ink">
                  City
                </label>
                <input
                  id="kyc-city"
                  value={info.city}
                  onChange={(e) => setInfo({ ...info, city: e.target.value })}
                  className={FIELD_CLASSES}
                />
              </div>
              <div>
                <label htmlFor="kyc-postal" className="text-sm font-medium text-ink">
                  Postal code
                </label>
                <input
                  id="kyc-postal"
                  value={info.postalCode}
                  onChange={(e) => setInfo({ ...info, postalCode: e.target.value })}
                  className={FIELD_CLASSES}
                />
              </div>
            </div>
            <Button className="w-full" disabled={!step1Valid} onClick={() => setStep(2)}>
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="kyc-doctype" className="text-sm font-medium text-ink">
                Document type
              </label>
              <select
                id="kyc-doctype"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as KycDocumentType)}
                className={FIELD_CLASSES}
              >
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <UploadField label="Front side" preview={frontPreview} onChange={(e) => handleFileChange(e, setFrontPreview)} />
            <UploadField label="Back side" preview={backPreview} onChange={(e) => handleFileChange(e, setBackPreview)} />

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" disabled={!step2Valid} onClick={() => setStep(3)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 space-y-4">
            <UploadField
              label="Selfie"
              icon={<Camera className="h-5 w-5" aria-hidden="true" />}
              buttonLabel="Take selfie"
              preview={selfiePreview}
              capture
              onChange={(e) => handleFileChange(e, setSelfiePreview)}
            />

            <label className="flex items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              I confirm this is me and these documents are valid.
            </label>

            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button className="flex-1" disabled={!step3Valid} onClick={handleSubmit}>
                Submit for verification
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="mt-5 space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
            <p className="text-sm text-ink">
              Your verification is being reviewed. This typically takes 24-48 hours.
            </p>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadField({
  label,
  buttonLabel,
  icon,
  preview,
  capture,
  onChange,
}: {
  label: string;
  buttonLabel?: string;
  icon?: React.ReactNode;
  preview: string | null;
  capture?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputId = `upload-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="mt-1.5 flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`${label} preview`} className="h-16 w-16 rounded-lg border border-line object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-line text-ink-muted">
            {icon ?? <Upload className="h-5 w-5" aria-hidden="true" />}
          </div>
        )}
        <label
          htmlFor={inputId}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-surface"
        >
          {preview ? "Replace" : buttonLabel ?? "Upload"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          capture={capture ? "user" : undefined}
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
