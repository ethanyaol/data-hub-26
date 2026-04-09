import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SubtaskExecutionDetails from "../pages/tasks/SubtaskExecutionDetails";
import { BrowserRouter, useParams } from "react-router-dom";

// Mock the components that might use window functions or are complex
vi.mock("@/components/DateRangePicker", () => ({
  DateRangePicker: () => <div data-testid="date-range-picker" />
}));

vi.mock("@/components/mobile-users/EditRecorderDialog", () => ({
  default: () => <div data-testid="edit-recorder-dialog" />
}));

vi.mock("@/components/tasks/EditTaskInfoDialog", () => ({
  default: () => <div data-testid="edit-task-info-dialog" />
}));

vi.mock("@/components/tasks/PrivacyAgreementDialog", () => ({
  default: () => <div data-testid="privacy-agreement-dialog" />
}));

vi.mock("@/components/tasks/TransferSubtaskDialog", () => ({
  default: () => <div data-testid="transfer-subtask-dialog" />
}));

// Mock react-router-dom to control isAgentMode via params
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe("SubtaskExecutionDetails Columns Logic", () => {
  it("should NOT show '任务条数' column", () => {
    (useParams as any).mockReturnValue({ taskId: "t1", agentId: "a1" });
    renderWithRouter(<SubtaskExecutionDetails />);
    expect(screen.queryByText("任务条数")).toBeNull();
  });

  it("should show '是否领取' column in Agent mode (original behavior)", () => {
    (useParams as any).mockReturnValue({ taskId: "t1", agentId: "a1" });
    renderWithRouter(<SubtaskExecutionDetails />);
    expect(screen.getByText("是否领取")).toBeInTheDocument();
  });

  it("should NOW show '是否领取' column in Non-Agent mode (new requirement)", () => {
    (useParams as any).mockReturnValue({ taskId: "t1", planId: "p1" });
    renderWithRouter(<SubtaskExecutionDetails />);
    // This will fail currently because of {isAgentMode && ...}
    expect(screen.getByText("是否领取")).toBeInTheDocument();
  });

  it("should show specific data for Agent wg-20251223-0804", () => {
    (useParams as any).mockReturnValue({ 
      taskId: "task-20260401-in-progress", 
      agentId: "wg-20251223-0804" 
    });
    renderWithRouter(<SubtaskExecutionDetails />);
    // This agent has 2 subtasks in mockData
    expect(screen.getByText("小张")).toBeInTheDocument();
    expect(screen.getByText("小李")).toBeInTheDocument();
  });

  it("should show different data for Agent lg-20260101-0901", () => {
    (useParams as any).mockReturnValue({ 
      taskId: "fsfefe-20251223-aa", 
      agentId: "lg-20260101-0901" 
    });
    renderWithRouter(<SubtaskExecutionDetails />);
    // This agent has 1 subtask with recorder '梅西'
    expect(screen.getByText("梅西")).toBeInTheDocument();
    expect(screen.queryByText("小张")).toBeNull();
  });

  it("should show correct data for Plan 1", () => {
    (useParams as any).mockReturnValue({ 
      taskId: "task-20260501-tuning", 
      planId: "1" 
    });
    renderWithRouter(<SubtaskExecutionDetails />);
    // Plan 1 has '张若昀'
    expect(screen.getByText("张若昀")).toBeInTheDocument();
    expect(screen.queryByText("梅西")).toBeNull();
  });
});
