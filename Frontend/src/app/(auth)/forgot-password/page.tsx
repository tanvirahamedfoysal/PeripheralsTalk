import { PasswordRecoveryPage } from "@/components/password-recovery-page";

export default function ForgotPasswordPage() {
  return (
    <PasswordRecoveryPage
      title="Recover your account."
      description="Request a six-digit OTP from the immutable FastAPI backend and choose a new password."
    />
  );
}
