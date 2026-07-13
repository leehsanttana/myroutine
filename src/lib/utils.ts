import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Tom pastel claro de uma cor de domínio, para preencher cards. */
export function corPastel(cor: string, pct = 14) {
  return `color-mix(in srgb, ${cor} ${pct}%, #fff)`
}
