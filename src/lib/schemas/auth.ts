import { z } from "zod";

import { m } from "$lib/paraglide/messages.js";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, m.auth_login_error_email_required())
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()), m.auth_login_error_email_invalid()),
  password: z.string().min(1, m.auth_login_error_password_required()),
});

export const signupSchema = z
  .object({
    token: z.string().min(1),
    name: z.string().min(1, m.auth_signup_error_name_required()),
    password: z.string().min(8, m.auth_password_min_length()),
    confirmPassword: z.string().min(1, m.auth_signup_error_confirm_required()),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: m.auth_signup_error_password_mismatch(),
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, m.auth_forgot_error_email_required())
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()), m.auth_forgot_error_email_invalid()),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, m.auth_password_min_length()),
    confirmPassword: z.string().min(1, m.auth_reset_error_confirm_required()),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: m.auth_reset_error_password_mismatch(),
  });
