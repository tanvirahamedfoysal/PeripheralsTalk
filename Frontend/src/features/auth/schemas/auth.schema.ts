export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
export function isValidPassword(value: string): boolean {
  return value.length >= 8;
}
