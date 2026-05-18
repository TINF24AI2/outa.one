import { z } from "zod";

export const createLicenseSchema = z.object({
  productId: z.string().uuid("Please select a product"),
  key: z.string().trim().min(1, "Key is required"),
  usageVolume: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number({ error: "Must be a number" }).int().min(0, "Must be 0 or a positive number"),
  ),
});

export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;

export const assignLicenseUserSchema = z.object({
  licenseId: z.string().uuid("Invalid license"),
  userId: z.string().min(1, "Invalid user"),
});

export const unassignLicenseUserSchema = assignLicenseUserSchema;

export type AssignLicenseUserInput = z.infer<typeof assignLicenseUserSchema>;
