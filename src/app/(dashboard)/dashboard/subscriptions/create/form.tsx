"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSubscriptionSchema, type CreateSubscriptionInput } from "@/lib/validations/subscription"
import { toast } from "sonner"

interface CreateSubscriptionFormProps {
  users: Array<{ id: string; name: string | null; email: string }>
  plans: Array<{
    id: string
    name: string
    monthlyPrice: number
    yearlyPrice: number
    trialDays: number
  }>
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export function CreateSubscriptionForm({ users, plans }: CreateSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<CreateSubscriptionInput>({
    resolver: zodResolver(createSubscriptionSchema) as any,
    defaultValues: {
      userId: "",
      planId: "",
      billingPeriod: "MONTHLY",
      startTrial: false,
    },
  })

  const selectedPlanId = form.watch("planId")
  const billingPeriod = form.watch("billingPeriod")
  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  async function onSubmit(values: CreateSubscriptionInput) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create subscription")
      }

      toast.success("Subscription created successfully")
      router.push("/dashboard/subscriptions")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.length === 0 ? (
                    <SelectItem value="_" disabled>
                      No users without subscriptions
                    </SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || "Unnamed"} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Only users without an existing subscription are shown
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatPrice(plan.monthlyPrice)}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billingPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Period</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {selectedPlan && (
                <FormDescription>
                  Price:{" "}
                  {billingPeriod === "YEARLY"
                    ? `${formatPrice(selectedPlan.yearlyPrice)}/year`
                    : `${formatPrice(selectedPlan.monthlyPrice)}/month`}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedPlan && selectedPlan.trialDays > 0 && (
          <FormField
            control={form.control}
            name="startTrial"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Start with Trial</FormLabel>
                  <FormDescription>
                    This plan offers a {selectedPlan.trialDays}-day free trial
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || users.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Subscription
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
