"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = sessionStorage.getItem("analytics_session_id")
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem("analytics_session_id", sessionId)
  }
  return sessionId
}

export function PageTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    // Skip if we already tracked this path
    if (lastTrackedPath.current === pathname) return
    lastTrackedPath.current = pathname

    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
            sessionId: getSessionId(),
          }),
        })
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.error("Failed to track page view:", error)
      }
    }

    trackPageView()
  }, [pathname])

  return null
}
