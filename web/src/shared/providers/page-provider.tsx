"use client";

import type React from "react";
import { createContext } from "react";
import { type Page, useProvidePage } from "@/shared/hooks/use-provider-page";

export const PageContext = createContext({} as Page);

export function PageProvider({ children }: { children: React.ReactNode }) {
	const page = useProvidePage();
	return <PageContext.Provider value={page}>{children}</PageContext.Provider>;
}
