import {
  LayoutDashboard,
  Users,
  FileText,
  FolderTree,
  Tags,
  Image,
  Search,
  ArrowRightLeft,
  Settings,
  Shield,
  Activity,
  CreditCard,
  BarChart3,
  Mail,
  History,
  type LucideIcon,
} from "lucide-react"
import { PERMISSIONS, type Permission } from "./permissions"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  permission?: Permission
  badge?: string | number
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "Posts",
        href: "/dashboard/posts",
        icon: FileText,
        permission: PERMISSIONS.POSTS_VIEW,
      },
      {
        title: "Categories",
        href: "/dashboard/categories",
        icon: FolderTree,
        permission: PERMISSIONS.CATEGORIES_MANAGE,
      },
      {
        title: "Tags",
        href: "/dashboard/tags",
        icon: Tags,
        permission: PERMISSIONS.TAGS_MANAGE,
      },
      {
        title: "Media",
        href: "/dashboard/media",
        icon: Image,
        permission: PERMISSIONS.MEDIA_VIEW,
      },
    ],
  },
  {
    title: "SEO",
    items: [
      {
        title: "SEO Settings",
        href: "/dashboard/seo",
        icon: Search,
        permission: PERMISSIONS.SEO_MANAGE,
      },
      {
        title: "Redirects",
        href: "/dashboard/redirects",
        icon: ArrowRightLeft,
        permission: PERMISSIONS.REDIRECTS_MANAGE,
      },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      {
        title: "Plans",
        href: "/dashboard/plans",
        icon: CreditCard,
        permission: PERMISSIONS.PLANS_VIEW,
      },
      {
        title: "Subscriptions",
        href: "/dashboard/subscriptions",
        icon: CreditCard,
        permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
      },
    ],
  },
  {
    title: "Email",
    items: [
      {
        title: "Templates",
        href: "/dashboard/email/templates",
        icon: Mail,
        permission: PERMISSIONS.EMAIL_TEMPLATES_VIEW,
      },
      {
        title: "Logs",
        href: "/dashboard/email/logs",
        icon: History,
        permission: PERMISSIONS.EMAIL_LOGS_VIEW,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Users",
        href: "/dashboard/users",
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        title: "Roles",
        href: "/dashboard/roles",
        icon: Shield,
        permission: PERMISSIONS.ROLES_VIEW,
      },
      {
        title: "Activity Log",
        href: "/dashboard/activity",
        icon: Activity,
        permission: PERMISSIONS.ACTIVITY_VIEW,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
]
