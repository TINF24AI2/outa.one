import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.preprocess((value) => (value === "" ? null : value), z.string().trim().nullable()),
  maxLicensesPerUser: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number({ error: "Must be a number" }).int().min(0, "Must be 0 or a positive number"),
  ),
  requiresApproval: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
