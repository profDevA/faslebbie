import { permanentRedirect } from "next/navigation";
import { studentProjectPath } from "@/lib/teachingPaths";

/** Old address → /teaching/student-projects/<student> (Nov 20). */
export default async function OldStudentProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(studentProjectPath(slug));
}
