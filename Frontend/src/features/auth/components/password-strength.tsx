export function PasswordStrength({ password }: { password: string }) {
  return (
    <small>
      {password.length >= 8 ? "Password length accepted" : "Use at least 8 characters"}
    </small>
  );
}
