import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata = {
  title: "Reset Password - Dashboard",
  description: "Set a new password",
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
