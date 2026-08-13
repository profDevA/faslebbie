import type { SanitySiteSettings } from "@/sanity/types";
import { projectNavItems as defaultProjectNavItems } from "@/lib/content";

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
  /** Home + Contact portrait (161×145 crop). */
  homePortraitSrc: string;
  /** Listing pages portrait (tighter head/shoulders crop). */
  portraitSrc: string;
}

export interface SiteContentData {
  brand: SiteBrand;
  navItems: NavItem[];
  mobileNavItems: NavItem[];
  projectNavItems: NavItem[];
  contact: ContactCopy;
}

const defaultProjectNav: NavItem[] = defaultProjectNavItems.map((i) => ({
  label: i.label,
  href: i.href,
}));

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
  portraitSrc: "/home-portrait.png",
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
      brand: {
        logoName: "",
        logoSuffix: "",
        homePortraitSrc: "/home-portrait.png",
        portraitSrc: "/portrait-master.png",
      },
      navItems: ensureHome([]),
      mobileNavItems: ensureHome([]),
      projectNavItems: defaultProjectNav,
      contact: emptyContact,
    };
  }

  const home =
    data.homePortrait?.trim() || "/home-portrait.png";
  const master =
    data.masterPortrait?.trim() || "/portrait-master.png";
  const contactPortrait = data.contactPortrait?.trim() || home;

  return {
    brand: {
      logoName: data.logoName?.trim() || "",
      logoSuffix: data.logoSuffix?.trim() || "",
      homePortraitSrc: home,
      portraitSrc: master,
    },
    navItems: ensureHome(mapLinks(data.navItems)),
    mobileNavItems: ensureHome(mapLinks(data.mobileNavItems)),
    projectNavItems: mapLinks(data.projectNavItems).length
      ? mapLinks(data.projectNavItems)
      : defaultProjectNav,
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
