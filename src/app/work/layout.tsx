// Work layout — adds a parallel `@modal` slot alongside the normal page tree so
// case studies can be intercepted as an overlay (app/work/@modal/(.)[slug])
// while still resolving to a real, shareable page (app/work/[slug]) on hard
// load. See node_modules/next/dist/docs/.../parallel-routes.md.
export default function WorkLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
