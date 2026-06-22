import { redirect } from "next/navigation";

export default function AdminDashboardPage(): never {
  redirect("/admin/users");
}
