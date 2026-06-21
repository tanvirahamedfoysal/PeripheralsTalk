import { PasswordRecoveryPage } from "@/components/password-recovery-page";

export default function ResetPasswordPage() {
  return (
    <PasswordRecoveryPage
      title="Reset your password."
      description="Use the OTP sent to your email. The backend accepts the OTP for two minutes."
    />
  );
}
