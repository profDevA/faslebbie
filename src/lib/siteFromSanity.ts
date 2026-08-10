import type { SanitySiteSettings } from "@/sanity/types";

export interface NavItem {
  label: string;
  href: string;
}

export interface ContactCopy {
  drawerTitle: string;
  heading: string;
  portraitSrc: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  sendAnotherLabel: string;
}

export interface SiteBrand {
  logoName: string;
  logoSuffix: string;
  /** Shared Home / listing / Contact portrait from Sanity (or empty). */
  portraitSrc: string;
}

export interface SiteContentData {
  brand: SiteBrand;
  navItems: NavItem[];
  mobileNavItems: NavItem[];
  contact: ContactCopy;
}

function mapLinks(
  items: { label?: string; href?: string }[] | undefined,
): NavItem[] {
  if (!items?.length) return [];
  return items
    .filter((i) => i.label && i.href)
    .map((i) => ({ label: i.label!, href: i.href! }));
}

/** QA: Home must appear in primary nav even if Sanity list omits it. */
function ensureHome(items: NavItem[]): NavItem[] {
  if (items.some((i) => i.href === "/")) return items;
  return [{ label: "Home", href: "/" }, ...items];
}

const emptyContact: ContactCopy = {
  drawerTitle: "",
  heading: "",
  portraitSrc: "",
  submitLabel: "",
  successTitle: "",
  successBody: "",
  sendAnotherLabel: "",
};

/** Site Settings from Sanity only — no in-code nav/content seed. */
export function siteFromSanity(
  data: SanitySiteSettings | null | undefined,
): SiteContentData {
  if (!data) {
    return {
      brand: { logoName: "", logoSuffix: "", portraitSrc: "" },
      navItems: ensureHome([]),
      mobileNavItems: ensureHome([]),
      contact: emptyContact,
    };
  }

  const master = data.masterPortrait?.trim() || "";
  const contactPortrait = data.contactPortrait?.trim() || master;

  return {
    brand: {
      logoName: data.logoName?.trim() || "",
      logoSuffix: data.logoSuffix?.trim() || "",
      portraitSrc: master,
    },
    navItems: ensureHome(mapLinks(data.navItems)),
    mobileNavItems: ensureHome(mapLinks(data.mobileNavItems)),
    contact: {
      drawerTitle: data.contactDrawerTitle?.trim() || "",
      heading: data.contactHeading?.trim() || "",
      portraitSrc: contactPortrait,
      submitLabel: data.contactSubmitLabel?.trim() || "",
      successTitle: data.contactSuccessTitle?.trim() || "",
      successBody: data.contactSuccessBody?.trim() || "",
      sendAnotherLabel: data.contactSendAnotherLabel?.trim() || "",
    },
  };
}
