import { Suspense } from "react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login - Dashboard",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
