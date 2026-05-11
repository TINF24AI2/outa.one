export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MANAGED_ROLES = ["admin", "user"] as const;

export type ManagedRole = (typeof MANAGED_ROLES)[number];

export function isManagedRole(value: string): value is ManagedRole {
  return MANAGED_ROLES.includes(value as ManagedRole);
}

export function asManagedRole(role: string | null | undefined): ManagedRole {
  return role?.split(",").includes("admin") ? "admin" : "user";
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? name,
    lastName: parts.slice(1).join(" "),
  };
}

export function formatDateTime(date: Date | string | null, locale: string, fallback = "—"): string {
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
