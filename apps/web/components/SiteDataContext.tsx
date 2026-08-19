"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteData } from "@company/contracts";

const SiteDataContext = createContext<SiteData | null>(null);

export function SiteDataProvider({ initialData, children }: { initialData: SiteData | null; children: ReactNode }) {
  return <SiteDataContext.Provider value={initialData}>{children}</SiteDataContext.Provider>;
}

export function useInitialSiteData() {
  return useContext(SiteDataContext);
}
