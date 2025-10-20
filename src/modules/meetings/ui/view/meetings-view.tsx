"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function MeetingsView() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));

  return <div className="overflow-x-scroll">{JSON.stringify(data)}</div>;
}

export function MeetingsViewLoading() {
  return <LoadingState title="正在加载对话" description="可能需要几秒钟..." />;
}

export function MeetingsViewError() {
  return <ErrorState title="对话加载失败" description="请再次尝试" />;
}
