import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { DEFAULT_ROLE_PERMISSIONS } from "../src/config/permissions"
import { defaultEmailTemplates } from "../src/lib/email/templates"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create roles
  console.log("Creating roles...")
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: {
        name: "Admin",
        description: "Full access to all features",
        permissions: DEFAULT_ROLE_PERMISSIONS.Admin,
        isDefault: false,
      },
    }),
    prisma.role.upsert({
      where: { name: "Editor" },
      update: {},
      create: {
        name: "Editor",
        description: "Can manage content and media",
        permissions: DEFAULT_ROLE_PERMISSIONS.Editor,
        isDefault: false,
      },
    }),
    prisma.role.upsert({
      where: { name: "Author" },
      update: {},
      create: {
        name: "Author",
        description: "Can create and manage own content",
        permissions: DEFAULT_ROLE_PERMISSIONS.Author,
        isDefault: false,
      },
    }),
    prisma.role.upsert({
      where: { name: "User" },
      update: {},
      create: {
        name: "User",
        description: "Basic user access",
        permissions: DEFAULT_ROLE_PERMISSIONS.User,
        isDefault: true,
      },
    }),
  ])

  const adminRole = roles.find((r) => r.name === "Admin")!
  const editorRole = roles.find((r) => r.name === "Editor")!
  const authorRole = roles.find((r) => r.name === "Author")!
  const userRole = roles.find((r) => r.name === "User")!

  // Create admin user
  console.log("Creating admin user...")
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      roleId: adminRole.id,
    },
  })

  // Create demo users
  console.log("Creating demo users...")
  const demoPassword = await bcrypt.hash("demo123", 10)
  const demoUsers = []

  for (let i = 1; i <= 50; i++) {
    const roleIndex = i % 4
    const role = [adminRole, editorRole, authorRole, userRole][roleIndex]

    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        name: `Demo User ${i}`,
        email: `user${i}@example.com`,
        password: demoPassword,
        roleId: role.id,
      },
    })
    demoUsers.push(user)
  }

  // Create categories
  console.log("Creating categories...")
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "technology" },
      update: {},
      create: {
        name: "Technology",
        slug: "technology",
        description: "Tech news, reviews, and tutorials",
      },
    }),
    prisma.category.upsert({
      where: { slug: "design" },
      update: {},
      create: {
        name: "Design",
        slug: "design",
        description: "UI/UX design, graphics, and creativity",
      },
    }),
    prisma.category.upsert({
      where: { slug: "business" },
      update: {},
      create: {
        name: "Business",
        slug: "business",
        description: "Business news and strategies",
      },
    }),
    prisma.category.upsert({
      where: { slug: "lifestyle" },
      update: {},
      create: {
        name: "Lifestyle",
        slug: "lifestyle",
        description: "Life tips and personal development",
      },
    }),
  ])

  // Create tags
  console.log("Creating tags...")
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "javascript" },
      update: {},
      create: { name: "JavaScript", slug: "javascript", color: "#f7df1e" },
    }),
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {},
      create: { name: "React", slug: "react", color: "#61dafb" },
    }),
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: { name: "Next.js", slug: "nextjs", color: "#000000" },
    }),
    prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript", color: "#3178c6" },
    }),
    prisma.tag.upsert({
      where: { slug: "tailwindcss" },
      update: {},
      create: { name: "Tailwind CSS", slug: "tailwindcss", color: "#06b6d4" },
    }),
  ])

  // Create posts
  console.log("Creating demo posts...")
  const postData = [
    {
      title: "Getting Started with Next.js 16",
      slug: "getting-started-with-nextjs-16",
      excerpt: "Learn how to build modern web applications with Next.js 16",
      content: "<h2>Introduction</h2><p>Next.js 16 brings exciting new features...</p>",
      status: "PUBLISHED" as const,
      categoryIndex: 0,
      tagIndices: [0, 2, 3],
    },
    {
      title: "Mastering React Server Components",
      slug: "mastering-react-server-components",
      excerpt: "A deep dive into React Server Components and their benefits",
      content: "<h2>What are Server Components?</h2><p>React Server Components allow...</p>",
      status: "PUBLISHED" as const,
      categoryIndex: 0,
      tagIndices: [0, 1, 3],
    },
    {
      title: "Building Beautiful UIs with Tailwind CSS",
      slug: "building-beautiful-uis-with-tailwind",
      excerpt: "Tips and tricks for creating stunning interfaces",
      content: "<h2>Why Tailwind CSS?</h2><p>Tailwind CSS is a utility-first framework...</p>",
      status: "PUBLISHED" as const,
      categoryIndex: 1,
      tagIndices: [4],
    },
    {
      title: "TypeScript Best Practices in 2024",
      slug: "typescript-best-practices-2024",
      excerpt: "Essential TypeScript patterns for modern development",
      content: "<h2>Type Safety Matters</h2><p>TypeScript provides excellent type safety...</p>",
      status: "PUBLISHED" as const,
      categoryIndex: 0,
      tagIndices: [3],
    },
    {
      title: "The Future of Web Development",
      slug: "future-of-web-development",
      excerpt: "Trends and predictions for the web development industry",
      content: "<h2>Looking Ahead</h2><p>Web development continues to evolve...</p>",
      status: "DRAFT" as const,
      categoryIndex: 0,
      tagIndices: [0, 1, 2],
    },
  ]

  for (let i = 0; i < 20; i++) {
    const postTemplate = postData[i % postData.length]
    const slug = i < 5 ? postTemplate.slug : `${postTemplate.slug}-${i}`

    const existingPost = await prisma.post.findUnique({
      where: { slug },
    })

    if (!existingPost) {
      const post = await prisma.post.create({
        data: {
          title: i < 5 ? postTemplate.title : `${postTemplate.title} - Part ${i}`,
          slug,
          excerpt: postTemplate.excerpt,
          content: postTemplate.content,
          status: postTemplate.status,
          publishedAt: postTemplate.status === "PUBLISHED" ? new Date() : null,
          authorId: admin.id,
          categoryId: categories[postTemplate.categoryIndex].id,
        },
      })

      // Add tags
      for (const tagIndex of postTemplate.tagIndices) {
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tags[tagIndex].id,
          },
        })
      }
    }
  }

  // Create default settings
  console.log("Creating default settings...")
  const defaultSettings = [
    { key: "siteName", value: "My Dashboard", group: "general" },
    { key: "siteDescription", value: "A modern admin dashboard", group: "general" },
    { key: "siteUrl", value: "http://localhost:3000", group: "general" },
    { key: "timezone", value: "UTC", group: "general" },
    { key: "dateFormat", value: "MMMM d, yyyy", group: "general" },
    { key: "language", value: "en", group: "general" },
    { key: "primaryColor", value: "#6366f1", group: "appearance" },
    { key: "passwordMinLength", value: "8", group: "security" },
    { key: "sessionTimeout", value: "30", group: "security" },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  // Create subscription plans
  console.log("Creating subscription plans...")
  const plansData = [
    {
      name: "Free",
      description: "Get started with basic features",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: { maxUsers: 1, maxStorage: 1, featureFlags: [] },
      trialDays: 0,
      sortOrder: 0,
    },
    {
      name: "Starter",
      description: "Perfect for small teams",
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      features: { maxUsers: 5, maxStorage: 10, maxApiCalls: 10000, featureFlags: ["api"] },
      trialDays: 14,
      sortOrder: 1,
    },
    {
      name: "Professional",
      description: "For growing businesses",
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      features: { maxUsers: 25, maxStorage: 100, maxApiCalls: 100000, featureFlags: ["api", "sso", "priority_support"] },
      trialDays: 14,
      sortOrder: 2,
      isPopular: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      monthlyPrice: 99.99,
      yearlyPrice: 999.99,
      features: { maxUsers: null, maxStorage: null, maxApiCalls: null, featureFlags: ["api", "sso", "priority_support", "dedicated_support", "custom_integrations"] },
      trialDays: 30,
      sortOrder: 3,
    },
  ]

  for (const planData of plansData) {
    await prisma.plan.upsert({
      where: { name: planData.name },
      update: {},
      create: planData,
    })
  }

  // Create sample activity logs
  console.log("Creating sample activity logs...")
  const activities = [
    { action: "created", entity: "post", description: "Created post 'Getting Started with Next.js 16'" },
    { action: "updated", entity: "user", description: "Updated user profile settings" },
    { action: "published", entity: "post", description: "Published post 'Mastering React Server Components'" },
    { action: "created", entity: "category", description: "Created category 'Technology'" },
    { action: "updated", entity: "settings", description: "Updated site settings" },
  ]

  for (const activity of activities) {
    await prisma.activityLog.create({
      data: {
        ...activity,
        userId: admin.id,
      },
    })
  }

  // Create default email templates
  console.log("Creating email templates...")
  for (const template of defaultEmailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { slug: template.slug },
      update: {},
      create: {
        name: template.name,
        slug: template.slug,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        variables: template.variables,
        description: template.description,
        isActive: true,
      },
    })
  }

  // Create sample notifications
  console.log("Creating sample notifications...")
  const notifications = [
    {
      title: "Welcome to the Dashboard!",
      message: "Thank you for joining. Explore the features and customize your experience.",
      type: "SUCCESS" as const,
      category: "SYSTEM" as const,
      isRead: false,
      link: "/dashboard",
    },
    {
      title: "Post Published",
      message: "Your post 'Getting Started with Next.js 16' has been published successfully.",
      type: "SUCCESS" as const,
      category: "POST" as const,
      isRead: true,
      link: "/dashboard/posts",
    },
    {
      title: "New Comment",
      message: "Demo User 5 commented on your post 'Mastering React Server Components'.",
      type: "INFO" as const,
      category: "COMMENT" as const,
      isRead: false,
    },
    {
      title: "Subscription Reminder",
      message: "Your Professional plan will renew in 7 days.",
      type: "WARNING" as const,
      category: "SUBSCRIPTION" as const,
      isRead: false,
      link: "/dashboard/profile",
    },
    {
      title: "Security Alert",
      message: "A new login was detected from a new device in New York, USA.",
      type: "WARNING" as const,
      category: "SECURITY" as const,
      isRead: true,
      link: "/dashboard/settings/security",
    },
    {
      title: "System Update",
      message: "The dashboard has been updated to version 2.0 with new features.",
      type: "INFO" as const,
      category: "SYSTEM" as const,
      isRead: true,
    },
  ]

  for (const notification of notifications) {
    await prisma.notification.create({
      data: {
        ...notification,
        userId: admin.id,
      },
    })
  }

  // Create default notification preferences for admin
  console.log("Creating notification preferences...")
  const notificationCategories = ["SYSTEM", "POST", "USER", "SUBSCRIPTION", "SECURITY", "COMMENT"] as const
  for (const category of notificationCategories) {
    await prisma.notificationPreference.upsert({
      where: {
        userId_category: {
          userId: admin.id,
          category,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        category,
        email: true,
        inApp: true,
      },
    })
  }

  console.log("Seed completed successfully!")
  console.log("")
  console.log("Default credentials:")
  console.log("  Admin: admin@example.com / admin123")
  console.log("  Demo users: user1@example.com to user50@example.com / demo123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
