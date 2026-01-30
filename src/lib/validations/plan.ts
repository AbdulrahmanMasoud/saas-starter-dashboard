import { z } from "zod"

export const planFeaturesSchema = z.object({
  maxUsers: z.number().nullable().optional(),
  maxStorage: z.number().nullable().optional(), // in GB
  maxApiCalls: z.number().nullable().optional(),
  featureFlags: z.array(z.string()).optional(),
})

export const createPlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0, "Price must be 0 or greater"),
  yearlyPrice: z.number().min(0, "Price must be 0 or greater"),
  features: planFeaturesSchema,
  trialDays: z.number().min(0).max(365).default(0),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  sortOrder: z.number().default(0),
  isPopular: z.boolean().default(false),
})

export const updatePlanSchema = createPlanSchema.partial()

export type PlanFeatures = z.infer<typeof planFeaturesSchema>
export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
