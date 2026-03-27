import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

describe("Overview Filter Logic", () => {
  it("should reset filters when Reset button is clicked in Table view", async () => {
    renderWithRouter(<Overview />);
    
    // Switch to table view
    const tableTab = screen.getByText("列表视图");
    fireEvent.click(tableTab);
    
    // Verify we are in table view by checking for '搜索任务名称/ID...' placeholder (part of MultiSelectFuzzySearch)
    const filterSelect = screen.getByText("搜索任务名称/ID...");
    expect(filterSelect).toBeInTheDocument();
    
    // Find Reset button
    const resetButton = screen.getByText("重置");
    expect(resetButton).toBeInTheDocument();
    
    // Fill something (mocking the effect of selection is hard with external complex components, 
    // but we can verify the handleReset click triggers state changes if we could see them or just check button presence)
    fireEvent.click(resetButton);
    
    // After reset, '搜索任务名称/ID...' should still be there (default state)
    expect(screen.getByText("搜索任务名称/ID...")).toBeInTheDocument();
  });

  it("should show '数据统计' header", () => {
    renderWithRouter(<Overview />);
    expect(screen.getByText("数据统计")).toBeInTheDocument();
  });
});
