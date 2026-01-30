"use server"

import { signIn } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth"
import { redirect } from "next/navigation"
import crypto from "crypto"

export async function login(values: unknown) {
  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { email, password } = validatedFields.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }

  return { success: true }
}

export async function register(values: unknown) {
  const validatedFields = registerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { name, email, password } = validatedFields.data

  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already in use" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Get default role
  const defaultRole = await db.role.findFirst({
    where: { isDefault: true },
  })

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: defaultRole?.id,
    },
  })

  return { success: true }
}

export async function forgotPassword(values: unknown) {
  const validatedFields = forgotPasswordSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid email" }
  }

  const { email } = validatedFields.data

  const user = await db.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Return success even if user doesn't exist to prevent email enumeration
    return { success: true }
  }

  // Delete existing tokens for this email
  await db.passwordResetToken.deleteMany({
    where: { email },
  })

  // Generate new token
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 3600000) // 1 hour

  await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  })

  // TODO: Send email with reset link
  // For now, just log the token in development
  if (process.env.NODE_ENV === "development") {
    console.log(`Password reset token for ${email}: ${token}`)
  }

  return { success: true }
}

export async function resetPassword(values: unknown) {
  const validatedFields = resetPasswordSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { password, token } = validatedFields.data

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token },
  })

  if (!resetToken) {
    return { error: "Invalid token" }
  }

  if (resetToken.expires < new Date()) {
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    })
    return { error: "Token has expired" }
  }

  const user = await db.user.findUnique({
    where: { email: resetToken.email },
  })

  if (!user) {
    return { error: "User not found" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  await db.passwordResetToken.delete({
    where: { id: resetToken.id },
  })

  return { success: true }
}
