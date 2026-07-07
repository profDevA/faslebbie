// Work layout. Case studies now open as a client-side popup rendered inside
// WorkBody (no intercepting/parallel routes — that was flaky under Turbopack and
// fell back to the full-width page). `app/work/[slug]` remains as a shareable
// deep-link page for direct visits.
export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
