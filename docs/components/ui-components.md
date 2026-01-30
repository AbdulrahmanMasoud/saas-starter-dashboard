# UI Components

This guide covers the UI component library used in the Taqnihub Fullstack Starter Dashboard.

## Overview

- **Base Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Primitives:** [Radix UI](https://www.radix-ui.com/)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React

## Component Architecture

```
src/components/
├── ui/              # Base UI components (shadcn/ui)
├── dashboard/       # Dashboard-specific components
├── auth/            # Authentication forms
├── analytics/       # Analytics components
└── providers/       # Context providers
```

---

## Base UI Components

### Button

Versatile button component with variants.

```typescript
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add New
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Input

Text input with label and error handling.

```typescript
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="name@example.com"
  />
</div>
```

### Card

Container component with header and footer.

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog

Modal dialog component.

```typescript
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a description of the dialog.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Select

Dropdown select component.

```typescript
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

### Dropdown Menu

Context menu and dropdown menus.

```typescript
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tabs

Tab navigation component.

```typescript
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
    <TabsTrigger value="notifications">Notifications</TabsTrigger>
  </TabsList>
  <TabsContent value="general">
    General settings content
  </TabsContent>
  <TabsContent value="security">
    Security settings content
  </TabsContent>
  <TabsContent value="notifications">
    Notifications settings content
  </TabsContent>
</Tabs>
```

### Table

Basic table components.

```typescript
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <Badge>{user.status}</Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Badge

Status and label badges.

```typescript
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### Avatar

User avatar component.

```typescript
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Checkbox & Switch

Toggle controls.

```typescript
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

// Checkbox
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>

// Switch
<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

### Alert

Alert messages.

```typescript
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

// Error alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>

// Success alert
<Alert>
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    Your changes have been saved.
  </AlertDescription>
</Alert>
```

### Skeleton

Loading placeholder.

```typescript
import { Skeleton } from "@/components/ui/skeleton";

// Text skeleton
<Skeleton className="h-4 w-[200px]" />

// Avatar skeleton
<Skeleton className="h-12 w-12 rounded-full" />

// Card skeleton
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### Tooltip

Hover tooltips.

```typescript
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Helpful information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Dashboard Components

### Data Table

Full-featured data table with TanStack Table.

```typescript
import { DataTable } from "@/components/dashboard/data-table";

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge>{row.getValue("status")}</Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        {/* Action menu */}
      </DropdownMenu>
    ),
  },
];

<DataTable
  columns={columns}
  data={users}
  searchKey="name"
  searchPlaceholder="Search users..."
/>
```

### Server Data Table

Server-side pagination variant.

```typescript
import { ServerDataTable } from "@/components/dashboard/server-data-table";

<ServerDataTable
  columns={columns}
  data={data}
  pageCount={totalPages}
  searchKey="title"
/>
```

### Stats Card

Dashboard metric cards.

```typescript
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, FileText, DollarSign } from "lucide-react";

<div className="grid gap-4 md:grid-cols-3">
  <StatsCard
    title="Total Users"
    value="1,234"
    change="+12%"
    changeType="increase"
    icon={Users}
  />
  <StatsCard
    title="Total Posts"
    value="567"
    change="+5%"
    changeType="increase"
    icon={FileText}
  />
  <StatsCard
    title="Revenue"
    value="$12,345"
    change="-2%"
    changeType="decrease"
    icon={DollarSign}
  />
</div>
```

### Sidebar

Main navigation sidebar.

```typescript
// Configured in src/components/dashboard/sidebar.tsx

// Navigation items with permissions
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Posts",
    href: "/dashboard/posts",
    icon: FileText,
    permission: "posts.view",
  },
  // ...
];
```

### User Menu

Profile dropdown menu.

```typescript
import { UserMenu } from "@/components/dashboard/user-menu";

<UserMenu
  user={{
    name: "John Doe",
    email: "john@example.com",
    image: "/avatar.jpg",
  }}
/>
```

### Theme Toggle

Dark/light mode switcher.

```typescript
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

<ThemeToggle />
```

### Search Command

Global search with keyboard shortcut (Cmd+K).

```typescript
import { SearchCommand } from "@/components/dashboard/search-command";

<SearchCommand />
```

---

## Form Components

### Form with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    name: "",
    email: "",
  },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

---

## Chart Components

### Area Chart

```typescript
import { AreaChart } from "@/components/dashboard/charts/area-chart";

<AreaChart
  data={pageViewData}
  title="Page Views"
  description="Last 30 days"
/>
```

### Bar Chart

```typescript
import { BarChart } from "@/components/dashboard/charts/bar-chart";

<BarChart
  data={postsByCategory}
  title="Posts by Category"
/>
```

### Pie Chart

```typescript
import { PieChart } from "@/components/dashboard/charts/pie-chart";

<PieChart
  data={subscriptionsByPlan}
  title="Subscriptions by Plan"
/>
```

---

## Toast Notifications

Using Sonner for toast notifications.

```typescript
import { toast } from "sonner";

// Success
toast.success("Changes saved successfully");

// Error
toast.error("Failed to save changes");

// Info
toast.info("New update available");

// Loading
toast.promise(saveData(), {
  loading: "Saving...",
  success: "Saved successfully",
  error: "Failed to save",
});
```

---

## Theming

### CSS Variables

Theme colors are defined in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Using Theme Colors

```typescript
// In Tailwind classes
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />

// With variants
<div className="bg-muted text-muted-foreground" />
<div className="border-border" />
```

### Custom Colors

Extend the theme in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
      },
    },
  },
}
```

---

## Best Practices

### Component Composition

```typescript
// Compose smaller components
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Users</CardTitle>
      <Button size="sm">Add User</Button>
    </div>
  </CardHeader>
  <CardContent>
    <DataTable columns={columns} data={users} />
  </CardContent>
</Card>
```

### Loading States

```typescript
// Show skeleton while loading
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
) : (
  <DataTable columns={columns} data={data} />
)}
```

### Error Handling

```typescript
// Show error state
{error ? (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
) : (
  <Component />
)}
```

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast

```typescript
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

---

## Related Documentation

- [Features](../features/)
- [Configuration](../configuration.md)
- [shadcn/ui Docs](https://ui.shadcn.com/)
