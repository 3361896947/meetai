import { z } from "zod";

export const meetingsInsertSchema = z.object({
  name: z.string().min(1, { message: "名字不能为空" }),
  agentId: z.string().min(1, { message: "AgentId不能为空" }),
});

export const meetingsUpdateSchema = meetingsInsertSchema.extend({
  id: z.string().min(1, { message: "ID不能为空" }),
});
