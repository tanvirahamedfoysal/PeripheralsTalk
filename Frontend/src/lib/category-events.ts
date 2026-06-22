export const CATEGORY_UPDATE_EVENT = "peripheralstalk:categories-updated";

export function notifyCategoryUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CATEGORY_UPDATE_EVENT));
  }
}
