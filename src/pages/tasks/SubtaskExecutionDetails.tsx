import { useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, RotateCcw, RefreshCw, ChevronDown, ChevronUp, Undo2 } from "lucide-react";
import { toast } from "sonner";
import EditRecorderDialog from "@/components/mobile-users/EditRecorderDialog";
import EditTaskInfoDialog from "@/components/tasks/EditTaskInfoDialog";
import PrivacyAgreementDialog from "@/components/tasks/PrivacyAgreementDialog";
import TransferSubtaskDialog from "@/components/tasks/TransferSubtaskDialog";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { mockSubtaskExecutions, mockTasks, mockAgentRecovery, mockNonAgentRecovery } from "./mockData";
import { mockRecorders, mockMobileUsers } from "../mobile-users/mockData";
import { STORAGE_KEYS, getStorageData, setStorageData } from "@/utils/storage";
import type { SubtaskExecutionRecord } from "./types";
import type { RecorderRecord } from "../mobile-users/types";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/DateRangePicker";
import type { DateRange } from "react-day-picker";
import { isWithinInterval, parse, startOfDay, endOfDay } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SubtaskExecutionDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId, agentId, planId } = useParams<{ taskId: string; agentId?: string; planId?: string }>();
  const isAgentMode = !!agentId;

  // 数据状态（持久化）
  const [executionData, setExecutionData] = useState<SubtaskExecutionRecord[]>(() =>
    getStorageData(STORAGE_KEYS.SUBTASK_EXECUTIONS, mockSubtaskExecutions)
  );

  // Find current task info
  const currentTask = useMemo(() => {
    const allTasks = getStorageData(STORAGE_KEYS.TASKS, mockTasks);
    return allTasks.find(t => t.id === taskId);
  }, [taskId]);

  // Derive Display name for Agent or Plan
  const displayName = useMemo(() => {
    if (isAgentMode) {
      const allAgents = getStorageData(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery);
      const agent = allAgents.find(a => a.agentCode === agentId);
      return agent ? `${agent.agentName} (代理人 ID: ${agentId})` : `代理人 ID: ${agentId}`;
    } else {
      const allPlans = getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
      const plan = allPlans.find(p => p.planIndex.toString() === planId);
      return plan ? `${plan.planName} (计划 ID: ${planId})` : `计划 ID: ${planId}`;
    }
  }, [isAgentMode, agentId, planId]);

  // Filter states
  const [filterRecorderKeyword, setFilterRecorderKeyword] = useState("");
  const [filterSubtaskRemark, setFilterSubtaskRemark] = useState("");
  const [filterClaimStatus, setFilterClaimStatus] = useState<string>("all");
  const [filterRecoveryStatus, setFilterRecoveryStatus] = useState<string>("all");
  const [filterUpdateTime, setFilterUpdateTime] = useState<DateRange | undefined>(undefined);

  // Dialog states
  const [editTaskInfoOpen, setEditTaskInfoOpen] = useState(false);
  const [privacyAgreementOpen, setPrivacyAgreementOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [recoveryConfirmOpen, setRecoveryConfirmOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SubtaskExecutionRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState("");

  // Recorder Edit States
  const [recorderEditOpen, setRecorderEditOpen] = useState(false);
  const [editingRecorder, setEditingRecorder] = useState<RecorderRecord | null>(null);
  const [editingRecorderParentPhone, setEditingRecorderParentPhone] = useState("");

  // Helper to check if a subtask is automatically recovered (all terms passed)
  const isAutoRecovered = (record: SubtaskExecutionRecord) => {
    if (record.recoveryStatus === "已回收") return true;
    if (record.passedTerms === "-") return false;
    const [passed, total] = record.passedTerms.split("/").map(n => parseInt(n));
    const totalCount = record.endIndex - record.startIndex + 1;
    return !isNaN(passed) && passed === totalCount;
  };

  // Filtering logic
  const filteredRecords = executionData.filter((record) => {
    if (filterRecorderKeyword) {
      const keyword = filterRecorderKeyword.toLowerCase();
      const nameMatch = record.recorderName.toLowerCase().includes(keyword);
      const idMatch = record.recorderId.toLowerCase().includes(keyword);
      if (!nameMatch && !idMatch) return false;
    }
    if (filterSubtaskRemark && !record.subtaskRemark.toLowerCase().includes(filterSubtaskRemark.toLowerCase())) return false;
    if (filterClaimStatus !== "all" && record.claimStatus !== filterClaimStatus) return false;
    if (filterRecoveryStatus !== "all" && record.recoveryStatus !== filterRecoveryStatus) return false;
    
    if (filterUpdateTime?.from && filterUpdateTime?.to) {
      const recordDate = parse(record.updateTime, "yyyy/MM/dd HH:mm:ss", new Date());
      if (!isWithinInterval(recordDate, {
        start: startOfDay(filterUpdateTime.from),
        end: endOfDay(filterUpdateTime.to)
      })) return false;
    }
    return true;
  });

  // Summary calculations
  const { totalTaskCount, totalPassedCount, totalUploadedCount, genderStats, progressPercent, totalSets, collectedSets } = useMemo(() => {
    const total = filteredRecords.reduce((sum, r) => sum + (r.endIndex - r.startIndex + 1), 0);
    const passed = filteredRecords.reduce((sum, r) => {
      const val = parseInt(r.passedTerms.split("/")[0]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const uploaded = filteredRecords.reduce((sum, r) => {
      const val = parseInt(r.uploadedAudioCount.split("/")[0]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const gender = filteredRecords.reduce((acc, curr) => {
      if (curr.gender === "男") acc.m++;
      if (curr.gender === "女") acc.f++;
      return acc;
    }, { m: 0, f: 0 });
    const tSets = filteredRecords.length;
    const cSets = filteredRecords.filter(r => isAutoRecovered(r)).length;
    const percent = total > 0 ? ((passed / total) * 100).toFixed(2) : "0.00";
    
    return { 
      totalTaskCount: total, 
      totalPassedCount: passed, 
      totalUploadedCount: uploaded, 
      genderStats: gender, 
      progressPercent: percent, 
      totalSets: tSets, 
      collectedSets: cSets 
    };
  }, [filteredRecords]);

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReset = () => {
    setFilterRecorderKeyword("");
    setFilterSubtaskRemark("");
    setFilterClaimStatus("all");
    setFilterRecoveryStatus("all");
    setFilterUpdateTime(undefined);
    setCurrentPage(1);
  };

  const handleQuery = () => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedRecords.map((r) => r.subtaskId);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.has(r.subtaskId));

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage("");
    } else {
      toast.error(`请输入 1 到 ${totalPages} 之间的有效页码`);
    }
  };

  const handleEditTaskInfo = (record: SubtaskExecutionRecord) => {
    setSelectedRecord(record);
    setEditTaskInfoOpen(true);
  };

  const handlePreviewAgreement = (record: SubtaskExecutionRecord) => {
    setSelectedRecord(record);
    setPrivacyAgreementOpen(true);
  };

  const handleOpenRecovery = (record: SubtaskExecutionRecord) => {
    setSelectedRecord(record);
    setRecoveryConfirmOpen(true);
  };

  const confirmRecovery = () => {
    if (selectedRecord) {
      const updatedData = executionData.map(r =>
        r.subtaskId === selectedRecord.subtaskId ? { ...r, recoveryStatus: "已回收" } as SubtaskExecutionRecord : r
      );
      setExecutionData(updatedData);
      setStorageData(STORAGE_KEYS.SUBTASK_EXECUTIONS, updatedData);
      toast.success(`子任务 ${selectedRecord.subtaskId} 回收成功`);

      // Check if all subtasks are recovered to update parent status and metrics
      const allRecoveredData = updatedData.filter(r => isAutoRecovered(r));
      const currentPassedTermsSum = updatedData.reduce((sum, r) => sum + (parseInt(r.passedTerms.split("/")[0]) || 0), 0);
      const currentUploadedTermsSum = updatedData.reduce((sum, r) => sum + (parseInt(r.uploadedAudioCount.split("/")[0]) || 0), 0);
      const currentGenderM = updatedData.filter(r => r.gender === "男").length;
      const currentGenderF = updatedData.filter(r => r.gender === "女").length;

      if (isAgentMode && agentId) {
        const agents = getStorageData(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery);
        const updatedAgents = agents.map(a => 
          a.agentCode === agentId ? { 
            ...a, 
            status: updatedData.every(r => isAutoRecovered(r)) ? "已完成" : a.status,
            collectedAudioCount: allRecoveredData.length,
            collectedAudioTerms: currentUploadedTermsSum,
            completedAcceptanceTerms: currentPassedTermsSum.toString(),
            genderRatio: `${currentGenderM}：${currentGenderF}`
          } : a
        );
        setStorageData(STORAGE_KEYS.AGENT_RECOVERY, updatedAgents);
        if (updatedData.every(r => isAutoRecovered(r))) {
          toast.info(`代理人「${displayName.split(" (")[0]}」的所有子任务已回收，状态自动更新为“已完成”`);
        }
      } else if (!isAgentMode && planId) {
        const plans = getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
        const updatedPlans = plans.map(p => 
          p.planIndex.toString() === planId ? { 
            ...p, 
            status: updatedData.every(r => isAutoRecovered(r)) ? "已完成" : p.status,
            collectedAudioCount: allRecoveredData.length,
            collectedAudioTerms: currentUploadedTermsSum,
            completedAcceptanceTerms: currentPassedTermsSum.toString(),
            genderRatio: `${currentGenderM}：${currentGenderF}`
          } : p
        );
        setStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, updatedPlans);
        if (updatedData.every(r => isAutoRecovered(r))) {
          toast.info(`任务分配计划「${displayName.split(" (")[0]}」的所有子任务已回收，状态自动更新为“已完成”`);
        }
      }
      
      setRecoveryConfirmOpen(false);
    }
  };

  const handleSaveTaskInfo = (remark: string) => {
    if (selectedRecord) {
      // Single sync
      const updatedData = executionData.map(r =>
        r.subtaskId === selectedRecord.subtaskId ? { ...r, subtaskRemark: remark, taskRemark: remark } : r
      );
      setExecutionData(updatedData);
      setStorageData(STORAGE_KEYS.SUBTASK_EXECUTIONS, updatedData);
      toast.success("备注保存成功");
    } else if (selectedIds.size > 0) {
      // Batch sync
      const updatedData = executionData.map(r =>
        selectedIds.has(r.subtaskId) ? { ...r, subtaskRemark: remark, taskRemark: remark } : r
      );
      setExecutionData(updatedData);
      setStorageData(STORAGE_KEYS.SUBTASK_EXECUTIONS, updatedData);
      toast.success(`成功为 ${selectedIds.size} 条记录添加备注`);
      setSelectedIds(new Set());
    }
  };

  const handleTransferConfirm = (newRecorderId: string, newRecorderName: string) => {
    if (selectedRecord) {
      const oldRecorderId = selectedRecord.recorderId;
      
      // 1. Update Subtask data
      const updatedData = executionData.map(r =>
        r.subtaskId === selectedRecord.subtaskId 
          ? { ...r, recorderId: newRecorderId, recorderName: newRecorderName, updateTime: format(new Date(), "yyyy/MM/dd HH:mm:ss") } 
          : r
      );
      setExecutionData(updatedData);
      setStorageData(STORAGE_KEYS.SUBTASK_EXECUTIONS, updatedData);

      // 2. Sync with parent Recovery record (Agent/Plan)
      // Check if old recorder still has any subtasks in this specific context
      const stillHasTasks = updatedData.some(r => r.recorderId === oldRecorderId);
      
      if (isAgentMode && agentId) {
        const agents = getStorageData(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery);
        const updatedAgents = agents.map(a => {
          if (a.agentCode === agentId) {
            let nextIds = [...(a.selectedPersonIds || [])];
            // Remove old if no more tasks
            if (!stillHasTasks) {
              nextIds = nextIds.filter(id => id !== oldRecorderId);
            }
            // Add new if not already there
            if (!nextIds.includes(newRecorderId)) {
              nextIds.push(newRecorderId);
            }
            return { ...a, selectedPersonIds: nextIds };
          }
          return a;
        });
        setStorageData(STORAGE_KEYS.AGENT_RECOVERY, updatedAgents);
      } else if (!isAgentMode && planId) {
        const plans = getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
        const updatedPlans = plans.map(p => {
          if (p.planIndex.toString() === planId) {
            let nextIds = [...(p.selectedPersonIds || [])];
            if (!stillHasTasks) {
              nextIds = nextIds.filter(id => id !== oldRecorderId);
            }
            if (!nextIds.includes(newRecorderId)) {
              nextIds.push(newRecorderId);
            }
            return { ...p, selectedPersonIds: nextIds };
          }
          return p;
        });
        setStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, updatedPlans);
      }

      toast.success(`子任务已成功转派给 ${newRecorderName}，并已同步更新分配名单`);
    }
  };

  const handleRecorderClick = (record: SubtaskExecutionRecord) => {
    if (record.recorderId === "-") return;
    
    // Find the actual recorder record from storage/mock
    const allRecorders = getStorageData(STORAGE_KEYS.RECORDERS, mockRecorders);
    const recorderData = allRecorders.find(r => r.id === record.recorderId);
    
    if (recorderData) {
      setEditingRecorder(recorderData);
      
      // Find parent user phone
      const allUsers = getStorageData(STORAGE_KEYS.MOBILE_USERS, mockMobileUsers);
      const parentUser = allUsers.find(u => u.id === recorderData.userId);
      setEditingRecorderParentPhone(parentUser?.loginPhone || "-");
      
      setRecorderEditOpen(true);
    } else {
      toast.error("未找到该录音人的完整档案信息");
    }
  };

  const handleSaveRecorderInfo = (data: {
    nickname: string;
    gender: string;
    contact: string;
    age: number;
    growthLocation: string;
  }) => {
    if (!editingRecorder) return;
    
    // 1. Update RECORDERS storage
    const allRecorders = getStorageData(STORAGE_KEYS.RECORDERS, mockRecorders);
    const updatedRecorders = allRecorders.map(r => 
      r.id === editingRecorder.id ? { ...r, ...data } : r
    );
    setStorageData(STORAGE_KEYS.RECORDERS, updatedRecorders);
    
    // 2. Update SUBTASK_EXECUTIONS storage (Sync nickname)
    const updatedExecutions = executionData.map(r => 
      r.recorderId === editingRecorder.id ? { ...r, recorderName: data.nickname, gender: data.gender as "男" | "女" | "-" } : r
    );
    setExecutionData(updatedExecutions);
    setStorageData(STORAGE_KEYS.SUBTASK_EXECUTIONS, updatedExecutions);
    
    toast.success("录音人信息已同步更新");
  };

  const renderStatus = (status: string, type: "claim" | "recovery") => {
    let dotColor = "bg-gray-400";
    if (type === "claim") {
      dotColor = status === "已领取" ? "bg-blue-500" : "bg-gray-400";
    } else {
      dotColor = status === "已回收" ? "bg-green-500" : "bg-orange-500";
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
        {status}
      </span>
    );
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 animate-fade-in px-4 pb-8">
      {/* Breadcrumb */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b border-border/50 -mx-4 px-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <button className="hover:text-foreground transition-colors" onClick={() => navigate("/dashboard/tasks")}>任务管理</button>
          <span>/</span>
          <button className="hover:text-foreground transition-colors" onClick={() => navigate(`/dashboard/tasks/${taskId}/recovery`)}>任务分配详情</button>
          <span>/</span>
          <span className="text-foreground font-medium">子任务执行详情</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">子任务执行详情</h1>
          <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               size="sm" 
               className="h-9 gap-1.5"
               disabled={selectedIds.size === 0}
               onClick={() => {
                 setSelectedRecord(null);
                 setEditTaskInfoOpen(true);
               }}
             >
               批量添加备注
               {selectedIds.size > 0 && (
                 <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 ml-0.5">
                   {selectedIds.size}
                 </span>
               )}
             </Button>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card/50 border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">任务 ID</p>
          <p className="text-lg font-bold text-foreground">{taskId}</p>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{isAgentMode ? "关联代理人" : "关联分配计划"}</p>
          <p className="text-lg font-bold text-foreground truncate" title={displayName}>{displayName}</p>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">预计录制音频份数</p>
          <p className="text-lg font-bold text-foreground">{totalSets} 份</p>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">已收集音频份数</p>
          <p className="text-lg font-bold text-foreground">{collectedSets} 份</p>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">预计录制音频条数</p>
          <p className="text-lg font-bold text-foreground">{totalTaskCount} 条</p>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">已收集音频条数</p>
          <p className="text-lg font-bold text-foreground">{totalUploadedCount} 条</p>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">男女比例</p>
          <p className="text-lg font-bold text-foreground">{genderStats.m}:{genderStats.f}</p>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">已完成验收条数</p>
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-foreground">{totalPassedCount}/{totalTaskCount}</p>
            <span className="text-xs text-green-500 font-medium mb-1">({progressPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm transition-all duration-300">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center w-48">
            <Input
              value={filterRecorderKeyword}
              onChange={(e) => setFilterRecorderKeyword(e.target.value)}
              placeholder="录音人姓名、ID..."
              className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-all"
            />
          </div>

          <div className="flex items-center w-48">
            <Input
              value={filterSubtaskRemark}
              onChange={(e) => setFilterSubtaskRemark(e.target.value)}
              placeholder="子任务备注..."
              className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-all"
            />
          </div>

          {isAgentMode && (
            <div className="flex items-center">
              <select
                value={filterClaimStatus}
                onChange={(e) => setFilterClaimStatus(e.target.value)}
                className="flex h-10 w-32 rounded-md border border-border/60 bg-muted/30 px-3 py-1 text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
              >
                <option value="all">全部领取状态</option>
                <option value="已领取">已领取</option>
                <option value="未领取">未领取</option>
              </select>
            </div>
          )}

          <div className="flex items-center">
            <select
              value={filterRecoveryStatus}
              onChange={(e) => setFilterRecoveryStatus(e.target.value)}
              className="flex h-10 w-32 rounded-md border border-border/60 bg-muted/30 px-3 py-1 text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
            >
              <option value="all">全部回收状态</option>
              <option value="已回收">已回收</option>
              <option value="未回收">未回收</option>
            </select>
          </div>

          <div className="flex items-center">
            <DateRangePicker
              dateRange={filterUpdateTime}
              onSelect={setFilterUpdateTime}
              className="w-44"
            />
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" onClick={handleQuery} className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md active:scale-95 transition-all">
              <Search className="h-4 w-4 mr-2" /> 查询
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-5 gap-2 border-border/60 text-foreground hover:bg-muted font-medium">
              <RotateCcw className="h-4 w-4" /> 重置
            </Button>
            <button
              className="h-10 w-10 flex items-center justify-center border border-border/60 rounded-lg hover:bg-muted transition-colors"
              title="刷新数据"
              onClick={() => { toast.success("数据已重载"); handleReset(); }}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group/table">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
          <table className="w-full text-left border-collapse min-w-[2000px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border/60">
                <th className="px-5 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="accent-primary w-4 h-4 rounded cursor-pointer transition-all"
                    checked={isAllSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">子任务ID</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">当前录音人</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">录音人 ID</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">发音人性别</th>
                {isAgentMode && <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">领取状态</th>}
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">回收状态</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">任务条数</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">已上传音频</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">验收通过</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center text-ellipsis overflow-hidden">子任务备注</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">起始序号</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">结束序号</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">创建时间</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">更新时间</th>
                <th className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest sticky right-0 bg-muted/95 backdrop-blur-sm z-20 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] border-l border-border/40">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <Undo2 className="h-10 w-10 mb-2" />
                      <p className="text-sm font-medium">暂无匹配的子任务记录</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.subtaskId} className={`group/row transition-colors hover:bg-muted/20 ${selectedIds.has(record.subtaskId) ? "bg-primary/5 shadow-inner" : ""}`}>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        className="accent-primary w-4 h-4 rounded cursor-pointer"
                        checked={selectedIds.has(record.subtaskId)}
                        onChange={() => toggleRow(record.subtaskId)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground truncate max-w-[150px] text-center" title={record.subtaskId}>{record.subtaskId}</td>
                    <td 
                      className={`px-4 py-3 text-sm font-medium text-center transition-colors ${record.recorderName === "-" ? "text-muted-foreground/50" : "text-primary hover:text-primary/70 cursor-pointer hover:underline underline-offset-4 decoration-primary/30"}`}
                      onClick={() => handleRecorderClick(record)}
                    >
                      {record.recorderName}
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono text-xs text-center ${record.recorderId === "-" ? "text-muted-foreground/30" : "text-muted-foreground"}`}>{record.recorderId}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-center">{record.gender}</td>
                    {isAgentMode && <td className="px-4 py-3 text-center">{renderStatus(record.claimStatus, "claim")}</td>}
                    <td className="px-4 py-3 text-center">{renderStatus(isAutoRecovered(record) ? "已回收" : record.recoveryStatus, "recovery")}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-center">{record.endIndex - record.startIndex + 1}</td>
                    <td className={`px-4 py-3 text-sm font-medium text-center ${record.uploadedAudioCount === "-" ? "text-muted-foreground/50" : "text-foreground"}`}>{record.uploadedAudioCount}</td>
                    <td className={`px-4 py-3 text-sm font-medium text-center ${record.passedTerms === "-" ? "text-muted-foreground/50" : "text-green-600"}`}>{record.passedTerms}</td>
                    <td className={`px-4 py-3 text-sm truncate max-w-[120px] text-center ${record.subtaskRemark === "-" ? "text-muted-foreground/50" : "text-foreground/70"}`} title={record.subtaskRemark}>{record.subtaskRemark}</td>
                    <td className="px-4 py-3 text-sm text-foreground/80 text-center">{record.startIndex}</td>
                    <td className="px-4 py-3 text-sm text-foreground/80 text-center">{record.endIndex}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs text-center">{record.createTime}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs text-center">{record.updateTime}</td>
                    <td className="px-4 py-3 sticky right-0 bg-background/95 backdrop-blur-sm z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] border-l border-border/40 group-hover/row:bg-muted/80 transition-all duration-300">
                      <div className="flex items-center">
                        <button 
                          className="text-primary hover:text-primary/80 text-xs mr-4 transition-colors font-medium whitespace-nowrap"
                          onClick={() => navigate(`/dashboard/tasks/${taskId}/recovery/${agentId || planId}/execution/${encodeURIComponent(record.recorderId)}/audio`)}
                        >
                          音频详情
                        </button>
                        <button 
                          className="text-primary hover:text-primary/80 text-xs mr-4 transition-colors font-medium whitespace-nowrap"
                          onClick={() => handleEditTaskInfo(record)}
                        >
                          添加备注
                        </button>
                        {((isAgentMode && record.claimStatus !== "未领取") || (!isAgentMode && record.recorderName !== "-")) && (
                          <button 
                            className="text-primary hover:text-primary/80 text-xs mr-4 transition-colors font-medium whitespace-nowrap"
                            onClick={() => handlePreviewAgreement(record)}
                          >
                            预览协议
                          </button>
                        )}
                        {!isAutoRecovered(record) && (isAgentMode ? record.claimStatus !== "未领取" : true) && (
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-primary hover:text-primary/80 text-xs transition-colors font-medium whitespace-nowrap"
                              onClick={() => {
                                setSelectedRecord(record);
                                setTransferOpen(true);
                              }}
                            >
                               转派
                            </button>
                            <button 
                              className="text-destructive hover:text-destructive/80 text-xs transition-colors font-medium whitespace-nowrap"
                              onClick={() => handleOpenRecovery(record)}
                            >
                               回收
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground pb-10">
        <span>共 {totalCount} 条</span>
        <select
          className="h-7 px-2 text-xs border border-border rounded bg-background cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          value={pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        >
          {[10, 20, 50, 100].map(size => (
            <option key={size} value={size}>{size}条/页</option>
          ))}
        </select>
        
        <div className="flex items-center gap-0.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 flex items-center justify-center border border-border rounded text-xs hover:bg-accent disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          
          {getPageNumbers().map((p, idx) =>
            p === "ellipsis" ? (
              <span key={`e-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs cursor-pointer ${
                  currentPage === p
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-accent"
                }`}
              >
                {p}
              </button>
            )
          )}
          
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-7 h-7 flex items-center justify-center border border-border rounded text-xs hover:bg-accent disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span>前往</span>
          <input
            className="w-10 h-7 px-1 text-center border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
          />
          <span>页</span>
        </div>
      </div>

      {/* Dialogs */}
      <EditRecorderDialog
        open={recorderEditOpen}
        onOpenChange={setRecorderEditOpen}
        mode="edit"
        loginPhone={editingRecorderParentPhone}
        recorder={editingRecorder ? {
          nickname: editingRecorder.nickname,
          gender: editingRecorder.gender,
          contact: editingRecorder.contact,
          age: editingRecorder.age,
          growthLocation: editingRecorder.growthLocation,
          createTime: editingRecorder.createTime,
          isSyncRecorder: editingRecorder.isSyncRecorder
        } : null}
        onSave={handleSaveRecorderInfo}
      />

      <EditTaskInfoDialog
        open={editTaskInfoOpen}
        onOpenChange={setEditTaskInfoOpen}
        currentRemark={selectedRecord?.subtaskRemark || ""}
        onSave={handleSaveTaskInfo}
      />

      <TransferSubtaskDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        subtaskId={selectedRecord?.subtaskId || ""}
        currentRecorderName={selectedRecord?.recorderName || ""}
        currentRecorderId={selectedRecord?.recorderId || ""}
        onConfirm={handleTransferConfirm}
      />

      <PrivacyAgreementDialog
        open={privacyAgreementOpen}
        onOpenChange={setPrivacyAgreementOpen}
        recorderName={selectedRecord?.recorderName || ""}
        signDate={selectedRecord?.createTime || ""}
      />

      {/* Recovery confirm */}
      <AlertDialog open={recoveryConfirmOpen} onOpenChange={setRecoveryConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">确认回收子任务？</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground/80 pt-2">
              确认回收子任务 <span className="font-bold text-foreground">#{selectedRecord?.subtaskId}</span> 后，该内容将立即归档且不可更改。全部子任务回收完成后，该分发计划将标记为已完成。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="rounded-xl border-border/60">取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRecovery} className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold">确认回收</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubtaskExecutionDetails;
