import { EmptyState } from "@/components/empty-state";

export function CancelledState() {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center">
      <EmptyState
        image="/cancelled.svg"
        title="对话已取消"
        description="对话已被取消，无法加入"
      />
    </div>
  );
}
