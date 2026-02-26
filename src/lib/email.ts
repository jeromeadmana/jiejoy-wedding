import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_RESEND_API);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

interface RsvpEmailData {
  guestName: string;
  guestEmail: string;
  attending: boolean;
  guestCount: number;
  message?: string | null;
}

export async function sendRsvpConfirmation(data: RsvpEmailData) {
  try {
    await resend.emails.send({
      from: `Jie & Joy Wedding <${FROM_EMAIL}>`,
      to: data.guestEmail,
      subject: data.attending
        ? "We can't wait to see you! 💕"
        : "Thank you for letting us know",
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2C2C2C;">
          <h1 style="text-align: center; font-size: 28px; color: #2C2C2C; margin-bottom: 8px;">Jie & Joy</h1>
          <p style="text-align: center; color: #6B6B6B; font-size: 14px; margin-bottom: 32px;">September 26, 2026</p>
          <hr style="border: none; border-top: 1px solid #E8E8E8; margin-bottom: 32px;" />
          <p style="font-size: 18px;">Dear ${data.guestName},</p>
          ${data.attending
            ? `<p style="font-size: 16px; line-height: 1.6;">Thank you for confirming your attendance! We are so excited to celebrate our special day with you.</p>
               <p style="font-size: 16px; line-height: 1.6;"><strong>Total guests:</strong> ${data.guestCount + 1} (including you)</p>
               <p style="font-size: 16px; line-height: 1.6;"><strong>Ceremony:</strong> 3:00 PM at Our Lady of Peñafrancia Parish</p>
               <p style="font-size: 16px; line-height: 1.6;"><strong>Reception:</strong> 5:30 PM at Royale Emelina</p>`
            : `<p style="font-size: 16px; line-height: 1.6;">We're sorry you won't be able to make it, but we appreciate you letting us know. You'll be missed!</p>`
          }
          <hr style="border: none; border-top: 1px solid #E8E8E8; margin: 32px 0;" />
          <p style="text-align: center; color: #6B6B6B; font-size: 13px;">With love, Jie & Joy 💕</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send RSVP confirmation email:", error);
  }
}

export async function sendCoordinatorNotification(data: RsvpEmailData) {
  const coordinatorEmails = process.env.COORDINATOR_EMAILS?.split(",").map((e) => e.trim()).filter(Boolean);
  if (!coordinatorEmails || coordinatorEmails.length === 0) return;

  try {
    await resend.emails.send({
      from: `Jie & Joy Wedding <${FROM_EMAIL}>`,
      to: coordinatorEmails,
      subject: `New RSVP: ${data.guestName} — ${data.attending ? "Attending" : "Declined"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #2C2C2C;">
          <h2 style="margin-bottom: 16px;">New RSVP Received</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6B6B6B;">Name</td><td style="padding: 8px 0; font-weight: bold;">${data.guestName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B6B6B;">Email</td><td style="padding: 8px 0;">${data.guestEmail}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B6B6B;">Status</td><td style="padding: 8px 0; font-weight: bold; color: ${data.attending ? "#4CAF50" : "#C86464"};">${data.attending ? "Attending" : "Declined"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B6B6B;">Total Guests</td><td style="padding: 8px 0;">${data.guestCount + 1}</td></tr>
            ${data.message ? `<tr><td style="padding: 8px 0; color: #6B6B6B;">Message</td><td style="padding: 8px 0;">${data.message}</td></tr>` : ""}
          </table>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send coordinator notification:", error);
  }
}
