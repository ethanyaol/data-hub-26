import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { mockSubtasksNonAgent } from "./mockData";
import type { SubtaskNonAgentRecord } from "./types";
import PersonnelAssignDialog from "@/components/tasks/PersonnelAssignDialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 10;

const ViewSubtasksNonAgent = () => {
  const navigate = useNavigate();
  const { taskId, planId } = useParams<{ taskId: string; planId: string }>();

  // Filter states
  const [filterClaimStatus, setFilterClaimStatus] = useState<string>("all");
  const [filterRecoveryStatus, setFilterRecoveryStatus] = useState<string>("all");
  const [filterCreateTime, setFilterCreateTime] = useState("");

  // Dialog states
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [personnelDialogOpen, setPersonnelDialogOpen] = useState(false);

  // Selection
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering logic
  const filteredRecords = mockSubtasksNonAgent.filter((record) => {
    if (filterClaimStatus !== "all" && record.claimStatus !== filterClaimStatus) return false;
    if (filterRecoveryStatus !== "all" && record.recoveryStatus !== filterRecoveryStatus) return false;
    if (filterCreateTime && !record.createTime.includes(filterCreateTime)) return false;
    return true;
  });

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setFilterClaimStatus("all");
    setFilterRecoveryStatus("all");
    setFilterCreateTime("");
    setCurrentPage(1);
  };

  const handleQuery = () => {
    setCurrentPage(1);
  };

  const toggleSelect = (idx: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleSelectAll = () => {
    const pageIndexes = paginatedRecords.map((r) => r.subtaskIndex);
    const allSelected = pageIndexes.every((idx) => selectedIndexes.includes(idx));
    if (allSelected) {
      setSelectedIndexes((prev) => prev.filter((idx) => !pageIndexes.includes(idx)));
    } else {
      setSelectedIndexes((prev) => [...new Set([...prev, ...pageIndexes])]);
    }
  };

  const renderClaimStatus = (status: SubtaskNonAgentRecord["claimStatus"]) => {
    const dotColor = status === "已领取" ? "bg-blue-500" : "bg-gray-400";
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
        {status}
      </span>
    );
  };

  const handleRecoveryConfirm = () => {
    setRecoveryDialogOpen(false);
    toast.success("回收成功");
  };

  const handleReassignConfirm = () => {
    setReassignDialogOpen(false);
    setPersonnelDialogOpen(true);
  };

  const handlePersonnelConfirm = (selectedIds: string[]) => {
    setPersonnelDialogOpen(false);
    toast.success("人员分配成功");
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push("ellipsis");
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(currentPage);
      }
      if (currentPage < totalPages - 3) pages.push("ellipsis");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
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
          <button
            className="hover:text-foreground"
            onClick={() => navigate(`/dashboard/tasks/${taskId}/recovery-plan`)}
          >
            任务回收详情
          </button>
          <span>/</span>
          <span className="text-foreground">查看子任务</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">查看子任务</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setRecoveryDialogOpen(true)}>
              确认回收
            </Button>
            <Button size="sm" onClick={() => setReassignDialogOpen(true)}>
              子任务重新分配人员
            </Button>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">任务id:</span>
            <span className="text-sm font-semibold text-foreground">fsfefe-20251223-aa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">预计回收</span>
            <span className="text-sm font-semibold text-foreground">2份</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">预计回收</span>
            <span className="text-sm font-semibold text-foreground">200条</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">总可用条数</span>
            <span className="text-sm font-semibold text-foreground">19/20</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-600">回收进度 3/10</span>
            <div className="w-32 bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '30%'}} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">子任务当前领取状态</span>
            <select
              value={filterClaimStatus}
              onChange={(e) => setFilterClaimStatus(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">全部</option>
              <option value="已领取">已领取</option>
              <option value="未领取">未领取</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">回收情况</span>
            <select
              value={filterRecoveryStatus}
              onChange={(e) => setFilterRecoveryStatus(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">全部</option>
              <option value="已回收">已回收</option>
              <option value="未回收">未回收</option>
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
          <Button variant="outline" size="sm" onClick={handleReset}>
            重置
          </Button>
          <Button size="sm" onClick={handleQuery}>
            <Search className="h-4 w-4 mr-1" /> 查询
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={
                      paginatedRecords.length > 0 &&
                      paginatedRecords.every((r) => selectedIndexes.includes(r.subtaskIndex))
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>子任务序号</th>
                <th>份数序列</th>
                <th>起始序号</th>
                <th>结束序号</th>
                <th>子任务当前领取状态</th>
                <th>回收情况</th>
                <th>可用条数</th>
                <th>创建时间</th>
                <th>任务人员</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted-foreground py-8">
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.subtaskIndex}>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={selectedIndexes.includes(record.subtaskIndex)}
                        onChange={() => toggleSelect(record.subtaskIndex)}
                      />
                    </td>
                    <td>{record.subtaskIndex}</td>
                    <td>{record.copySequence}</td>
                    <td>{record.startIndex}</td>
                    <td>{record.endIndex}</td>
                    <td>{renderClaimStatus(record.claimStatus)}</td>
                    <td>{record.recoveryStatus}</td>
                    <td>{record.availableTerms}</td>
                    <td>{record.createTime}</td>
                    <td>
                      {record.assignedPerson ? (
                        <button
                          className="text-sm text-primary hover:text-primary/80"
                          onClick={() =>
                            navigate(
                              `/dashboard/tasks/${taskId}/recovery-plan/${planId}/personnel`
                            )
                          }
                        >
                          {record.assignedPerson}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <span>共{totalCount}条记录</span>
        <span>
          第 {currentPage}/{totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 border border-border rounded text-xs hover:bg-muted disabled:opacity-50"
          >
            &lt;
          </button>
          {getPageNumbers().map((p, idx) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${idx}`} className="px-1">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-2.5 py-1 border rounded text-xs ${
                  currentPage === p
                    ? "border-primary text-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 border border-border rounded text-xs hover:bg-muted disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Recovery confirmation dialog */}
      <AlertDialog open={recoveryDialogOpen} onOpenChange={setRecoveryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认回收</AlertDialogTitle>
            <AlertDialogDescription>
              确认回收后，该人员内容将归档，全部内容归档后，任务完成
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecoveryConfirm}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reassign confirmation dialog */}
      <AlertDialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>子任务重新分配人员</AlertDialogTitle>
            <AlertDialogDescription>
              重新分配人员的后，历史录制信息将全部废弃，请只在必要情况下执行该操作
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleReassignConfirm}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Personnel assign dialog */}
      <PersonnelAssignDialog
        open={personnelDialogOpen}
        onOpenChange={setPersonnelDialogOpen}
        onConfirm={handlePersonnelConfirm}
      />
    </div>
  );
};

export default ViewSubtasksNonAgent;
