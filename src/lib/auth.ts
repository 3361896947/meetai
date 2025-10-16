import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // 您的 drizzle 实例
import * as schema from "@/db/schema"; // 您的数据库 schema

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg", // 或 "mysql", "sqlite"
    schema: {
      ...schema,
    },
  }),
});
