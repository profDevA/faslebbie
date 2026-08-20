import { redirect } from "next/navigation";

export default function StudentsHubPage() {
  redirect("/teaching?view=works");
}
