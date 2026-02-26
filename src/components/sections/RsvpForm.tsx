"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, CheckCircle, AlertCircle, Loader2, KeyRound, Clock } from "lucide-react";
import { rsvpSchema, type RsvpFormData } from "@/lib/validators";
import { RSVP_DEADLINE } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Invitation } from "@/types/rsvp";

interface RsvpFormProps {
  invitationCode?: string;
}

export function RsvpForm({ invitationCode: initialCode }: RsvpFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [codeInput, setCodeInput] = useState(initialCode || "");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const isPastDeadline = new Date() > RSVP_DEADLINE;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: "",
      email: "",
      attending: true,
      guest_count: 0,
      dietary_notes: "",
      message: "",
      guests: [],
      invitation_code: initialCode || "",
    },
  });

  const attending = watch("attending");

  const { fields, replace } = useFieldArray({ control, name: "guests" });

  const maxAdditionalGuests = invitation ? invitation.max_guests - 1 : 5;

  // Sync guest rows with guest_count
  const handleGuestCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    const newGuests = Array.from({ length: count }, (_, i) => ({
      name: fields[i]?.name || "",
      is_child: fields[i]?.is_child || false,
    }));
    replace(newGuests);
  };

  const lookupCode = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setCodeLoading(true);
    setCodeError("");
    setAlreadyResponded(false);

    try {
      const res = await fetch(`/api/invitation/${encodeURIComponent(code.trim())}`);
      if (!res.ok) {
        const body = await res.json();
        setCodeError(body.error || "Invalid invitation code");
        setInvitation(null);
        return;
      }

      const data = await res.json();
      setInvitation(data);
      setValue("invitation_code", code.trim());
      setValue("name", data.guest_name);

      if (data.responded) {
        setAlreadyResponded(true);
      }
    } catch {
      setCodeError("Failed to verify code. Please try again.");
      setInvitation(null);
    } finally {
      setCodeLoading(false);
    }
  }, [setValue]);

  // Auto-lookup if code provided via props
  useEffect(() => {
    if (initialCode) {
      lookupCode(initialCode);
    }
  }, [initialCode, lookupCode]);

  const onSubmit = async (data: RsvpFormData) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Something went wrong");
      }

      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  // Deadline passed
  if (isPastDeadline) {
    return (
      <SectionWrapper id="rsvp" title="RSVP" subtitle="Let us know if you can make it">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 15%, transparent)" }}>
            <Clock size={40} style={{ color: "var(--color-warm-gray, #6B6B6B)" }} />
          </div>
          <h3 className="mt-6 font-serif text-2xl font-bold">RSVP Period Has Closed</h3>
          <p className="mt-3" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
            The deadline for RSVPs was September 12, 2026. If you still need to respond, please contact us directly.
          </p>
        </div>
      </SectionWrapper>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <SectionWrapper id="rsvp" title="RSVP" subtitle="Let us know if you can make it">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-sage, #D4849A) 15%, transparent)" }}>
            <CheckCircle size={40} style={{ color: "var(--color-sage, #D4849A)" }} />
          </div>
          <h3 className="mt-6 font-serif text-2xl font-bold">Thank You!</h3>
          <p className="mt-3" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
            Your RSVP has been received. We&apos;ll send a confirmation to your email. We can&apos;t wait to celebrate with you!
          </p>
        </div>
      </SectionWrapper>
    );
  }

  // Already responded state
  if (alreadyResponded) {
    return (
      <SectionWrapper id="rsvp" title="RSVP" subtitle="Let us know if you can make it">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-sage, #D4849A) 15%, transparent)" }}>
            <CheckCircle size={40} style={{ color: "var(--color-sage, #D4849A)" }} />
          </div>
          <h3 className="mt-6 font-serif text-2xl font-bold">Already Responded</h3>
          <p className="mt-3" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
            This invitation has already been used to RSVP. If you need to update your response, please contact us directly.
          </p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="rsvp"
      title="RSVP"
      subtitle="Let us know if you can make it"
      className="bg-surface"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-lg space-y-6 animate-on-scroll"
      >
        {/* Invitation code input (if not already validated) */}
        {!invitation ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="invitation-code" className="text-sm font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
                Invitation Code
              </label>
              <div className="flex gap-2">
                <input
                  id="invitation-code"
                  type="text"
                  placeholder="Enter code from your invitation"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      lookupCode(codeInput);
                    }
                  }}
                  className="flex-1 rounded-lg px-4 py-3 transition-colors duration-200 focus:outline-none"
                  style={{
                    backgroundColor: "var(--color-surface, #FFFFFF)",
                    color: "var(--color-charcoal, #2C2C2C)",
                    border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)",
                  }}
                />
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => lookupCode(codeInput)}
                  disabled={codeLoading || !codeInput.trim()}
                >
                  {codeLoading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                </Button>
              </div>
              {codeError && (
                <p className="text-sm" style={{ color: "var(--color-dusty-rose-dark, #A85050)" }}>
                  {codeError}
                </p>
              )}
            </div>
            <p className="text-center text-sm" style={{ color: "var(--color-warm-gray, #6B6B6B)" }}>
              You can find your invitation code on your physical invitation or scan the QR code.
            </p>
          </div>
        ) : (
          <>
            {/* Verified invitation banner */}
            <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: "color-mix(in srgb, var(--color-sage, #D4849A) 10%, transparent)" }}>
              <CheckCircle size={18} style={{ color: "var(--color-sage-dark, #C06E84)" }} />
              <span className="text-sm" style={{ color: "var(--color-sage-dark, #C06E84)" }}>
                Welcome, <strong>{invitation.guest_name}</strong>! You may bring up to {invitation.max_guests - 1} additional guest{invitation.max_guests - 1 !== 1 ? "s" : ""}.
              </span>
            </div>

            <input type="hidden" {...register("invitation_code")} />

            <Input
              label="Full Name"
              placeholder="Your full name"
              {...register("name")}
              error={errors.name?.message}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              error={errors.email?.message}
            />

            {/* Attending toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>Will you attend?</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    {...register("attending", { setValueAs: (v) => v === "true" })}
                    defaultChecked
                    className="accent-sage"
                  />
                  <span>Joyfully Accept</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    {...register("attending", { setValueAs: (v) => v === "true" })}
                    className="accent-sage"
                  />
                  <span>Regretfully Decline</span>
                </label>
              </div>
            </div>

            {attending && (
              <>
                <Select
                  label="Additional Guests"
                  options={Array.from({ length: maxAdditionalGuests + 1 }, (_, i) => ({
                    value: String(i),
                    label: i === 0 ? "Just me" : `${i} guest${i > 1 ? "s" : ""}`,
                  }))}
                  {...register("guest_count", { valueAsNumber: true })}
                  onChange={handleGuestCountChange}
                  error={errors.guest_count?.message}
                />

                {/* Dynamic guest rows */}
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg p-4 space-y-3"
                    style={{ border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 20%, transparent)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
                      Guest {index + 1}
                    </p>
                    <Input
                      label="Guest Name"
                      placeholder="Guest's full name"
                      {...register(`guests.${index}.name`)}
                      error={errors.guests?.[index]?.name?.message}
                    />
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        {...register(`guests.${index}.is_child`)}
                        className="accent-sage"
                      />
                      Child (under 12)
                    </label>
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dietary_notes" className="text-sm font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
                    Dietary Restrictions / Allergies
                  </label>
                  <textarea
                    id="dietary_notes"
                    rows={2}
                    placeholder="Any allergies or dietary needs we should know about?"
                    {...register("dietary_notes")}
                    className="rounded-lg px-4 py-3 transition-colors duration-200 focus:outline-none resize-none"
                    style={{
                      backgroundColor: "var(--color-surface, #FFFFFF)",
                      color: "var(--color-charcoal, #2C2C2C)",
                      border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)",
                    }}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-semibold" style={{ color: "var(--color-charcoal, #2C2C2C)" }}>
                Message to the Couple
              </label>
              <textarea
                id="message"
                rows={3}
                placeholder="Share your well wishes..."
                {...register("message")}
                className="rounded-lg px-4 py-3 transition-colors duration-200 focus:outline-none resize-none"
                style={{
                  backgroundColor: "var(--color-surface, #FFFFFF)",
                  color: "var(--color-charcoal, #2C2C2C)",
                  border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)",
                }}
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "color-mix(in srgb, var(--color-dusty-rose, #C86464) 10%, transparent)", color: "var(--color-dusty-rose-dark, #A85050)" }}>
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Heart size={18} className="mr-2" />
                  Send RSVP
                </>
              )}
            </Button>
          </>
        )}
      </form>
    </SectionWrapper>
  );
}
