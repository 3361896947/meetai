import { auth } from "@/lib/auth"; // 您的认证文件路径
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
