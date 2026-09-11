"use client";

import { useContext } from "react";
import { ToastContext } from "@/shared/providers/toast-provider";

export function useToast() {
	return useContext(ToastContext);
}
