import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateTask from "../pages/tasks/CreateTask";
import React from "react";

// Mock dependencies
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

// Mock AddTermDialog to avoid complex sub-component logic
vi.mock("@/components/tasks/AddTermDialog", () => ({
    default: () => <div data-testid="add-term-dialog" />,
}));

describe("CreateTask Character Counter", () => {
    it("should display the character counter for '业务标题' inside the input field area", () => {
        render(
            <MemoryRouter>
                <CreateTask />
            </MemoryRouter>
        );

        // Initially it should show 0/30
        const counter = screen.queryByText("0/30");
        expect(counter).not.toBeNull();

        const input = screen.getByPlaceholderText("请输入业务标题") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "Test Title" } });

        expect(screen.queryByText("10/30")).not.toBeNull();
    });

    it("should display the character counter for '需求方信息' inside the textarea field area", () => {
        render(
            <MemoryRouter>
                <CreateTask />
            </MemoryRouter>
        );

        // Initially it should show 0/500
        const counter = screen.queryByText("0/500");
        expect(counter).not.toBeNull();

        const textarea = screen.getByPlaceholderText("请输入需求方信息") as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: "Detailed demand info" } });

        expect(screen.queryByText("20/500")).not.toBeNull();
    });
});
