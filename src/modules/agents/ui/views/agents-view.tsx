"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function AgentsView() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
export function AgentsViewLoading() {
  return (
    <LoadingState title="正在加载Agents" description="可能需要几秒钟..." />
  );
}

export function AgentsViewError() {
  return <ErrorState title="Agents加载失败" description="请再次尝试" />;
}
