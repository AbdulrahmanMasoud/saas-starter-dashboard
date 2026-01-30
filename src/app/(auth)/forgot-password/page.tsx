import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot Password - Dashboard",
  description: "Reset your password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
