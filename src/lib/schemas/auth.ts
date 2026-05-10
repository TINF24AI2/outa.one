import { z } from "zod";

import { m } from "$lib/paraglide/messages.js";

export function loginSchema() {
  return z.object({
    email: z.string().min(1, m.auth_login_error_email_required()).email(m.auth_login_error_email_invalid()),
    password: z.string().min(1, m.auth_login_error_password_required()),
  });
}

export function signupSchema() {
  return z
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
}

export function forgotPasswordSchema() {
  return z.object({
    email: z.string().min(1, m.auth_forgot_error_email_required()).email(m.auth_forgot_error_email_invalid()),
  });
}

export function resetPasswordSchema() {
  return z
    .object({
      token: z.string().min(1),
      password: z.string().min(8, m.auth_password_min_length()),
      confirmPassword: z.string().min(1, m.auth_reset_error_confirm_required()),
    })
    .refine((d) => d.password === d.confirmPassword, {
      path: ["confirmPassword"],
      message: m.auth_reset_error_password_mismatch(),
    });
}
