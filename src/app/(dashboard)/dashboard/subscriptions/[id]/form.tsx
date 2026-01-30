"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateSubscriptionSchema, type UpdateSubscriptionInput } from "@/lib/validations/subscription"
import { toast } from "sonner"

interface EditSubscriptionFormProps {
  subscription: {
    id: string
    planId: string
    status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED"
    billingPeriod: "MONTHLY" | "YEARLY"
    cancelReason: string | null
  }
  plans: Array<{
    id: string
    name: string
    monthlyPrice: number
    yearlyPrice: number
  }>
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export function EditSubscriptionForm({ subscription, plans }: EditSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const router = useRouter()

  const form = useForm<UpdateSubscriptionInput>({
    resolver: zodResolver(updateSubscriptionSchema),
    defaultValues: {
      planId: subscription.planId,
      status: subscription.status,
      billingPeriod: subscription.billingPeriod,
    },
  })

  const selectedPlanId = form.watch("planId")
  const billingPeriod = form.watch("billingPeriod")
  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  async function onSubmit(values: UpdateSubscriptionInput) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update subscription")
      }

      toast.success("Subscription updated successfully")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function onCancel() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELED",
          cancelReason: cancelReason || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel subscription")
      }

      toast.success("Subscription canceled")
      setShowCancelDialog(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function onDelete() {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete subscription")
      }

      toast.success("Subscription deleted")
      router.push("/dashboard/subscriptions")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  const isCanceled = subscription.status === "CANCELED"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading || isCanceled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
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
                disabled={isLoading || isCanceled}
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
                  {billingPeriod === "YEARLY"
                    ? `${formatPrice(selectedPlan.yearlyPrice)}/year`
                    : `${formatPrice(selectedPlan.monthlyPrice)}/month`}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="TRIALING">Trialing</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAST_DUE">Past Due</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading || isDeleting}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>

        {!isCanceled && (
          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading || isDeleting}
              >
                Cancel Subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  The subscription will be marked as canceled. The user will retain access until the end of their current billing period.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <FormLabel>Cancellation Reason (optional)</FormLabel>
                <Textarea
                  placeholder="Why is this subscription being canceled?"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-2"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cancel Subscription
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={isLoading || isDeleting}
            >
              Delete Subscription
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the subscription record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  )
}
