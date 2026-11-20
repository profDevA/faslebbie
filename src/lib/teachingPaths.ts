/**
 * Teaching addresses — clean paths, no query string (Fas doesn't like
 * ?params; Xian, Nov 20):
 *   /teaching                              philosophy
 *   /teaching/student-projects             the student projects grid
 *   /teaching/student-projects/<student>   that student's popup
 * Old /teaching?view=works&student=… and /teaching/students/… links redirect
 * here (app/teaching/page.tsx, app/teaching/students/*).
 */
export const STUDENT_PROJECTS_PATH = "/teaching/student-projects";

export function studentProjectPath(id: string): string {
  return `${STUDENT_PROJECTS_PATH}/${encodeURIComponent(id)}`;
}
