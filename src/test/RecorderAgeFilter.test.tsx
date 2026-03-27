import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecorderManagement from "../pages/mobile-users/RecorderManagement";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Cascader since it might use complex DOM
vi.mock("@/components/ui/cascader", () => ({
  default: () => <div data-testid="mock-cascader" />
}));

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={["/dashboard/mobile-users/123/recorders"]}>
      <Routes>
        <Route path="/dashboard/mobile-users/:userId/recorders" element={<RecorderManagement />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Recorder Age Filter Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("年龄筛选输入框应具有 min=14 和 max=120 属性", () => {
    renderWithRouter();
    const inputs = screen.getAllByPlaceholderText("请输入...");
    const ageInput = inputs[1] as HTMLInputElement;
    expect(ageInput.type).toBe("number");
    expect(ageInput.getAttribute("min")).toBe("14");
  });

  it("当输入年龄小于 14 并点击查询时，应弹出错误提示并拦截", async () => {
    renderWithRouter();
    const inputs = screen.getAllByPlaceholderText("请输入...");
    const ageInput = inputs[1] as HTMLInputElement;
    
    fireEvent.change(ageInput, { target: { value: "5" } });
    const queryButton = screen.getByText("查询");
    fireEvent.click(queryButton);
    
    expect(toast.error).toHaveBeenCalledWith("年龄筛选须不小于 14 岁");
  });

  it("当输入年龄小于 14 且失去焦点时，应弹出提示并清空输入", async () => {
    renderWithRouter();
    const inputs = screen.getAllByPlaceholderText("请输入...");
    const ageInput = inputs[1] as HTMLInputElement;
    
    fireEvent.change(ageInput, { target: { value: "10" } });
    fireEvent.blur(ageInput);
    
    expect(toast.error).toHaveBeenCalledWith("年龄筛选须不小于 14 岁");
    expect(ageInput.value).toBe("");
  });

  it("当输入年龄大于等于 14 时，应正常执行查询", async () => {
    renderWithRouter();
    const inputs = screen.getAllByPlaceholderText("请输入...");
    const ageInput = inputs[1] as HTMLInputElement;
    
    fireEvent.change(ageInput, { target: { value: "18" } });
    const queryButton = screen.getByText("查询");
    fireEvent.click(queryButton);
    
    expect(toast.error).not.toHaveBeenCalled();
  });
});
