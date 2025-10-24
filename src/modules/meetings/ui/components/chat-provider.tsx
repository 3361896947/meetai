"use client";

import { authClient } from "@/lib/auth-client";
import { LoadingState } from "@/components/loading-state";
import { ChatUI } from "./chat-ui";

interface Props {
  meetingId: string;
  meetingName: string;
}

export function ChatProvider({ meetingId, meetingName }: Props) {
  const { data, isPending } = authClient.useSession();

  if (isPending || !data?.user) {
    return (
      <LoadingState
        title="正在加载"
        description="我们正在加载对话，请稍候..."
      />
    );
  }

  return (
    <ChatUI
      meetingId={meetingId}
      meetingName={meetingName}
      userId={data.user.id}
      userName={data.user.name}
      userImage={data.user.image ?? ""}
    />
  );
}
