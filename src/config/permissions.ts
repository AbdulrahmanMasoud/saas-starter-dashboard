export const PERMISSIONS = {
  // Users
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",

  // Posts
  POSTS_VIEW: "posts.view",
  POSTS_CREATE: "posts.create",
  POSTS_EDIT: "posts.edit",
  POSTS_EDIT_ALL: "posts.edit_all",
  POSTS_DELETE: "posts.delete",
  POSTS_DELETE_ALL: "posts.delete_all",
  POSTS_PUBLISH: "posts.publish",

  // Categories
  CATEGORIES_MANAGE: "categories.manage",

  // Tags
  TAGS_MANAGE: "tags.manage",

  // Media
  MEDIA_VIEW: "media.view",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_DELETE: "media.delete",
  MEDIA_DELETE_ALL: "media.delete_all",

  // SEO
  SEO_MANAGE: "seo.manage",

  // Redirects
  REDIRECTS_MANAGE: "redirects.manage",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",

  // Roles
  ROLES_VIEW: "roles.view",
  ROLES_MANAGE: "roles.manage",

  // Activity
  ACTIVITY_VIEW: "activity.view",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",

  // Plans
  PLANS_VIEW: "plans.view",
  PLANS_CREATE: "plans.create",
  PLANS_EDIT: "plans.edit",
  PLANS_DELETE: "plans.delete",

  // Subscriptions
  SUBSCRIPTIONS_VIEW: "subscriptions.view",
  SUBSCRIPTIONS_CREATE: "subscriptions.create",
  SUBSCRIPTIONS_EDIT: "subscriptions.edit",
  SUBSCRIPTIONS_CANCEL: "subscriptions.cancel",

  // Email
  EMAIL_TEMPLATES_VIEW: "email.templates.view",
  EMAIL_TEMPLATES_EDIT: "email.templates.edit",
  EMAIL_LOGS_VIEW: "email.logs.view",
  EMAIL_SEND: "email.send",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const PERMISSION_GROUPS = {
  users: {
    label: "Users",
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: "View users" },
      { key: PERMISSIONS.USERS_CREATE, label: "Create users" },
      { key: PERMISSIONS.USERS_EDIT, label: "Edit users" },
      { key: PERMISSIONS.USERS_DELETE, label: "Delete users" },
    ],
  },
  posts: {
    label: "Posts",
    permissions: [
      { key: PERMISSIONS.POSTS_VIEW, label: "View posts" },
      { key: PERMISSIONS.POSTS_CREATE, label: "Create posts" },
      { key: PERMISSIONS.POSTS_EDIT, label: "Edit own posts" },
      { key: PERMISSIONS.POSTS_EDIT_ALL, label: "Edit all posts" },
      { key: PERMISSIONS.POSTS_DELETE, label: "Delete own posts" },
      { key: PERMISSIONS.POSTS_DELETE_ALL, label: "Delete all posts" },
      { key: PERMISSIONS.POSTS_PUBLISH, label: "Publish posts" },
    ],
  },
  content: {
    label: "Content",
    permissions: [
      { key: PERMISSIONS.CATEGORIES_MANAGE, label: "Manage categories" },
      { key: PERMISSIONS.TAGS_MANAGE, label: "Manage tags" },
    ],
  },
  media: {
    label: "Media",
    permissions: [
      { key: PERMISSIONS.MEDIA_VIEW, label: "View media" },
      { key: PERMISSIONS.MEDIA_UPLOAD, label: "Upload media" },
      { key: PERMISSIONS.MEDIA_DELETE, label: "Delete own media" },
      { key: PERMISSIONS.MEDIA_DELETE_ALL, label: "Delete all media" },
    ],
  },
  seo: {
    label: "SEO",
    permissions: [
      { key: PERMISSIONS.SEO_MANAGE, label: "Manage SEO" },
      { key: PERMISSIONS.REDIRECTS_MANAGE, label: "Manage redirects" },
    ],
  },
  settings: {
    label: "Settings",
    permissions: [
      { key: PERMISSIONS.SETTINGS_VIEW, label: "View settings" },
      { key: PERMISSIONS.SETTINGS_EDIT, label: "Edit settings" },
    ],
  },
  system: {
    label: "System",
    permissions: [
      { key: PERMISSIONS.ROLES_VIEW, label: "View roles" },
      { key: PERMISSIONS.ROLES_MANAGE, label: "Manage roles" },
      { key: PERMISSIONS.ACTIVITY_VIEW, label: "View activity logs" },
      { key: PERMISSIONS.ANALYTICS_VIEW, label: "View analytics" },
    ],
  },
  plans: {
    label: "Plans",
    permissions: [
      { key: PERMISSIONS.PLANS_VIEW, label: "View plans" },
      { key: PERMISSIONS.PLANS_CREATE, label: "Create plans" },
      { key: PERMISSIONS.PLANS_EDIT, label: "Edit plans" },
      { key: PERMISSIONS.PLANS_DELETE, label: "Delete plans" },
    ],
  },
  subscriptions: {
    label: "Subscriptions",
    permissions: [
      { key: PERMISSIONS.SUBSCRIPTIONS_VIEW, label: "View subscriptions" },
      { key: PERMISSIONS.SUBSCRIPTIONS_CREATE, label: "Assign subscriptions" },
      { key: PERMISSIONS.SUBSCRIPTIONS_EDIT, label: "Edit subscriptions" },
      { key: PERMISSIONS.SUBSCRIPTIONS_CANCEL, label: "Cancel subscriptions" },
    ],
  },
  email: {
    label: "Email",
    permissions: [
      { key: PERMISSIONS.EMAIL_TEMPLATES_VIEW, label: "View email templates" },
      { key: PERMISSIONS.EMAIL_TEMPLATES_EDIT, label: "Edit email templates" },
      { key: PERMISSIONS.EMAIL_LOGS_VIEW, label: "View email logs" },
      { key: PERMISSIONS.EMAIL_SEND, label: "Send emails" },
    ],
  },
}

export const DEFAULT_ROLE_PERMISSIONS = {
  Admin: Object.values(PERMISSIONS),
  Editor: [
    PERMISSIONS.POSTS_VIEW,
    PERMISSIONS.POSTS_CREATE,
    PERMISSIONS.POSTS_EDIT,
    PERMISSIONS.POSTS_EDIT_ALL,
    PERMISSIONS.POSTS_DELETE,
    PERMISSIONS.POSTS_PUBLISH,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.TAGS_MANAGE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.SEO_MANAGE,
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.EMAIL_TEMPLATES_VIEW,
    PERMISSIONS.EMAIL_LOGS_VIEW,
  ],
  Author: [
    PERMISSIONS.POSTS_VIEW,
    PERMISSIONS.POSTS_CREATE,
    PERMISSIONS.POSTS_EDIT,
    PERMISSIONS.POSTS_DELETE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.TAGS_MANAGE,
    PERMISSIONS.PLANS_VIEW,
  ],
  User: [
    PERMISSIONS.POSTS_VIEW,
    PERMISSIONS.MEDIA_VIEW,
  ],
}
