/**
 * Sends the password reset email. This is the one part of the reset flow
 * that's a real stub, not just unfinished code — actually delivering an
 * email requires picking a transactional-email provider (Resend, SendGrid,
 * Postmark, SES, etc.) and provisioning API credentials, which isn't a
 * decision this codebase should make for you.
 *
 * Everything else about the reset flow is real: token generation
 * (reset-token.ts), verification, and the password update itself
 * (app/api/auth/reset-password/route.ts) all work end-to-end today. Only
 * this function needs a real implementation before reset emails actually
 * reach anyone.
 *
 * In development, this logs the reset link to the server console so the
 * flow is testable without any email provider configured at all.
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] Password reset link for ${email}:\n${resetUrl}\n`);
    return;
  }

  if (!process.env.EMAIL_PROVIDER_API_KEY) {
    // Fails loudly in the server log rather than silently pretending the
    // email went out — a user who never receives a reset link with no
    // trace of why is a much worse failure mode than a visible warning.
    console.error(
      "sendPasswordResetEmail: EMAIL_PROVIDER_API_KEY is not configured. " +
        "No email was sent. Wire a real provider here before relying on password reset in production."
    );
    return;
  }

  // Example wiring for Resend (https://resend.com) — uncomment and adjust
  // once EMAIL_PROVIDER_API_KEY is set to a real Resend API key:
  //
  //   const res = await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       from: "DemandPulse <noreply@yourdomain.com>",
  //       to: email,
  //       subject: "Reset your DemandPulse password",
  //       html: `<p>Click the link below to reset your password. This link expires in 30 minutes.</p>
  //              <p><a href="${resetUrl}">${resetUrl}</a></p>`,
  //     }),
  //   });
  //   if (!res.ok) throw new Error(`Resend API error: ${res.status}`);
}
