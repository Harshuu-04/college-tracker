import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string[], subject: string, html: string) {
  if (to.length === 0) return;

  try {
    await resend.emails.send({
      from: "Placement Cell <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}
