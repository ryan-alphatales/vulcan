import { Resend } from "resend";

import type { VerificationEmailSender } from "@/server/accounts/service";
import { getServerEnvironment } from "@/server/config";

export class ResendVerificationEmailSender implements VerificationEmailSender {
  async sendVerification({ email, token }: { email: string; token: string }): Promise<void> {
    const environment = getServerEnvironment();
    const appUrl = environment.APP_URL ?? environment.NEXTAUTH_URL;
    const verificationUrl = new URL(`/verify?token=${encodeURIComponent(token)}`, appUrl);
    const resend = new Resend(environment.RESEND_API_KEY);
    const response = await resend.emails.send({
      from: "Vulcan <onboarding@parichay4.online>",
      to: email,
      subject: "Verify your Vulcan account",
      text: `Verify your email to activate Vulcan: ${verificationUrl.toString()}`,
    });
    if (response.error) throw new Error("Verification email could not be sent.");
  }
}
