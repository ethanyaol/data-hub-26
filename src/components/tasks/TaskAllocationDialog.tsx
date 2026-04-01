import { useState, useEffect, useMemo } from "react";
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
import { format } from "date-fns";

import { mockTasks, mockAgentRecovery, mockNonAgentRecovery } from "@/pages/tasks/mockData";
import { STORAGE_KEYS, getStorageData, setStorageData } from "@/utils/storage";
import type { AgentRecoveryRecord, NonAgentRecoveryRecord } from "@/pages/tasks/types";
import PersonnelAssignDialog from "./PersonnelAssignDialog";

interface TaskAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "agent" | "nonagent";
  onSuccess?: () => void;
  editingRecord?: AgentRecoveryRecord | NonAgentRecoveryRecord | null;
  taskId?: string;
}

const AGENT_OPTIONS = ["王工", "李工", "张工"] as const;

const TaskAllocationDialog = ({
  open,
  onOpenChange,
  mode,
  onSuccess,
  editingRecord,
  taskId,
}: TaskAllocationDialogProps) => {
  const [agentName, setAgentName] = useState("");
  const [planName, setPlanName] = useState("");
  const [estimatedCopies, setEstimatedCopies] = useState("");
  const [estimatedPeople, setEstimatedPeople] = useState("");
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [allocationText, setAllocationText] = useState("");
  const [personnelDialogOpen, setPersonnelDialogOpen] = useState(false);

  const isEditMode = !!editingRecord;

  // Calculate Capacity Constraints
  const { maxAvailable, claimedCount } = useMemo(() => {
    // 1. Claimed count (minimum bound for edit mode)
    // NOTE: In mock, we simplify this. In real app, we'd filter subtasks by agent/plan
    const claimedIdxCount = 0; 

    // 2. Task capacity (maximum bound)
    const allTasks = getStorageData(STORAGE_KEYS.TASKS, mockTasks);
    const currentTask = allTasks.find(t => t.id === taskId);
    const taskTotal = currentTask?.estimatedCount || 0;
    
    const agents = getStorageData(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery);
    const plans = getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
    
    // Sum of all allocations FOR THIS TASK
    const filteredAgents = agents.filter(a => a.taskId === taskId);
    const filteredPlans = plans.filter(p => p.taskId === taskId);

    // Sum of other agents (exclude current if editing)
    const otherAgentsAllocated = filteredAgents
      .filter(a => !(mode === "agent" && isEditMode && (editingRecord as AgentRecoveryRecord)?.agentCode === a.agentCode))
      .reduce((sum, a) => sum + a.estimatedAudioCount, 0);

    // Sum of other plans (exclude current if editing)
    const otherPlansAllocated = filteredPlans
      .filter(p => !(mode === "nonagent" && isEditMode && (editingRecord as NonAgentRecoveryRecord)?.planIndex === p.planIndex))
      .reduce((sum, p) => sum + p.estimatedAudioCount, 0);
    
    const remaining = Math.max(0, taskTotal - otherAgentsAllocated - otherPlansAllocated);
    
    return { 
      maxAvailable: remaining, 
      claimedCount: isEditMode ? claimedIdxCount : 0 
    };
  }, [taskId, isEditMode, editingRecord, open, mode]);

  // Reset or populate form when dialog opens
  useEffect(() => {
    if (open) {
      if (isEditMode && editingRecord) {
        setAgentName((editingRecord as AgentRecoveryRecord).agentName || "");
        setPlanName((editingRecord as NonAgentRecoveryRecord).planName || "");
        setEstimatedCopies(editingRecord.estimatedAudioCount.toString());
        setSelectedPersonIds(editingRecord.selectedPersonIds || []);
      } else {
        setAgentName("");
        setPlanName("");
        setEstimatedCopies("");
        setSelectedPersonIds([]);
        setAllocationText("");
      }
    }
  }, [open, isEditMode, editingRecord]);

  // Real-time calculation logic
  useEffect(() => {
    const allTasks = getStorageData(STORAGE_KEYS.TASKS, mockTasks);
    const currentTask = allTasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const copies = Number(estimatedCopies);
    const peopleCount = mode === "agent" ? copies : selectedPersonIds.length;

    if (copies > 0 && peopleCount > 0) {
      // Logic for x (terms per person)
      const isWhole = currentTask.recordingType.includes("整份");
      // Provide defaults if fields are missing in localStorage/mock
      const x = isWhole ? (currentTask.totalTerms || 100) : (currentTask.termsPerPerson || 50);
      
      // Logic for y (total completed terms)
      const y = peopleCount * x;

      const isRemainderIssue = !isWhole && currentTask.totalTerms && (currentTask.totalTerms % (currentTask.termsPerPerson || 1) !== 0);

      const text = mode === "agent" 
        ? `该代理预计录制 ${copies} 份，共计完成 ${y} 词条 (按每份 ${x} 词条测算)`
        : `预计录制人数 ${peopleCount} 人，每人预计领取 ${x} 个词条，共计完成 ${y} 词条，共计 ${copies} 份`;

      setAllocationText(
        `${text}${isRemainderIssue ? "（注：最后一名采集人领取的条数可能小于最大可领取条数）" : ""}`
      );
    } else {
      setAllocationText("");
    }
  }, [estimatedCopies, selectedPersonIds, taskId]);

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
    
    const copies = Number(estimatedCopies);

    // Business Logic for Capacity Validation
    if (copies > maxAvailable) {
      toast.error(`分配失败：份数 (${copies}) 超过了任务的剩余可分配份数 (${maxAvailable} 份)`);
      return;
    }

    if (mode === "nonagent" && selectedPersonIds.length > copies) {
      toast.error(`分配失败：已选人数 (${selectedPersonIds.length}) 不能超过预估份数 (${copies})`);
      return;
    }

    if (isEditMode && editingRecord) {
      if (copies < claimedCount) {
        toast.error(`修改失败：目标份数 (${copies}) 不能小于当前已领取份数 (${claimedCount})`);
        return;
      }

      if (mode === "agent") {
        const agents = getStorageData(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery);
        const updatedAgents = agents.map(a => 
          (a.agentCode === (editingRecord as AgentRecoveryRecord).agentCode && a.taskId === taskId)
            ? { ...a, estimatedAudioCount: copies, estimatedAudioTerms: copies * 100, selectedPersonIds: selectedPersonIds } 
            : a
        );
        setStorageData(STORAGE_KEYS.AGENT_RECOVERY, updatedAgents);
        toast.success("任务分配修改成功");
      } else {
        const plans = getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
        const updatedPlans = plans.map(p => 
          (p.planIndex === (editingRecord as NonAgentRecoveryRecord).planIndex && p.taskId === taskId)
            ? { ...p, estimatedAudioCount: copies, estimatedAudioTerms: copies * 100, selectedPersonIds: selectedPersonIds } 
            : p
        );
        setStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, updatedPlans);
        toast.success("计划分配修改成功");
      }
      onSuccess?.();
    } else {
      const copies = Number(estimatedCopies);
      const currentTime = format(new Date(), "yyyy/MM/dd HH:mm:ss");

      if (mode === "agent") {
        if (!agentName) { toast.error("请选择代理"); return; }
        
        const agents = getStorageData(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery);
        const newAgent: AgentRecoveryRecord = {
          taskId: taskId,
          agentName: agentName,
          agentCode: `AG-${Date.now()}`,
          collectionCode: `COL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          estimatedAudioCount: copies,
          collectedAudioCount: 0,
          estimatedAudioTerms: copies * 100, // Based on average metrics
          collectedAudioTerms: 0,
          genderRatio: "0：0",
          completedAcceptanceTerms: "0",
          status: "进行中",
          createTime: currentTime,
          selectedPersonIds: selectedPersonIds,
        };

        setStorageData(STORAGE_KEYS.AGENT_RECOVERY, [newAgent, ...agents]);
        toast.success("代理任务分配成功");
      } else {
        if (!planName.trim()) { toast.error("请输入计划名称"); return; }
        
        const plans = getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
        const maxIndex = plans.reduce((max, p) => Math.max(max, p.planIndex || 0), 0);
        
        const newPlan: NonAgentRecoveryRecord = {
          taskId: taskId,
          planIndex: maxIndex + 1,
          planName: planName,
          estimatedAudioCount: copies,
          collectedAudioCount: 0,
          estimatedAudioTerms: copies * 100,
          collectedAudioTerms: 0,
          genderRatio: "0：0",
          completedAcceptanceTerms: "0",
          createTime: currentTime,
          status: "进行中",
          selectedPersonIds: selectedPersonIds,
        };

        setStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, [newPlan, ...plans]);
        toast.success("计划任务分配成功");
      }
      onSuccess?.();
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "修改任务分配" : (mode === "agent" ? "代理任务分配" : "非代理任务分配")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {mode === "agent" ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">代理名称</Label>
              {isEditMode ? (
                <div className="flex h-10 w-full items-center px-3 text-sm text-muted-foreground bg-muted/60 rounded-md border border-input">
                  {agentName}
                </div>
              ) : (
                <select
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">请选择</option>
                  {AGENT_OPTIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-medium">计划名称</Label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="请输入计划名称"
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">预计录制份数</Label>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                不超过 {maxAvailable} 份
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={estimatedCopies}
                onChange={(e) => setEstimatedCopies(e.target.value)}
                placeholder="请输入"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground font-medium">份</span>
            </div>
          </div>

          {!isEditMode && (
            <>
            {mode !== "agent" && (
              <div className="flex items-center justify-between py-1 bg-slate-50 px-3 rounded-md border border-dashed border-slate-200">
                <span className="text-sm text-slate-500">已分配发音人</span>
                <span className="text-sm font-semibold text-primary">
                  {selectedPersonIds.length} 人
                </span>
              </div>
            )}
    
            <div className="flex items-center gap-2 pt-1">
              {mode !== "agent" ? (
                <Button variant="outline" size="sm" onClick={() => setPersonnelDialogOpen(true)} className="h-9 gap-1.5 h-9 font-normal">
                  选择人员
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium border border-blue-100">
                  <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mr-1.5" />
                  参与人数由代理线下自行统筹
                </div>
              )}
              {mode === "nonagent" && selectedPersonIds.length > 0 && (
                  <span className="text-[11px] text-muted-foreground animate-in fade-in slide-in-from-left-2 transition-all">
                    已选数量：{selectedPersonIds.length}/{estimatedCopies || "-"}
                  </span>
                )}
              </div>
            </>
          )}

          {allocationText && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3.5 mt-2 animate-fade-in">
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                {allocationText}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9">
            取消
          </Button>
          <Button onClick={handleConfirm} className="h-9 bg-blue-600 hover:bg-blue-700">
            确认
          </Button>
        </DialogFooter>
      </DialogContent>

      <PersonnelAssignDialog
        open={personnelDialogOpen}
        onOpenChange={setPersonnelDialogOpen}
        requiredCount={mode === "agent" ? Number(estimatedPeople) : undefined}
        maxCount={mode === "nonagent" ? Number(estimatedCopies) : undefined}
        initialSelectedIds={selectedPersonIds}
        lockedIds={isEditMode ? (editingRecord.selectedPersonIds || []) : []}
        onConfirm={(ids) => {
          setSelectedPersonIds(ids);
          toast.success(`成功分配 ${ids.length} 位人员`);
        }}
      />
    </Dialog>
  );
};

export default TaskAllocationDialog;
