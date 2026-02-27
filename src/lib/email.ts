import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      html: buildConfirmationEmail(data),
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
      html: buildCoordinatorEmail(data),
    });
  } catch (error) {
    console.error("Failed to send coordinator notification:", error);
  }
}

// --- Email template builders ---

const COLORS = {
  pink: "#D4849A",
  pinkDark: "#C06E84",
  pinkLight: "#FDF0F4",
  pinkBg: "#FFF5F8",
  gold: "#C9A96E",
  goldLight: "#F5EFE0",
  charcoal: "#2C2C2C",
  warmGray: "#6B6B6B",
  lightGray: "#F8F4F5",
  white: "#FFFFFF",
  border: "#F0E0E5",
};

function buildConfirmationEmail(data: RsvpEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.pinkBg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.pinkBg};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Gold accent top line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, transparent, ${COLORS.gold}, transparent);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color: ${COLORS.white}; padding: 48px 40px 32px; text-align: center;">
              <p style="margin: 0 0 8px; font-family: 'Lato', sans-serif; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: ${COLORS.gold};">THE WEDDING OF</p>
              <h1 style="margin: 0 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-weight: 600; color: ${COLORS.charcoal};">Jie & Joy</h1>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px;">
                <tr>
                  <td style="width: 60px; height: 1px; background-color: ${COLORS.gold};"></td>
                  <td style="padding: 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: ${COLORS.gold};">&hearts;</td>
                  <td style="width: 60px; height: 1px; background-color: ${COLORS.gold};"></td>
                </tr>
              </table>
              <p style="margin: 0; font-family: 'Lato', sans-serif; font-size: 14px; color: ${COLORS.warmGray};">September 26, 2026</p>
            </td>
          </tr>

          <!-- Pink divider -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, ${COLORS.pinkLight}, ${COLORS.pink}, ${COLORS.pinkLight});"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: ${COLORS.white}; padding: 40px 40px 16px;">
              <p style="margin: 0 0 24px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: ${COLORS.charcoal};">Dear ${data.guestName},</p>
              ${data.attending ? buildAttendingContent(data) : buildDeclinedContent()}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${COLORS.white}; padding: 16px 40px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="width: 80px; height: 1px; background-color: ${COLORS.gold};"></td>
                  <td style="padding: 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 13px; color: ${COLORS.gold};">&hearts;</td>
                  <td style="width: 80px; height: 1px; background-color: ${COLORS.gold};"></td>
                </tr>
              </table>
              <p style="margin: 20px 0 4px; text-align: center; font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: ${COLORS.charcoal};">With love,</p>
              <p style="margin: 0 0 16px; text-align: center; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: ${COLORS.pink};">Jie & Joy</p>
              <p style="margin: 0; text-align: center; font-family: 'Lato', sans-serif; font-size: 12px; letter-spacing: 2px; color: ${COLORS.gold};">#JieAndJoyForever</p>
            </td>
          </tr>

          <!-- Gold accent bottom line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, transparent, ${COLORS.gold}, transparent);"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAttendingContent(data: RsvpEmailData): string {
  return `
    <p style="margin: 0 0 28px; font-family: 'Lato', sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.charcoal};">
      Thank you for confirming your attendance! We are so excited to celebrate our special day with you.
    </p>

    <!-- Guest count badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px; text-align: center;">
      <tr>
        <td style="background-color: ${COLORS.pinkLight}; border-radius: 50%; width: 72px; height: 72px; text-align: center; vertical-align: middle;">
          <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: ${COLORS.pinkDark};">${data.guestCount + 1}</span>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 8px;">
          <span style="font-family: 'Lato', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: ${COLORS.warmGray};">Total Guests</span>
        </td>
      </tr>
    </table>

    <!-- Event details cards -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background-color: ${COLORS.lightGray}; border-left: 3px solid ${COLORS.pink}; border-radius: 0 8px 8px 0; padding: 20px 24px;">
          <p style="margin: 0 0 2px; font-family: 'Lato', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: ${COLORS.gold};">Ceremony</p>
          <p style="margin: 0 0 4px; font-family: 'Playfair Display', Georgia, serif; font-size: 17px; color: ${COLORS.charcoal};">Our Lady of Pe&ntilde;afrancia Parish</p>
          <p style="margin: 0; font-family: 'Lato', sans-serif; font-size: 14px; color: ${COLORS.warmGray};">9:00 AM</p>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td style="background-color: ${COLORS.lightGray}; border-left: 3px solid ${COLORS.gold}; border-radius: 0 8px 8px 0; padding: 20px 24px;">
          <p style="margin: 0 0 2px; font-family: 'Lato', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: ${COLORS.pink};">Reception</p>
          <p style="margin: 0 0 4px; font-family: 'Playfair Display', Georgia, serif; font-size: 17px; color: ${COLORS.charcoal};">Royale Emelina</p>
          <p style="margin: 0; font-family: 'Lato', sans-serif; font-size: 14px; color: ${COLORS.warmGray};">12:00 NN</p>
        </td>
      </tr>
    </table>
  `;
}

function buildDeclinedContent(): string {
  return `
    <p style="margin: 0 0 28px; font-family: 'Lato', sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.charcoal};">
      We're sorry you won't be able to make it, but we truly appreciate you letting us know. You'll be in our thoughts on our special day!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td style="background-color: ${COLORS.pinkLight}; border-radius: 8px; padding: 24px; text-align: center;">
          <p style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 16px; color: ${COLORS.pinkDark};">
            &ldquo;Though you can&rsquo;t be there in person,<br/>your love and wishes mean the world to us.&rdquo;
          </p>
        </td>
      </tr>
    </table>
  `;
}

function buildCoordinatorEmail(data: RsvpEmailData): string {
  const statusColor = data.attending ? "#2E7D32" : "#C06E84";
  const statusBg = data.attending ? "#E8F5E9" : COLORS.pinkLight;
  const statusText = data.attending ? "Attending" : "Declined";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F5F5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: ${COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="background-color: ${COLORS.charcoal}; padding: 20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; font-family: Georgia, serif; font-size: 16px; color: ${COLORS.white};">Jie & Joy Wedding</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: ${statusBg}; color: ${statusColor}; font-family: sans-serif; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 12px; letter-spacing: 0.5px;">${statusText}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 28px;">
              <h2 style="margin: 0 0 20px; font-family: Georgia, serif; font-size: 20px; color: ${COLORS.charcoal};">New RSVP Received</h2>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0; font-family: sans-serif; font-size: 13px; color: ${COLORS.warmGray}; width: 120px;">Name</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0; font-family: sans-serif; font-size: 14px; font-weight: 700; color: ${COLORS.charcoal};">${data.guestName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0; font-family: sans-serif; font-size: 13px; color: ${COLORS.warmGray};">Email</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0; font-family: sans-serif; font-size: 14px; color: ${COLORS.charcoal};">${data.guestEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0; font-family: sans-serif; font-size: 13px; color: ${COLORS.warmGray};">Total Guests</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0; font-family: sans-serif; font-size: 14px; font-weight: 700; color: ${COLORS.charcoal};">${data.guestCount + 1}</td>
                </tr>
                ${data.message ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0; font-family: sans-serif; font-size: 13px; color: ${COLORS.warmGray}; vertical-align: top;">Message</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0; font-family: sans-serif; font-size: 14px; color: ${COLORS.charcoal}; font-style: italic;">&ldquo;${data.message}&rdquo;</td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #FAFAFA; border-top: 1px solid #F0F0F0;">
              <p style="margin: 0; font-family: sans-serif; font-size: 11px; color: #999;">This is an automated notification from your wedding RSVP system.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
