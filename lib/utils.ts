import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Class merger used by the components sourced from the 21st.dev registry. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
