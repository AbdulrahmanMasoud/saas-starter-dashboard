"use client"

import { useEffect } from "react"

function updateFavicon(url: string) {
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll("link[rel*='icon']")
  existingLinks.forEach((link) => link.remove())

  // Create new favicon link
  const link = document.createElement("link")
  link.rel = "icon"
  link.href = url
  document.head.appendChild(link)

  // Also add shortcut icon for older browsers
  const shortcut = document.createElement("link")
  shortcut.rel = "shortcut icon"
  shortcut.href = url
  document.head.appendChild(shortcut)
}

export function FaviconLoader() {
  useEffect(() => {
    // Fetch favicon setting and apply it
    fetch("/api/settings?group=appearance")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const faviconSetting = data.find((s: { key: string }) => s.key === "favicon")
          if (faviconSetting?.value) {
            updateFavicon(faviconSetting.value)
          }
        }
      })
      .catch(() => {
        // Silently fail - will use default favicon
      })
  }, [])

  return null
}

// Alias for backwards compatibility
export const FaviconProvider = FaviconLoader
