import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TaskList from "../pages/tasks/TaskList";
import Overview from "../pages/Overview";
import { BrowserRouter } from "react-router-dom";

// Mock resize observer and other browser APIs
vi.stubGlobal("ResizeObserver", vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe("Clearable Global Functionality", () => {
  it("should have a reset button in Overview visual view", async () => {
    renderWithRouter(<Overview />);
    // Visual view is default
    const resetButton = screen.getByText("重置");
    expect(resetButton).toBeInTheDocument();
  });

  it("should have clearable initiator input in TaskList", async () => {
    renderWithRouter(<TaskList />);
    const initiatorInput = screen.getByPlaceholderText("请输入发起人");
    fireEvent.change(initiatorInput, { target: { value: "admin" } });
    
    // Find the X clear button next to the input
    const clearButton = initiatorInput.parentElement?.querySelector("svg");
    expect(clearButton).toBeInTheDocument();
  });

  it("should use MultiSelectFuzzySearch for tasks in TaskList", async () => {
    renderWithRouter(<TaskList />);
    const taskTrigger = screen.getByText("搜索任务ID或任务名称...");
    expect(taskTrigger).toBeInTheDocument();
  });
});
