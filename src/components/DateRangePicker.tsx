import * as React from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
    dateRange: DateRange | undefined;
    onSelect: (range: DateRange | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DateRangePicker({
    dateRange,
    onSelect,
    placeholder = "选择日期范围",
    className,
}: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-9 justify-start text-left font-normal border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors inline-flex items-center gap-2 px-3",
                        !dateRange && "text-muted-foreground",
                        className
                    )}
                >
                    <span className={dateRange?.from ? "text-foreground" : "text-muted-foreground"}>
                        {dateRange?.from ? format(dateRange.from, "yyyy/MM/dd", { locale: zhCN }) : "开始日期"}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className={dateRange?.to ? "text-foreground" : "text-muted-foreground"}>
                        {dateRange?.to ? format(dateRange.to, "yyyy/MM/dd", { locale: zhCN }) : "结束日期"}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground ml-1" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={onSelect}
                    numberOfMonths={2}
                    locale={zhCN}
                    className="p-3"
                />
                <div className="flex items-center justify-end gap-2 px-3 pb-3">
                    <button
                        className="h-8 px-3 text-xs border border-gray-200 rounded-md bg-white text-muted-foreground hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => { onSelect(undefined); }}
                    >
                        清除
                    </button>
                    <button
                        className="h-8 px-3 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        确定
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
