import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TaskAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "agent" | "nonagent";
  onOpenPersonnel: () => void;
}

const AGENT_OPTIONS = ["王工", "李工", "张工"] as const;

const TaskAllocationDialog = ({
  open,
  onOpenChange,
  mode,
  onOpenPersonnel,
}: TaskAllocationDialogProps) => {
  const [agentName, setAgentName] = useState("");
  const [planName, setPlanName] = useState("");
  const [estimatedCopies, setEstimatedCopies] = useState("");
  const [estimatedPeople, setEstimatedPeople] = useState("");
  const [allocationText, setAllocationText] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setAgentName("");
      setPlanName("");
      setEstimatedCopies("");
      setEstimatedPeople("");
      setAllocationText("");
    }
  }, [open]);

  const handleCalculate = () => {
    const copies = Number(estimatedCopies);
    const people = Number(estimatedPeople);

    if (!copies || copies <= 0) {
      toast.error("请输入有效的预计录制份数");
      return;
    }
    if (!people || people <= 0) {
      toast.error("请输入有效的预计录制人数");
      return;
    }

    // totalTerms is a mock value derived from copies for demonstration
    const totalTerms = copies * 100;
    const perPerson = Math.ceil(totalTerms / people);
    setAllocationText(
      `录制人数${people}人，每人预计领取${perPerson}个词条，共计完成${totalTerms}词条，共计${copies}份`
    );
  };

  const handleConfirm = () => {
    if (mode === "agent" && !agentName) {
      toast.error("请选择代理名称");
      return;
    }
    if (mode === "nonagent" && !planName.trim()) {
      toast.error("请输入计划名称");
      return;
    }
    if (!estimatedCopies) {
      toast.error("请输入预计录制份数");
      return;
    }
    if (!estimatedPeople) {
      toast.error("请输入预计录制人数");
      return;
    }
    toast.success("分配成功");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "agent" ? "代理任务分配" : "非代理任务分配"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {mode === "agent" ? (
            <div className="space-y-2">
              <Label>代理名称</Label>
              <select
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">请选择</option>
                {AGENT_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>计划名称</Label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="请输入计划名称"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>预计录制份数</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={3}
                value={estimatedCopies}
                onChange={(e) => setEstimatedCopies(e.target.value)}
                placeholder="请输入"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                份，不超过3份
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>预计录制人数</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={estimatedPeople}
                onChange={(e) => setEstimatedPeople(e.target.value)}
                placeholder="请输入"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                人
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCalculate}>
              计算分配情况
            </Button>
            <Button variant="outline" onClick={onOpenPersonnel}>
              分配人员
            </Button>
          </div>

          {allocationText && (
            <div className="rounded-md bg-muted p-3 text-sm">
              {allocationText}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAllocationDialog;
