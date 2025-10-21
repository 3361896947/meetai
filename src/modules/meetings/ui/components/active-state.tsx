import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  meetingId: string;
}

export function ActiveState({ meetingId }: Props) {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center">
      <EmptyState
        image="/upcoming.svg"
        title="对话进行中"
        description="所有成员将离开时对话将结束"
      />

      <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2">
        <Button asChild className="w-full lg:w-auto">
          <Link href={`/call/${meetingId}`}>
            <VideoIcon />
            加入对话
          </Link>
        </Button>
      </div>
    </div>
  );
}
