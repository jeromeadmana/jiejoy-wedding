"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { rsvpSchema, type RsvpFormData } from "@/lib/validators";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function RsvpForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
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
    },
  });

  const attending = watch("attending");

  const { fields, replace } = useFieldArray({ control, name: "guests" });

  // Sync guest rows with guest_count
  const handleGuestCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    const newGuests = Array.from({ length: count }, (_, i) => ({
      name: fields[i]?.name || "",
      is_child: fields[i]?.is_child || false,
    }));
    replace(newGuests);
  };

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

  if (status === "success") {
    return (
      <SectionWrapper id="rsvp" title="RSVP" subtitle="Let us know if you can make it">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage/10">
            <CheckCircle size={40} className="text-sage" />
          </div>
          <h3 className="mt-6 font-serif text-2xl font-bold">Thank You!</h3>
          <p className="mt-3 text-warm-gray">
            Your RSVP has been received. We can&apos;t wait to celebrate with you!
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => setStatus("idle")}
          >
            Submit Another RSVP
          </Button>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="rsvp"
      title="RSVP"
      subtitle="Let us know if you can make it"
      className="bg-white"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-lg space-y-6 animate-on-scroll"
      >
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
          <span className="text-sm font-semibold text-charcoal">Will you attend?</span>
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
              options={[
                { value: "0", label: "Just me" },
                { value: "1", label: "1 guest" },
                { value: "2", label: "2 guests" },
                { value: "3", label: "3 guests" },
                { value: "4", label: "4 guests" },
                { value: "5", label: "5 guests" },
              ]}
              {...register("guest_count", { valueAsNumber: true })}
              onChange={handleGuestCountChange}
              error={errors.guest_count?.message}
            />

            {/* Dynamic guest rows */}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-warm-gray/20 p-4 space-y-3"
              >
                <p className="text-sm font-semibold text-charcoal">
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
              <label htmlFor="dietary_notes" className="text-sm font-semibold text-charcoal">
                Dietary Restrictions / Allergies
              </label>
              <textarea
                id="dietary_notes"
                rows={2}
                placeholder="Any allergies or dietary needs we should know about?"
                {...register("dietary_notes")}
                className="rounded-lg border border-warm-gray/30 bg-white px-4 py-3 text-charcoal placeholder:text-warm-gray/50 transition-colors duration-200 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-semibold text-charcoal">
            Message to the Couple
          </label>
          <textarea
            id="message"
            rows={3}
            placeholder="Share your well wishes..."
            {...register("message")}
            className="rounded-lg border border-warm-gray/30 bg-white px-4 py-3 text-charcoal placeholder:text-warm-gray/50 transition-colors duration-200 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none"
          />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 rounded-lg bg-dusty-rose/10 px-4 py-3 text-sm text-dusty-rose-dark">
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
      </form>
    </SectionWrapper>
  );
}
