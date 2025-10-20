import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { agentsInsertSchema } from "../../schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentGetOne;
}

export function AgentForm({
  onSuccess,
  onCancel,
  initialValues,
}: AgentFormProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );

        // TODO: Invalidate freetier usage

        onSuccess?.();
      },

      onError: (error) => {
        toast.error(`创建Agent失败: ${error.message}`);

        // TODO:如果error code是"FORBIDDEN"，则重定向至 /upgrade 页面
      },
    })
  );

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );

        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.agents.getOne.queryOptions({ id: initialValues.id })
          );
        }

        onSuccess?.();
      },

      onError: (error) => {
        toast.error(`创建Agent失败: ${error.message}`);

        // TODO:如果error code是"FORBIDDEN"，则重定向至 /upgrade 页面
        router.push("/upgrade");
      },
    })
  );

  const isEdit = !!initialValues?.id;
  const isPending = createAgent.isPending || updateAgent.isPending;

  function handleSubmit(values: z.infer<typeof agentsInsertSchema>) {
    if (isEdit) {
      updateAgent.mutate({ ...values, id: initialValues.id });
    } else {
      createAgent.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <GeneratedAvatar
          seed={form.watch("name")}
          variant="botttsNeutral"
          className="border size-16"
        />
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Agent 名称"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="instructions"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>指令</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="请输入指令，例如：你是一个专业的健身指导教练..."
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button
              variant="outline"
              disabled={isPending}
              type="button"
              onClick={() => onCancel()}
            >
              取消
            </Button>
          )}

          <Button variant="default" disabled={isPending} type="submit">
            {isEdit ? "更新" : "创建"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
