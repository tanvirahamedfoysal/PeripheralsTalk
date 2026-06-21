import { PasswordRecoveryPage } from "@/components/password-recovery-page";

export default function ChangePasswordPage() {
  return (
    <PasswordRecoveryPage
      title="Change your password."
      description="The backend has no separate authenticated change-password route, so this page safely uses the supported email OTP reset flow."
    />
  );
}
