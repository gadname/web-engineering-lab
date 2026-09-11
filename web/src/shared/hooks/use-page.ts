"use client";

import { useContext } from "react";
import { PageContext } from "@/shared/providers/page-provider";

export function usePage() {
	const page = useContext(PageContext);
	return { page };
}
