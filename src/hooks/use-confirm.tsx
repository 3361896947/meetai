import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { JSX, useState } from "react";

export function useConfirm(
  title: string,
  description: string
): [() => JSX.Element, () => Promise<unknown>] {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  function confirm() {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  }

  function handleClose() {
    setPromise(null);
  }

  function handleConfirm() {
    promise?.resolve(true);
    handleClose();
  }

  function handleCancel() {
    promise?.resolve(false);
    handleClose();
  }

  function ConfirmationDialog() {
    return (
      <ResponsiveDialog
        open={promise !== null}
        onOpenChange={handleClose}
        title={title}
        description={description}
      >
        <div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full lg:w-auto"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            variant="default"
            className="w-full lg:w-auto"
          >
            确认
          </Button>
        </div>
      </ResponsiveDialog>
    );
  }

  return [ConfirmationDialog, confirm];
}
