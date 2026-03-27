import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ClearableSelect } from "../components/ClearableSelect";

describe("ClearableSelect Component", () => {
  const options = [
    { label: "整份录制", value: "整份录制" },
    { label: "定量录制", value: "定量录制" },
  ];

  it("should display the placeholder when no value is selected", () => {
    render(
      <ClearableSelect
        options={options}
        value=""
        onValueChange={vi.fn()}
        placeholder="请选择类型"
      />
    );
    expect(screen.getByText("请选择类型")).toBeInTheDocument();
  });

  it("should display the selected label and the clear button when value is set", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <ClearableSelect
        options={options}
        value="整份录制"
        onValueChange={onValueChange}
        placeholder="请选择类型"
      />
    );
    expect(screen.getByText("整份录制")).toBeInTheDocument();
    
    // Find the X (clear) icon/button
    const clearButton = container.querySelector(".lucide-x");
    expect(clearButton).toBeInTheDocument();
  });

  it("should call onValueChange with empty string when clear button is clicked", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <ClearableSelect
        options={options}
        value="整份录制"
        onValueChange={onValueChange}
        placeholder="请选择类型"
      />
    );
    
    const clearButton = container.querySelector(".lucide-x") as Element;
    fireEvent.click(clearButton);
    
    expect(onValueChange).toHaveBeenCalledWith("");
  });
});
