"use client";

import { createContext, useContext } from "react";

import {
  siteFromSanity,
  type SiteContentData,
} from "@/lib/siteFromSanity";

const SiteContext = createContext<SiteContentData>(siteFromSanity(null));

export function SiteProvider({
  value,
  children,
}: {
  value: SiteContentData;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContentData {
  return useContext(SiteContext);
}
