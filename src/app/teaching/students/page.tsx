import { permanentRedirect } from "next/navigation";
import { STUDENT_PROJECTS_PATH } from "@/lib/teachingPaths";

/** Old address → /teaching/student-projects (Nov 20). */
export default function StudentsHubPage() {
  permanentRedirect(STUDENT_PROJECTS_PATH);
}
