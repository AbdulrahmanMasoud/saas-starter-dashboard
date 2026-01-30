import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl">Dashboard</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This dashboard has transformed how we manage our content.
              The intuitive interface and powerful features make administration a breeze.&rdquo;
            </p>
            <footer className="text-sm text-primary-foreground/80">
              — Alex Johnson, Product Manager
            </footer>
          </blockquote>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Dashboard. All rights reserved.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Dashboard</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
