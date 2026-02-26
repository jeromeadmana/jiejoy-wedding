export interface Rsvp {
  id: string;
  name: string;
  email: string;
  attending: boolean;
  guest_count: number;
  dietary_notes: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface RsvpGuest {
  id: string;
  rsvp_id: string;
  name: string;
  is_child: boolean;
}

export interface RsvpWithGuests extends Rsvp {
  jiejoy_rsvp_guests: RsvpGuest[];
}

export interface RsvpStats {
  totalRsvps: number;
  attending: number;
  notAttending: number;
  totalGuests: number;
}
