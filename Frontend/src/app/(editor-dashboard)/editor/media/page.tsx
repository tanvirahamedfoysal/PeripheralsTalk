import { redirect } from "next/navigation";

export default function EditorMediaPage(): never {
  redirect("/editor/articles/new");
}
