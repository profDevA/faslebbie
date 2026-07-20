// Global trigger for the Contact drawer (rendered once inside <Nav />). Any
// component can call openContactDrawer() to slide it in, instead of linking to
// a /contact page (there is no contact page — Contact is a drawer).
export const OPEN_CONTACT_EVENT = "open-contact-drawer";

export function openContactDrawer() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_CONTACT_EVENT));
  }
}
