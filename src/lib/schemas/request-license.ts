import { z } from "zod";

export const requestLicenseSchema = z.object({
  productId: z.uuid(),
});

export type RequestLicenseInput = z.infer<typeof requestLicenseSchema>;

export type ProductItem = {
  id: string;
  name: string;
  description: string | null;
  requiresApproval: boolean;
  maxLicensesPerUser: number;
  available: number;
  userHeld: number;
  licenseType: "single" | "volume";
};
