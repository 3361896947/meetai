import { auth } from "@/lib/auth"; // 您的认证文件路径
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const GET = async (req: Request) => {
  try {
    return await handlers.GET(req);
  } catch (err) {
    // 打印错误详情到控制台，便于定位是 token 交换、redirect mismatch 还是 code 已被使用
    console.error("[auth][GET] error during auth callback:", err);
    throw err;
  }
};

export const POST = async (req: Request) => {
  try {
    return await handlers.POST(req);
  } catch (err) {
    console.error("[auth][POST] error during auth callback:", err);
    throw err;
  }
};
