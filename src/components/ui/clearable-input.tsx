import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ClearableInputProps extends React.ComponentProps<typeof Input> {
  onClear: () => void;
  value: string;
}

const ClearableInput = React.forwardRef<HTMLInputElement, ClearableInputProps>(
  ({ onClear, value, className, ...props }, ref) => {
    return (
      <div className="relative group">
        <Input
          ref={ref}
          value={value}
          className={cn("pr-8 h-9 text-sm", className)}
          {...props}
        />
        {value && (
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 h-full px-1 flex items-center cursor-pointer hover:bg-muted/50 rounded-sm transition-colors z-10 group/clear"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground group-hover/clear:text-destructive" />
          </div>
        )}
      </div>
    );
  }
);
ClearableInput.displayName = "ClearableInput";

export { ClearableInput };
