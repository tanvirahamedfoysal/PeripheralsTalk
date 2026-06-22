import { redirect } from "next/navigation";

export default function EditorDashboardPage(): never {
  redirect("/editor/articles");
}
