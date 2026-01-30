import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const seoMeta = await db.seoMeta.findUnique({
      where: { postId: id },
    })

    return NextResponse.json(seoMeta)
  } catch (error) {
    console.error("Error fetching SEO meta:", error)
    return NextResponse.json(
      { error: "Failed to fetch SEO meta" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const {
      metaTitle,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonicalUrl,
      noIndex,
      noFollow,
    } = body

    // Upsert SEO meta
    const seoMeta = await db.seoMeta.upsert({
      where: { postId: id },
      update: {
        metaTitle,
        metaDescription,
        metaKeywords,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        twitterImage,
        canonicalUrl,
        noIndex,
        noFollow,
      },
      create: {
        postId: id,
        metaTitle,
        metaDescription,
        metaKeywords,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        twitterImage,
        canonicalUrl,
        noIndex,
        noFollow,
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "updated",
        entity: "seo",
        entityId: seoMeta.id,
        description: `Updated SEO for "${post.title}"`,
      },
    })

    return NextResponse.json(seoMeta)
  } catch (error) {
    console.error("Error updating SEO meta:", error)
    return NextResponse.json(
      { error: "Failed to update SEO meta" },
      { status: 500 }
    )
  }
}
