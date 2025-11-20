import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  // utility function to efficiently merge Tailwind CSS classes in JS without style conflicts.
  return twMerge(clsx(inputs));
}