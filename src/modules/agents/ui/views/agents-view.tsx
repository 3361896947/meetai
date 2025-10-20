"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { columns, Payment } from "../components/columns";
import { EmptyState } from "@/components/empty-state";

export function AgentsView() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable data={data} columns={columns} />
      {data.length === 0 && (
        <EmptyState
          title="创建您的第一个Agent"
          description="创建一个新的Agent，它将会根据您的指令来与您互动"
        />
      )}
    </div>
  );
}
export function AgentsViewLoading() {
  return (
    <LoadingState title="正在加载Agents" description="可能需要几秒钟..." />
  );
}

export function AgentsViewError() {
  return <ErrorState title="Agents加载失败" description="请再次尝试" />;
}
