import { z } from "zod"

export const createSubscriptionSchema = z.object({
  userId: z.string().min(1, "User is required"),
  planId: z.string().min(1, "Plan is required"),
  billingPeriod: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  startTrial: z.boolean().default(false),
})

export const updateSubscriptionSchema = z.object({
  planId: z.string().optional(),
  status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"]).optional(),
  billingPeriod: z.enum(["MONTHLY", "YEARLY"]).optional(),
  cancelReason: z.string().optional(),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>
