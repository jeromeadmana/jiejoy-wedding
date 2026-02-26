import { z } from "zod";

export const guestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  is_child: z.boolean(),
});

export const rsvpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  attending: z.boolean(),
  guest_count: z.number().int().min(0).max(5),
  dietary_notes: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
  guests: z.array(guestSchema).optional(),
  invitation_code: z.string().min(1, "Invitation code is required"),
});

export const invitationSchema = z.object({
  guest_name: z.string().min(2, "Guest name is required"),
  max_guests: z.number().int().min(1).max(10),
});

export const bulkInvitationSchema = z.object({
  entries: z.array(invitationSchema).min(1, "At least one invitation is required"),
});

export type RsvpFormData = z.input<typeof rsvpSchema>;
export type GuestData = z.infer<typeof guestSchema>;
