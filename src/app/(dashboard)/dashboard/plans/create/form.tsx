"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { createPlanSchema, type CreatePlanInput } from "@/lib/validations/plan"
import { toast } from "sonner"

const FEATURE_FLAGS = [
  { value: "api", label: "API Access" },
  { value: "sso", label: "Single Sign-On" },
  { value: "priority_support", label: "Priority Support" },
  { value: "dedicated_support", label: "Dedicated Support" },
  { value: "custom_integrations", label: "Custom Integrations" },
  { value: "analytics", label: "Advanced Analytics" },
  { value: "export", label: "Data Export" },
  { value: "white_label", label: "White Label" },
]

export function CreatePlanForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(createPlanSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: {
        maxUsers: null,
        maxStorage: null,
        maxApiCalls: null,
        featureFlags: [],
      },
      trialDays: 0,
      status: "ACTIVE",
      sortOrder: 0,
      isPopular: false,
    },
  })

  const selectedFlags = (form.watch("features.featureFlags") as string[]) || []

  function toggleFeatureFlag(flag: string) {
    const current = (form.getValues("features.featureFlags") as string[]) || []
    if (current.includes(flag)) {
      ;(form.setValue as any)(
        "features.featureFlags",
        current.filter((f: string) => f !== flag)
      )
    } else {
      ;(form.setValue as any)("features.featureFlags", [...current, flag])
    }
  }

  async function onSubmit(values: CreatePlanInput) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create plan")
      }

      toast.success("Plan created successfully")
      router.push("/dashboard/plans")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Basic Info */}
        <FormField
          control={form.control as any}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Professional" disabled={isLoading} {...field} />
              </FormControl>
              <FormDescription>The display name for this plan</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Perfect for growing businesses"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>A brief description of the plan</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pricing */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control as any}
            name="monthlyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="29.99"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="yearlyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yearly Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="299.99"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Feature Limits */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Feature Limits</h3>
          <p className="text-sm text-muted-foreground">
            Leave empty for unlimited. Set to 0 to disable.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control as any}
              name="features.maxUsers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Users</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Unlimited"
                      disabled={isLoading}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="features.maxStorage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Storage (GB)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Unlimited"
                      disabled={isLoading}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="features.maxApiCalls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max API Calls</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Unlimited"
                      disabled={isLoading}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Feature Flags */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Feature Flags</h3>
          <p className="text-sm text-muted-foreground">
            Select which features are included in this plan
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATURE_FLAGS.map((flag) => {
              const isSelected = selectedFlags.includes(flag.value)
              return (
                <Badge
                  key={flag.value}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFeatureFlag(flag.value)}
                >
                  {isSelected ? (
                    <X className="mr-1 h-3 w-3" />
                  ) : (
                    <Plus className="mr-1 h-3 w-3" />
                  )}
                  {flag.label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control as any}
            name="trialDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trial Days</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="365"
                    placeholder="14"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Days of free trial (0 for none)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Lower numbers appear first</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control as any}
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="isPopular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Popular</FormLabel>
                  <FormDescription>
                    Mark this plan as popular
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
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Plan
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
