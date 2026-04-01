import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { mockNonAgentRecovery } from "./mockData";
import type { NonAgentRecoveryRecord } from "./types";
import { STORAGE_KEYS, getStorageData, setStorageData } from "@/utils/storage";
import TaskAllocationDialog from "@/components/tasks/TaskAllocationDialog";
import PersonnelAssignDialog from "@/components/tasks/PersonnelAssignDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 10;

const TaskRecoveryNonAgent = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();

  // 数据状态（持久化）
  const [planRecords, setPlanRecords] = useState<NonAgentRecoveryRecord[]>(() => {
    const allRecords = getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
    // 过滤属于当前任务的分配记录
    return allRecords.filter(r => r.taskId === taskId);
  });

  // Filter states
  const [filterPlanName, setFilterPlanName] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCreateTime, setFilterCreateTime] = useState("");

  // Dialog states
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [endTaskConfirmOpen, setEndTaskConfirmOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NonAgentRecoveryRecord | null>(null);
  const [recordToEnd, setRecordToEnd] = useState<NonAgentRecoveryRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState("");

  // Statistics calculation
  const summaries = useMemo(() => {
    return planRecords.reduce((acc, curr) => {
      acc.totalEstCount += curr.estimatedAudioCount;
      acc.totalCollCount += curr.collectedAudioCount;
      acc.totalAccTerms += parseInt(curr.completedAcceptanceTerms) || 0;
      
      const [m, f] = curr.genderRatio.split(/[：:]/).map(v => parseInt(v) || 0);
      acc.totalGenderM += m;
      acc.totalGenderF += f;
      
      return acc;
    }, { totalEstCount: 0, totalCollCount: 0, totalAccTerms: 0, totalGenderM: 0, totalGenderF: 0 });
  }, [planRecords]);

  // Filtering logic
  const filteredRecords = planRecords.filter((record) => {
    if (filterPlanName && !record.planName.includes(filterPlanName)) return false;
    if (filterStatus !== "all" && record.status !== filterStatus) return false;
    if (filterCreateTime && !record.createTime.includes(filterCreateTime)) return false;
    return true;
  });

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReset = () => {
    setFilterPlanName("");
    setFilterStatus("all");
    setFilterCreateTime("");
    setCurrentPage(1);
  };

  const handleQuery = () => {
    setCurrentPage(1);
  };

  const renderStatus = (status: NonAgentRecoveryRecord["status"]) => {
    const dotColor = status === "已完成" ? "bg-green-500" : "bg-orange-500";
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
        {status}
      </span>
    );
  };

  const handleAllocationConfirm = () => {
    setAllocationDialogOpen(false);
    toast.success("任务分配成功");
  };

  const handleEditAllocation = (record: NonAgentRecoveryRecord) => {
    setEditingRecord(record);
    setAllocationDialogOpen(true);
  };

  const handleNewAllocation = () => {
    setEditingRecord(null);
    setAllocationDialogOpen(true);
  };

  const handleEndTask = (record: NonAgentRecoveryRecord) => {
    setRecordToEnd(record);
    setEndTaskConfirmOpen(true);
  };

  const confirmEndTask = () => {
    if (recordToEnd) {
      const updatedRecords = planRecords.map(r => 
        r.planIndex === recordToEnd.planIndex ? { ...r, status: "已完成" as const } : r
      );
      setPlanRecords(updatedRecords);
      setStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, updatedRecords);
      
      toast.success(`计划「${recordToEnd.planName}」的任务已标记为完成`);
      setEndTaskConfirmOpen(false);
      setRecordToEnd(null);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage("");
    } else {
      toast.error(`请输入 1 到 ${totalPages} 之间的页码`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <button
            className="hover:text-foreground"
            onClick={() => navigate("/dashboard/tasks")}
          >
            任务管理
          </button>
          <span>/</span>
          <span className="text-foreground">任务分配详情</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">任务分配详情</h1>
          <Button size="sm" onClick={handleNewAllocation}>
            <Plus className="h-4 w-4 mr-1" /> 新增任务分配
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground whitespace-nowrap">计划名称</span>
              <Input
                value={filterPlanName}
                onChange={(e) => setFilterPlanName(e.target.value)}
                placeholder="请输入计划名称"
                className="w-40 h-9"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground whitespace-nowrap">状态</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">全部</option>
                <option value="进行中">进行中</option>
                <option value="已完成">已完成</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground whitespace-nowrap">创建时间</span>
              <Input
                value={filterCreateTime}
                onChange={(e) => setFilterCreateTime(e.target.value)}
                placeholder="请输入创建时间"
                className="w-40 h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Button variant="outline" size="sm" onClick={handleReset} className="h-9 px-4 gap-2 border-border text-foreground hover:bg-accent">
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
            <Button size="sm" onClick={handleQuery} className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="h-4 w-4 mr-1" /> 查询
            </Button>
            <button
              className="h-9 w-9 flex items-center justify-center border border-border rounded-md hover:bg-accent transition-colors"
              onClick={() => {
                toast.success("刷新成功");
                handleReset();
              }}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats bar */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">总预计收集份数</span>
            <span className="text-sm font-semibold text-foreground">{summaries.totalEstCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">已收集总份数</span>
            <span className="text-sm font-semibold text-foreground">{summaries.totalCollCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">男女比例</span>
            <span className="text-sm font-semibold text-foreground">{summaries.totalGenderM}:{summaries.totalGenderF}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">已完成验收条数</span>
            <span className="text-sm font-semibold text-foreground">{summaries.totalAccTerms} 条</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full whitespace-nowrap">
            <thead>
              <tr>
                <th className="w-12">
                  <input type="checkbox" className="accent-primary" />
                </th>
                <th>计划序号</th>
                <th>计划名称</th>
                <th>预计录制音频份数</th>
                <th>已收集音频份数</th>
                <th>预计录制音频条数</th>
                <th>已收集音频条数</th>
                <th>男女比例</th>
                <th>已完成验收条数</th>
                <th>状态</th>
                <th>创建时间</th>
                <th className="min-w-[280px] sticky right-0 !bg-card z-20 shadow-[-6px_0_6px_-3px_rgba(0,0,0,0.05)] border-l">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center text-muted-foreground py-8">
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.planIndex} className="group">
                    <td className="text-center">
                      <input type="checkbox" className="accent-primary" />
                    </td>
                    <td>{record.planIndex}</td>
                    <td>{record.planName}</td>
                    <td className="text-center">{record.estimatedAudioCount}</td>
                    <td className="text-center">{record.collectedAudioCount}</td>
                    <td className="text-center">{record.estimatedAudioTerms}</td>
                    <td className="text-center">{record.collectedAudioTerms}</td>
                    <td className="text-center">{record.genderRatio}</td>
                    <td className="text-center">{record.completedAcceptanceTerms}</td>
                    <td>{renderStatus(record.status)}</td>
                    <td>{record.createTime}</td>
                    <td className="sticky right-0 !bg-card z-10 shadow-[-6px_0_6px_-3px_rgba(0,0,0,0.05)] border-l transition-colors group-hover:!bg-accent text-sm">
                      <div className="flex items-center flex-wrap">
                        <button
                          className="text-xs text-primary hover:text-primary/80 mr-2"
                          onClick={() =>
                            navigate(
                              `/dashboard/tasks/${taskId}/recovery-plan/${encodeURIComponent(record.planName)}/execution`
                            )
                          }
                        >
                          子任务执行详情
                        </button>
                        <button
                          className="text-xs text-primary hover:text-primary/80 mr-2"
                          onClick={() => handleEditAllocation(record)}
                        >
                          修改任务分配
                        </button>
                        {record.status === "进行中" && (
                          <button
                            className="text-xs text-destructive hover:text-destructive/80"
                            onClick={() => handleEndTask(record)}
                          >
                            结束任务
                          </button>
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

      {/* End Task Confirmation */}
      <AlertDialog
        open={endTaskConfirmOpen}
        onOpenChange={setEndTaskConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>结束任务确认</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-medium">
              任务结束后，将回收全部词条，无法继续执行录制任务。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToEnd(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndTask} className="bg-destructive hover:bg-destructive/90">确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 分页控制 */}
      <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground mt-4">
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
          <option value={10}>10条/页</option>
          <option value={20}>20条/页</option>
          <option value={50}>50条/页</option>
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
                className={`w-7 h-7 flex items-center justify-center rounded text-xs cursor-pointer ${currentPage === p
                  ? "bg-primary text-primary-foreground font-medium"
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
        <div className="flex items-center gap-1">
          <span>前往</span>
          <input
            className="w-10 h-7 px-1 text-xs text-center border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
          />
          <span>页</span>
        </div>
      </div>

      {/* Dialogs */}
      <TaskAllocationDialog
        open={allocationDialogOpen}
        onOpenChange={setAllocationDialogOpen}
        mode="nonagent"
        editingRecord={editingRecord}
        taskId={taskId}
        onSuccess={() => {
          const allRecords = getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
          setPlanRecords(allRecords.filter(r => r.taskId === taskId));
        }}
      />

    </div>
  );
};

export default TaskRecoveryNonAgent;
