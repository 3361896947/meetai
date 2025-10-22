import { Button } from "@/components/ui/button";

import Link from "next/link";

export function CallEnded() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-semibold">您已经结束了对话</h6>
            <p className="text-sm">总结将在几分钟后生成</p>
          </div>

          <Button asChild variant="outline">
            <Link href="/meetings">返回</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
