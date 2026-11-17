import { redirect } from "next/navigation";

// /blogs/media (no talk) → the .media tab. Without this the /blogs/[slug] route
// would treat "media" as a blog post and 404.
export default function MediaIndexPage() {
  redirect("/blogs?view=media");
}
