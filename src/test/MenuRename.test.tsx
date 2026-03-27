import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Overview from "../pages/Overview";
import React from "react";

describe("Menu and Page Title Rename", () => {
    it("should display '数据统计' in the side menu instead of '概览'", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <DashboardLayout />
            </MemoryRouter>
        );
        // This is expected to fail initially as it currently says "概览"
        const menuElement = screen.queryByText("数据统计");
        expect(menuElement).not.toBeNull();
    });

    it("should display '数据统计' as the page heading in Overview", () => {
        render(
            <MemoryRouter>
                <Overview />
            </MemoryRouter>
        );
        const headingElement = screen.getByRole("heading", { name: "数据统计" });
        expect(headingElement).toBeDefined();
    });

    it("should use '数据统计' in the Overview description instead of '数据概览'", () => {
        render(
            <MemoryRouter>
                <Overview />
            </MemoryRouter>
        );
        const descriptionElement = screen.queryByText(/数据统计可查看/);
        expect(descriptionElement).not.toBeNull();
    });
});
