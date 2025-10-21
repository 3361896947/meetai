import { EmptyState } from "@/components/empty-state";

export function ProcessingState() {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center">
      <EmptyState
        image="/processing.svg"
        title="对话已结束，正在生成总结"
        description="对话已结束，正在生成总结，请稍候..."
      />
    </div>
  );
}
