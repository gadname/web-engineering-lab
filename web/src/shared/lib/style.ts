import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** 条件付きクラス名の結合と、Tailwind の競合クラスの解決 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
