import { z } from "zod";

export const approveRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const rejectRequestSchema = z.object({
  requestId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});
