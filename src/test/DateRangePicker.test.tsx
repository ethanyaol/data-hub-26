import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateRangePicker } from "@/components/DateRangePicker";
import * as React from "react";
import { addDays, format } from "date-fns";
import { zhCN } from "date-fns/locale";

describe("DateRangePicker", () => {
    it("renders with placeholder when no range provided", () => {
        render(
            <DateRangePicker
                dateRange={undefined}
                onSelect={() => { }}
                placeholder="Select range"
            />
        );
        expect(screen.getByText("开始日期")).toBeDefined();
        expect(screen.getByText("结束日期")).toBeDefined();
    });

    it("renders selected range dates", () => {
        const from = new Date(2026, 0, 1);
        const to = new Date(2026, 0, 5);
        render(
            <DateRangePicker
                dateRange={{ from, to }}
                onSelect={() => { }}
            />
        );
        expect(screen.getByText(format(from, "yyyy/MM/dd", { locale: zhCN }))).toBeDefined();
        expect(screen.getByText(format(to, "yyyy/MM/dd", { locale: zhCN }))).toBeDefined();
    });

    it("calls onSelect when clear button is clicked", () => {
        const onSelect = vi.fn();
        const from = new Date();
        render(
            <DateRangePicker
                dateRange={{ from }}
                onSelect={onSelect}
            />
        );

        // Open popover
        fireEvent.click(screen.getByRole("button"));

        // Click clear
        const clearBtn = screen.getByText("清除");
        fireEvent.click(clearBtn);

        expect(onSelect).toHaveBeenCalledWith(undefined);
    });
});
