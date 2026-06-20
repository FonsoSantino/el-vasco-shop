import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  const amount = Number(value) || 0
  const hasDecimals = Math.round((amount % 1) * 100) !== 0
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }
  const formatted = amount.toLocaleString("de-DE", options)
  return `$${formatted}`
}

export function parsePrice(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0
  const raw = String(value).trim().replace(/\s+/g, "")
  if (raw === "") return 0

  const hasDot = raw.includes(".")
  const hasComma = raw.includes(",")
  let normalized = raw

  if (hasDot && hasComma) {
    // 1.250,50 or 1,250.50
    if (raw.lastIndexOf(",") > raw.lastIndexOf(".")) {
      normalized = raw.replace(/\./g, "").replace(/,/g, ".")
    } else {
      normalized = raw.replace(/,/g, "")
    }
  } else if (hasComma) {
    const parts = raw.split(",")
    if (parts[1]?.length === 3) {
      normalized = raw.replace(/,/g, "")
    } else {
      normalized = raw.replace(/,/g, ".")
    }
  } else if (hasDot) {
    const parts = raw.split(".")
    if (parts[1]?.length === 3 && parts[0].length > 1) {
      normalized = raw.replace(/\./g, "")
    } else {
      normalized = raw
    }
  }

  const parsed = parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}
