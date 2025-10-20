import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useRouter } from "next/navigation";
import { MeetingForm } from "./meeting-form";

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewMeetingDialog({
  open,
  onOpenChange,
}: NewMeetingDialogProps) {
  const router = useRouter();
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="创建对话"
      description="从这里开始创建"
    >
      <MeetingForm
        onSuccess={(id) => {
          onOpenChange(false);
          router.push(`meetings`);
        }}
        onCancel={() => onOpenChange}
      />
    </ResponsiveDialog>
  );
}
