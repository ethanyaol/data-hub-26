import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
  label: string;
  value: string;
}

interface ClearableSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ClearableSelect({
  options,
  value,
  onValueChange,
  placeholder = "请选择...",
  className,
}: ClearableSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 justify-between font-normal hover:bg-white border-border rounded-md px-3 group relative",
            className
          )}
        >
          <div className="flex flex-1 items-center overflow-hidden mr-4">
            {selectedOption ? (
              <span className="truncate text-foreground font-medium">
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center">
            {value && (
              <div 
                className="h-full px-1.5 flex items-center cursor-pointer hover:bg-muted/50 rounded-sm transition-colors z-20 group/clear"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onValueChange("");
                  // 强制不打开 Popover
                }}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground group-hover/clear:text-destructive" />
              </div>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-1" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <div className="flex flex-col gap-0.5">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",
                value === option.value 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
          {options.length === 0 && (
            <div className="p-2 text-xs text-muted-foreground text-center">
              暂无选项
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
