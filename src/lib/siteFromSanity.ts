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

export interface SiteContentData {
  navItems: NavItem[];
  mobileNavItems: NavItem[];
  contact: ContactCopy;
}

const defaultContact: ContactCopy = {
  drawerTitle: "Contact",
  heading: "Drop Me a Line",
  portraitSrc: "/contact-portrait.png",
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

export function siteFromSanity(
  data: SanitySiteSettings | null | undefined,
): SiteContentData {
  if (!data) {
    return {
      navItems: fallbackNav,
      mobileNavItems: fallbackMobileNav,
      contact: defaultContact,
    };
  }

  return {
    navItems: mapLinks(data.navItems, fallbackNav),
    mobileNavItems: mapLinks(data.mobileNavItems, fallbackMobileNav),
    contact: {
      drawerTitle: data.contactDrawerTitle?.trim() || defaultContact.drawerTitle,
      heading: data.contactHeading?.trim() || defaultContact.heading,
      portraitSrc: data.contactPortrait || defaultContact.portraitSrc,
      submitLabel: data.contactSubmitLabel?.trim() || defaultContact.submitLabel,
      successTitle:
        data.contactSuccessTitle?.trim() || defaultContact.successTitle,
      successBody: data.contactSuccessBody?.trim() || defaultContact.successBody,
      sendAnotherLabel:
        data.contactSendAnotherLabel?.trim() || defaultContact.sendAnotherLabel,
    },
  };
}
