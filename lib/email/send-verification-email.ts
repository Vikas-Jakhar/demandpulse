/**
 * Transactional email sender for DemandPulse email verification.
 * In development, logs the link directly to the console for frictionless local testing.
 * In production with EMAIL_PROVIDER_API_KEY or RESEND_API_KEY, dispatches via Resend API.
 */
export async function sendVerificationEmail(email: string, verifyUrl: string): Promise<void> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY || process.env.RESEND_API_KEY;

  if (process.env.NODE_ENV !== "production" || !apiKey) {
    console.log(`\n==================================================`);
    console.log(`[DemandPulse Auth] Email verification link for ${email}:`);
    console.log(`${verifyUrl}`);
    console.log(`==================================================\n`);
    if (!apiKey) return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "DemandPulse <noreply@demandpulse.io>",
        to: email,
        subject: "Verify your DemandPulse account",
        html: `
          <div style="font-family: sans-serif; background: #0C0F13; color: #E8EAED; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #12161C; border: 1px solid #232A34; border-radius: 8px; padding: 32px;">
              <h2 style="color: #F5A623; margin-top: 0;">DemandPulse</h2>
              <h3 style="color: #E8EAED;">Verify your email address</h3>
              <p style="color: #8A93A1; line-height: 1.5; font-size: 14px;">
                Welcome to DemandPulse. Please confirm your email address to access your supply-chain forecasting workspace.
              </p>
              <div style="margin: 28px 0;">
                <a href="${verifyUrl}" style="background: #F5A623; color: #0C0F13; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #5B6472; font-size: 12px; line-height: 1.4;">
                This link will expire in 24 hours. If you did not create a DemandPulse account, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to send verification email via Resend:", errorText);
    }
  } catch (err) {
    console.error("Error dispatching verification email:", err);
  }
}
