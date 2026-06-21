import { PasswordRecoveryPage } from "@/components/password-recovery-page";

export default function ResetPasswordPage() {
  return (
    <PasswordRecoveryPage
      title="Reset your password."
      description="Enter the six-digit code sent to your email before it expires, then choose your new password."
    />
  );
}
