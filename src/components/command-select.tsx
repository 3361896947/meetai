import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "./ui/command";

interface Props {
  options: Array<{
    id: string;
    value: string;
    children: ReactNode;
  }>;
  onSelect: (value: string) => void;
  onSearch?: (value: string) => void;
  value: string;
  placeholder?: string;
  isSearchable?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CommandSelect({
  options,
  onSelect,
  onSearch,
  value,
  placeholder = "选择一个选项...",
  className,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  function handleOpenChange(value: boolean) {
    onSearch?.("");
    setOpen(value);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn(
          "h-9 justify-start font-normal px-2",
          !selectedOption && "text-muted-foreground",
          className
        )}
      >
        <div>{selectedOption?.children ?? placeholder}</div>
        <ChevronsUpDownIcon />
      </Button>

      <CommandResponsiveDialog
        shouldFilter={!onSearch}
        open={open}
        onOpenChange={handleOpenChange}
      >
        <CommandInput placeholder="搜索..." onValueChange={onSearch} />
        <CommandList>
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">未找到选项</span>
          </CommandEmpty>

          {options.map((option) => (
            <CommandItem
              key={option.id}
              onSelect={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              {option.children}
            </CommandItem>
          ))}
        </CommandList>
      </CommandResponsiveDialog>
    </>
  );
}
