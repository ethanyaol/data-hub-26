import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export interface Option {
  label: string;
  value: string;
  id: string;
}

interface MultiSelectFuzzySearchProps {
  options: Option[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectFuzzySearch({
  options,
  selectedValues,
  onSelect,
  placeholder = "选择项...",
  className,
}: MultiSelectFuzzySearchProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    onSelect(selectedValues.filter((s) => s !== value));
  };

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelect(selectedValues.filter((s) => s !== value));
    } else {
      onSelect([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    onSelect(options.map((opt) => opt.value));
  };

  const handleInvertSelection = () => {
    const newSelection = options
      .map((opt) => opt.value)
      .filter((val) => !selectedValues.includes(val));
    onSelect(newSelection);
  };

  // 选项排序：已选项置顶，然后按名称排序
  const sortedOptions = React.useMemo(() => {
    return [...options].sort((a, b) => {
      const aSelected = selectedValues.includes(a.value);
      const bSelected = selectedValues.includes(b.value);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [options, selectedValues]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-52 h-9 justify-between font-normal hover:bg-white border-gray-200 rounded-lg px-3 group",
            className
          )}
        >
          <div className="flex flex-1 gap-1 overflow-hidden items-center">
            {selectedValues.length > 0 ? (
              <>
                <div className="flex flex-1 gap-1 overflow-hidden shrink-0">
                  {options
                    .filter((opt) => selectedValues.includes(opt.value))
                    .map((opt) => (
                      <Badge
                        key={opt.value}
                        variant="secondary"
                        className="rounded-md px-1 font-normal bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shrink-0 max-w-[80px]"
                      >
                        <span className="truncate">{opt.label}</span>
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive transition-colors shrink-0"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUnselect(opt.value);
                          }}
                        />
                      </Badge>
                    ))}
                </div>
                {selectedValues.length > options.filter(opt => selectedValues.includes(opt.value)).length && (
                  <span className="text-muted-foreground text-xs shrink-0">...</span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command
          filter={(value, search) => {
                        // value 是 CommandItem 的属性值，用于匹配搜索词
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="输入名称或ID搜索..." className="h-9" />
          <CommandList>
            <CommandEmpty>未找到结果</CommandEmpty>
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={handleSelectAll}
              >
                全选
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={handleInvertSelection}
              >
                反选
              </Button>
            </div>
            <CommandGroup>
              {sortedOptions.map((option) => (
                <CommandItem
                  key={option.value}
                                    value={`${option.label} ${option.id}`} // 用于搜索过滤
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    className="pointer-events-none"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-medium">{option.label}</span>
                    <span className="truncate text-[10px] text-muted-foreground font-mono">
                      {option.id}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
