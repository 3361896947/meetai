import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRightIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";

interface Props {
  agentId: string;
  agentName: string;
  onEdit: () => void;
  onRemove: () => void;
}

export function AgentIdViewHeader({
  agentId,
  agentName,
  onEdit,
  onRemove,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="font-medium text-xl">
              <Link href="/agents">我的 Agents</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
            <ChevronRightIcon />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="font-medium text-xl text-foreground"
            >
              <Link href={`/agents/${agentId}`}>{agentName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 没有modal={false}的话，下拉菜单展开会导致网站无法点击 */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon className="size-4 text-black" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRemove}>
            <TrashIcon className="size-4 text-black" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
