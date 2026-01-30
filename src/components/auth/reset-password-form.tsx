"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Check, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth"
import { resetPassword } from "@/lib/actions/auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
]

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: token || "",
    },
  })

  const password = form.watch("password")
  const passwordStrength = passwordRequirements.filter((req) =>
    req.regex.test(password)
  ).length

  async function onSubmit(values: ResetPasswordInput) {
    setIsLoading(true)

    try {
      const result = await resetPassword(values)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      setIsSubmitted(true)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Invalid or missing reset token. Please request a new password reset link.
        </p>
        <Button asChild>
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold">Password reset successful</h3>
        <p className="text-sm text-muted-foreground">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Create a new password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              {password && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(passwordStrength / passwordRequirements.length) * 100}
                      className="h-1.5"
                    />
                    <span className="text-xs text-muted-foreground">
                      {passwordStrength === 0 && "Weak"}
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Fair"}
                      {passwordStrength === 3 && "Good"}
                      {passwordStrength === 4 && "Strong"}
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 gap-1">
                    {passwordRequirements.map((req) => {
                      const met = req.regex.test(password)
                      return (
                        <li
                          key={req.label}
                          className={cn(
                            "flex items-center gap-1 text-xs",
                            met ? "text-green-600" : "text-muted-foreground"
                          )}
                        >
                          {met ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {req.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset password
        </Button>
      </form>
    </Form>
  )
}
