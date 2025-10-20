import { z } from "zod";

export const agentsInsertSchema = z.object({
  name: z.string().min(1, { message: "名字不能为空" }),
  instructions: z.string().min(1, { message: "指令不能为空" }),
});

export const agentsUpdateSchema = agentsInsertSchema.extend({
  id: z.string().min(1, { message: "ID不能为空" }),
});
