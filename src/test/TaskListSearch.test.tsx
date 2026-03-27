import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TaskList from "../pages/tasks/TaskList";
import { BrowserRouter } from "react-router-dom";

// Mock the components that might use window functions or are complex
vi.mock("@/components/DateRangePicker", () => ({
  DateRangePicker: () => <div data-testid="date-range-picker" />
}));

vi.mock("@/components/MultiSelectFuzzySearch", () => ({
  MultiSelectFuzzySearch: () => <div data-testid="multi-select" />
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe("TaskList Search Logic", () => {
  it("should filter tasks by ID-based fuzzy search", async () => {
    renderWithRouter(<TaskList />);
    const searchInput = screen.getByPlaceholderText("请输入任务ID/任务名称");
    
    // Test ID fuzzy search
    fireEvent.change(searchInput, { target: { value: "fsfefe" } });
    
    // "采集多方言唤醒词" has ID "fsfefe-..."
    expect(screen.getByText("采集多方言唤醒词")).toBeInTheDocument();
    expect(screen.queryByText("普通话命令词采集")).not.toBeInTheDocument();
  });

  it("should filter tasks by Name-based fuzzy search in the same ID field", async () => {
    renderWithRouter(<TaskList />);
    const searchInput = screen.getByPlaceholderText("请输入任务ID/任务名称");
    
    // Test Name fuzzy search in the same field
    fireEvent.change(searchInput, { target: { value: "普通话" } });
    
    expect(screen.getByText("普通话命令词采集")).toBeInTheDocument();
    expect(screen.queryByText("采集多方言唤醒词")).not.toBeInTheDocument();
  });

  it("should show '暂无数据' when no match found", async () => {
    renderWithRouter(<TaskList />);
    const searchInput = screen.getByPlaceholderText("请输入任务ID/任务名称");
    
    fireEvent.change(searchInput, { target: { value: "non-existent-task" } });
    
    expect(screen.getByText("暂无数据")).toBeInTheDocument();
  });
});
