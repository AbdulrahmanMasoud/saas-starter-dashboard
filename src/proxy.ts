import { auth } from "@/auth"
import { NextResponse } from "next/server"

const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

export const proxy = auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Protect dashboard routes
  if (isDashboardRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
