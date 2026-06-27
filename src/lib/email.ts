import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

function getTransporter() {
  // Uses environment-configured SMTP; falls back to Ethereal-compatible settings
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.ethereal.email",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
    },
  });
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "RSVP App <no-reply@rsvpapp.com>",
    to,
    subject,
    html,
  });
}

export function buildInvitationEmailHtml({
  groupName,
  ownerName,
  eventType,
  eventDate,
  eventTime,
  venue,
  rsvpUrl,
  isRsvp,
}: {
  groupName: string;
  ownerName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  rsvpUrl: string;
  isRsvp: boolean;
}) {
  const subject = isRsvp
    ? `RSVP Invitation – ${ownerName}'s ${eventType}`
    : `Save the Date – ${ownerName}'s ${eventType}`;

  const headline = isRsvp ? "You're Invited" : "Save the Date";
  const cta = isRsvp ? "RSVP Now" : "View Event Details";
  const body = isRsvp
    ? `We warmly invite you to join us for <strong>${ownerName}'s ${eventType}</strong>. Please confirm your attendance at your earliest convenience.`
    : `Mark your calendar! We'd love for you to join us for <strong>${ownerName}'s ${eventType}</strong>.`;

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
  body { margin:0; padding:0; background:#0d1b2a; font-family:'Inter',sans-serif; }
  .wrapper { max-width:600px; margin:40px auto; background:linear-gradient(135deg,#1a2e45 0%,#0d1b2a 100%); border-radius:16px; overflow:hidden; border:1px solid rgba(212,175,55,0.3); }
  .header { padding:48px 40px 32px; text-align:center; border-bottom:1px solid rgba(212,175,55,0.2); }
  .gold-line { width:60px; height:2px; background:linear-gradient(90deg,transparent,#d4af37,transparent); margin:0 auto 24px; }
  h1 { font-family:'Playfair Display',serif; color:#d4af37; font-size:36px; margin:0 0 8px; font-style:italic; }
  .subtitle { color:#f5f0e8; font-size:13px; letter-spacing:3px; text-transform:uppercase; opacity:0.7; }
  .body { padding:40px; }
  .dear { font-family:'Playfair Display',serif; color:#f5f0e8; font-size:20px; margin-bottom:16px; }
  p { color:rgba(245,240,232,0.8); font-size:15px; line-height:1.7; margin:0 0 24px; }
  .event-card { background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.25); border-radius:12px; padding:24px; margin:24px 0; }
  .event-row { display:flex; align-items:center; margin-bottom:12px; color:#f5f0e8; font-size:14px; }
  .event-row:last-child { margin-bottom:0; }
  .event-label { color:#d4af37; font-weight:500; width:80px; flex-shrink:0; }
  .cta-btn { display:block; width:fit-content; margin:32px auto 0; padding:16px 48px; background:linear-gradient(135deg,#d4af37,#b8960c); color:#0d1b2a; font-family:'Inter',sans-serif; font-weight:600; font-size:15px; text-decoration:none; border-radius:50px; letter-spacing:1px; text-transform:uppercase; }
  .footer { padding:24px 40px; text-align:center; border-top:1px solid rgba(212,175,55,0.15); }
  .footer p { color:rgba(245,240,232,0.4); font-size:12px; margin:0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="gold-line"></div>
    <h1>${headline}</h1>
    <p class="subtitle">${ownerName} · ${eventType}</p>
  </div>
  <div class="body">
    <p class="dear">Dear ${groupName},</p>
    <p>${body}</p>
    <div class="event-card">
      <div class="event-row"><span class="event-label">Date</span><span>${eventDate}</span></div>
      <div class="event-row"><span class="event-label">Time</span><span>${eventTime}</span></div>
      <div class="event-row"><span class="event-label">Venue</span><span>${venue}</span></div>
    </div>
    <a href="${rsvpUrl}" class="cta-btn">${cta}</a>
  </div>
  <div class="footer">
    <p>This invitation was sent exclusively to ${groupName}. Please do not share your personal link.</p>
  </div>
</div>
</body>
</html>`,
  };
}
