import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase()
  switch (extension) {
    case "ts":
    case "tsx":
      return "📜"
    case "js":
    case "jsx":
      return "📄"
    case "json":
      return "📋"
    case "md":
      return "📝"
    case "css":
      return "🎨"
    default:
      return "📄"
  }
}
