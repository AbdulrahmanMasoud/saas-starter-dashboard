"use client"

import { useEffect } from "react"

export function FaviconLoader() {
  useEffect(() => {
    // Fetch favicon setting and apply it
    fetch("/api/settings?group=appearance")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const faviconSetting = data.find((s: { key: string }) => s.key === "favicon")
          if (faviconSetting?.value) {
            // Simply update existing favicon or create new one
            let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
            if (link) {
              link.href = faviconSetting.value
            } else {
              link = document.createElement("link")
              link.rel = "icon"
              link.href = faviconSetting.value
              document.head.appendChild(link)
            }
          }
        }
      })
      .catch(() => {
        // Silently fail - will use default favicon
      })
  }, [])

  return null
}
