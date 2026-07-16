import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function formatDuration(start: string, end: string | null | undefined): string {
  if (!end) return "—"
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 0) return "—"
  const totalMinutes = Math.round(ms / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []
  if (days > 0) parts.push(`${days} d`)
  if (hours > 0) parts.push(`${hours} h`)
  if (days === 0 && minutes > 0) parts.push(`${minutes} min`)
  return parts.length > 0 ? parts.join(" ") : "menos de 1 min"
}
