// ─── User Roles ───────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// ─── Expiry Thresholds ────────────────────────────────────────────
export const EXPIRY_WARNING_DAYS = 30; // Show yellow badge
export const EXPIRY_CRITICAL_DAYS = 7; // Show red badge

// ─── Pagination ───────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;

// ─── API ──────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api/v1";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:3001";

// ─── Navigation ───────────────────────────────────────────────────
export type NavItem = {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin", "manager", "cashier"],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: "Package",
    roles: ["admin", "manager", "cashier"],
  },
  {
    label: "Scan",
    href: "/scan",
    icon: "ScanLine",
    roles: ["admin", "manager", "cashier"],
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: "ArrowLeftRight",
    roles: ["admin", "manager"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "BarChart3",
    roles: ["admin", "manager"],
  },
  {
    label: "AI Forecast",
    href: "/ai-forecast",
    icon: "Brain",
    roles: ["admin", "manager"],
  },
  {
    label: "Waste Alerts",
    href: "/waste-alerts",
    icon: "AlertTriangle",
    roles: ["admin", "manager", "cashier"],
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: "Truck",
    roles: ["admin", "manager"],
  },
  { label: "Settings", href: "/settings", icon: "Settings", roles: ["admin"] },
];

// ─── Socket Events ────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  LOW_STOCK_ALERT: "LOW_STOCK_ALERT",
  EXPIRY_ALERT: "EXPIRY_ALERT",
  FORECAST_READY: "FORECAST_READY",
  JOIN_ROOM: "join_room",
} as const;

// ─── Product Units ────────────────────────────────────────────────
export const PRODUCT_UNITS = [
  "pcs",
  "kg",
  "ltr",
  "box",
  "pack",
  "dozen",
] as const;

// ─── Product Categories ───────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  "Grocery",
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Frozen",
  "Produce",
  "Meat",
  "Personal Care",
  "Household",
  "Other",
] as const;
