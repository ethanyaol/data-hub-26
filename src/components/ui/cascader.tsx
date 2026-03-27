import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { provinces, Location } from "../../pages/mobile-users/locations";

interface CascaderProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Cascader = ({
  value,
  onValueChange,
  placeholder = "请选择...",
  className,
  disabled = false,
}: CascaderProps) => {
  const [open, setOpen] = React.useState(false);
  const [hoveredProvince, setHoveredProvince] = React.useState<string | null>(null);

  // Parse current value
  const [currentProvince, currentCity] = (value || "").split("-");

  // Reset hovered province when popover opens
  React.useEffect(() => {
    if (open && currentProvince) {
      setHoveredProvince(currentProvince);
    }
  }, [open, currentProvince]);

  const activeProvince = hoveredProvince || currentProvince;
  const cities = provinces.find((p) => p.province === activeProvince)?.cities || [];

  const handleCitySelect = (province: string, city: string) => {
    onValueChange(`${province}-${city}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal hover:bg-background transition-all border-input shadow-sm",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronRight className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200", open && "rotate-90")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex h-[300px] shadow-2xl border-border bg-popover" align="start">
        {/* Provinces Column */}
        <div className="w-[160px] border-r border-border overflow-y-auto pt-1 pb-1 scrollbar-thin scrollbar-thumb-muted">
          {provinces.map((p) => (
            <div
              key={p.province}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors group",
                activeProvince === p.province 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onMouseEnter={() => setHoveredProvince(p.province)}
              onClick={() => setHoveredProvince(p.province)}
            >
              <span className="truncate">{p.province}</span>
              <ChevronRight className={cn(
                "h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity",
                activeProvince === p.province && "opacity-100"
              )} />
            </div>
          ))}
        </div>

        {/* Cities Column */}
        <div className="w-[180px] overflow-y-auto pt-1 pb-1 scrollbar-thin scrollbar-thumb-muted bg-background/50">
          {cities.length > 0 ? (
            cities.map((city) => (
              <div
                key={city}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors",
                  currentCity === city && currentProvince === activeProvince
                    ? "text-primary font-medium" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => handleCitySelect(activeProvince!, city)}
              >
                <span className="truncate">{city}</span>
                {currentCity === city && currentProvince === activeProvince && (
                  <Check className="h-3 w-3 text-primary animate-in zoom-in-50" />
                )}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic px-4 text-center">
              请选择左侧省份以查看城市
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Cascader;
