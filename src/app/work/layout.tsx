// Work layout. Listing clicks go to `/work/[slug]` (full page). Popup overlay
// code remains in WorkBody until Fas signs off removal. This layout wraps both
// the listing and shareable deep-link case-study pages.
export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
