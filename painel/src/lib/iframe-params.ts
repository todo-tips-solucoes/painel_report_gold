import { z } from "zod";

export const iframeParamsSchema = z.object({
  companyId: z.coerce.number().int().positive(),
  backendURL: z.string().optional().default(""),
  user_LoggedName: z.string().optional().default(""),
  user_LoggedLevel: z.enum(["admin", "super", "user"]).optional().default("user"),
});

export type IframeParams = z.infer<typeof iframeParamsSchema>;

export function isPrivileged(level: IframeParams["user_LoggedLevel"]): boolean {
  return level === "admin" || level === "super";
}
