export const DEMO_PASSWORD = "password";

export const DEMO_USERS = [
  // Employees
  { id: "demo-employee-1", name: "Sarah Johnson", email: "sarah.johnson@company.com", role: "user" as const },
  { id: "demo-employee-2", name: "Marcus Chen", email: "marcus.chen@company.com", role: "user" as const },
  { id: "demo-employee-3", name: "Priya Patel", email: "priya.patel@company.com", role: "user" as const },
  // Admins
  { id: "demo-admin-1", name: "Emily Rodriguez", email: "emily.rodriguez@company.com", role: "admin" as const },
  { id: "demo-admin-2", name: "David Kim", email: "david.kim@company.com", role: "admin" as const },
];

export const DEMO_EMAILS = DEMO_USERS.map((u) => u.email);
