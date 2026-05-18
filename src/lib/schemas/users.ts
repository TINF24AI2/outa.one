import { z } from "zod";

import { m } from "$lib/paraglide/messages";
import { EMAIL_REGEX, MANAGED_ROLES } from "$lib/user-management";

export const inviteUserSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, m.dashboard_invite_error_email_invalid())
    .refine((value) => EMAIL_REGEX.test(value), m.dashboard_invite_error_email_invalid()),
  role: z.enum(MANAGED_ROLES, {
    error: () => ({ message: m.users_role_error_invalid() }),
  }),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(MANAGED_ROLES, {
    error: () => ({ message: m.users_role_error_invalid() }),
  }),
});

export const removeUserSchema = z.object({
  userId: z.string().min(1),
});

export const resendInviteSchema = z.object({
  inviteId: z.string().min(1),
});

export const cancelInviteSchema = z.object({
  inviteId: z.string().min(1),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type RemoveUserInput = z.infer<typeof removeUserSchema>;
export type ResendInviteInput = z.infer<typeof resendInviteSchema>;
export type CancelInviteInput = z.infer<typeof cancelInviteSchema>;
