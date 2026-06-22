import { redirect } from "next/navigation";

export default function UserDashboardPage(): never {
  redirect("/dashboard/profile");
}
