export function useLogout() {
  return {
    logout: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    loading: false,
  };
}
