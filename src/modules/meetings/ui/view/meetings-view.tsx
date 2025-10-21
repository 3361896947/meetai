"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";

export function MeetingsView() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable data={data.items} columns={columns} />
      {data.items.length === 0 && (
        <EmptyState
          title="创建您的第一个对话"
          description="创建一个新的对话，开始与您的Agent互动"
        />
      )}
    </div>
  );
}

export function MeetingsViewLoading() {
  return <LoadingState title="正在加载对话" description="可能需要几秒钟..." />;
}

export function MeetingsViewError() {
  return <ErrorState title="对话加载失败" description="请再次尝试" />;
}
