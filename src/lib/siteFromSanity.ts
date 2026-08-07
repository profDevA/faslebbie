import {
  mobileNavItems as fallbackMobileNav,
  navItems as fallbackNav,
} from "@/lib/content";
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
  /** Shared Home / listing / Contact portrait (Sanity or local fallback). */
  portraitSrc: string;
}

export interface SiteContentData {
  brand: SiteBrand;
  navItems: NavItem[];
  mobileNavItems: NavItem[];
  contact: ContactCopy;
}

const FALLBACK_PORTRAIT = "/portrait-master.png";

const defaultBrand: SiteBrand = {
  logoName: "Fas lebbie",
  logoSuffix: "Ph.D.",
  portraitSrc: FALLBACK_PORTRAIT,
};

const defaultContact: ContactCopy = {
  drawerTitle: "Contact",
  heading: "Drop Me a Line",
  portraitSrc: FALLBACK_PORTRAIT,
  submitLabel: "Send Message",
  successTitle: "Thanks — your message is on its way.",
  successBody: "Fas will get back to you at the email you provided.",
  sendAnotherLabel: "Send another",
};

function mapLinks(
  items: { label?: string; href?: string }[] | undefined,
  fallback: NavItem[],
): NavItem[] {
  if (!items?.length) return fallback;
  const mapped = items
    .filter((i) => i.label && i.href)
    .map((i) => ({ label: i.label!, href: i.href! }));
  return mapped.length ? mapped : fallback;
}

/** QA: Home must appear in primary nav even if Sanity list is stale. */
function ensureHome(items: NavItem[]): NavItem[] {
  if (items.some((i) => i.href === "/")) return items;
  return [{ label: "Home", href: "/" }, ...items];
}

export function siteFromSanity(
  data: SanitySiteSettings | null | undefined,
): SiteContentData {
  if (!data) {
    return {
      brand: defaultBrand,
      navItems: ensureHome(fallbackNav),
      mobileNavItems: ensureHome(fallbackMobileNav),
      contact: defaultContact,
    };
  }

  // Brand master is the default; Contact override only if explicitly set.
  const master = data.masterPortrait?.trim() || FALLBACK_PORTRAIT;
  const contactPortrait = data.contactPortrait?.trim() || master;

  return {
    brand: {
      logoName: data.logoName?.trim() || defaultBrand.logoName,
      logoSuffix: data.logoSuffix?.trim() || defaultBrand.logoSuffix,
      portraitSrc: master,
    },
    navItems: ensureHome(mapLinks(data.navItems, fallbackNav)),
    mobileNavItems: ensureHome(mapLinks(data.mobileNavItems, fallbackMobileNav)),
    contact: {
      drawerTitle: data.contactDrawerTitle?.trim() || defaultContact.drawerTitle,
      heading: data.contactHeading?.trim() || defaultContact.heading,
      portraitSrc: contactPortrait,
      submitLabel: data.contactSubmitLabel?.trim() || defaultContact.submitLabel,
      successTitle:
        data.contactSuccessTitle?.trim() || defaultContact.successTitle,
      successBody: data.contactSuccessBody?.trim() || defaultContact.successBody,
      sendAnotherLabel:
        data.contactSendAnotherLabel?.trim() || defaultContact.sendAnotherLabel,
    },
  };
}
