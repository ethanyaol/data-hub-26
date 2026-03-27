import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { mockAgentRecovery } from "./mockData";
import type { AgentRecoveryRecord } from "./types";
import TaskAllocationDialog from "@/components/tasks/TaskAllocationDialog";
import PersonnelAssignDialog from "@/components/tasks/PersonnelAssignDialog";
import ShareWarningDialog from "@/components/tasks/ShareWarningDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 10;

const TaskRecoveryAgent = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();

  // Filter states
  const [filterAgentName, setFilterAgentName] = useState("");
  const [filterAgentCode, setFilterAgentCode] = useState("");
  const [filterCollectionCode, setFilterCollectionCode] = useState("");
  const [filterCreateTime, setFilterCreateTime] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog states
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [personnelDialogOpen, setPersonnelDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AgentRecoveryRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering logic
  const filteredRecords = mockAgentRecovery.filter((record) => {
    if (filterAgentName && !record.agentName.includes(filterAgentName)) return false;
    if (filterAgentCode && !record.agentCode.includes(filterAgentCode)) return false;
    if (filterCollectionCode && !record.collectionCode.includes(filterCollectionCode)) return false;
    if (filterCreateTime && !record.createTime.includes(filterCreateTime)) return false;
    if (filterStatus !== "all" && record.status !== filterStatus) return false;
    return true;
  });

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setFilterAgentName("");
    setFilterAgentCode("");
    setFilterCollectionCode("");
    setFilterCreateTime("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handleQuery = () => {
    setCurrentPage(1);
  };

  const renderStatus = (status: AgentRecoveryRecord["status"]) => {
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
    setWarningDialogOpen(true);
  };

  const handleWarningConfirm = () => {
    setWarningDialogOpen(false);
    toast.success("任务分配成功");
  };

  const handleEditAllocation = (record: AgentRecoveryRecord) => {
    setEditingRecord(record);
    setAllocationDialogOpen(true);
  };

  const handleNewAllocation = () => {
    setEditingRecord(null);
    setAllocationDialogOpen(true);
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
          <span className="text-foreground">任务回收详情</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">任务回收详情</h1>
          <Button size="sm" onClick={handleNewAllocation}>
            <Plus className="h-4 w-4 mr-1" /> 新增任务分配
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">代理名称</span>
            <Input
              value={filterAgentName}
              onChange={(e) => setFilterAgentName(e.target.value)}
              placeholder="请输入代理名称"
              className="w-40 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">代理码</span>
            <Input
              value={filterAgentCode}
              onChange={(e) => setFilterAgentCode(e.target.value)}
              placeholder="请输入代理码"
              className="w-40 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">采集码</span>
            <Input
              value={filterCollectionCode}
              onChange={(e) => setFilterCollectionCode(e.target.value)}
              placeholder="请输入采集码"
              className="w-40 h-9"
            />
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
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">状态</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">全部</option>
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            重置
          </Button>
          <Button size="sm" onClick={handleQuery}>
            <Search className="h-4 w-4 mr-1" /> 查询
          </Button>
        </div>
      </div>

      {/* Summary stats bar */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">总预计收集份数</span>
            <span className="text-sm font-semibold text-foreground">200</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">已收集总份数</span>
            <span className="text-sm font-semibold text-foreground">40</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">男女比例</span>
            <span className="text-sm font-semibold text-foreground">30:10</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">已完成验收</span>
            <span className="text-sm font-semibold text-foreground">40/200</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-12">
                  <input type="checkbox" className="accent-primary" />
                </th>
                <th>代理名称</th>
                <th>代理码</th>
                <th>采集码</th>
                <th>预计录制音频份数</th>
                <th>已收集音频份数</th>
                <th>男女比例</th>
                <th>已完成验收份数</th>
                <th>已完成验收条数</th>
                <th>状态</th>
                <th>创建时间</th>
                <th className="min-w-[280px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-muted-foreground py-8">
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, idx) => (
                  <tr key={record.agentCode + "-" + idx}>
                    <td className="text-center">
                      <input type="checkbox" className="accent-primary" />
                    </td>
                    <td>{record.agentName}</td>
                    <td>{record.agentCode}</td>
                    <td>{record.collectionCode}</td>
                    <td>{record.estimatedAudioCount}</td>
                    <td>{record.collectedAudioCount}</td>
                    <td>{record.genderRatio}</td>
                    <td>{record.completedAcceptanceCount}</td>
                    <td>{record.completedAcceptanceTerms}</td>
                    <td>{renderStatus(record.status)}</td>
                    <td>{record.createTime}</td>
                    <td>
                      <div className="flex items-center flex-wrap">
                        <button
                          className="text-xs text-primary hover:text-primary/80 mr-2"
                          onClick={() =>
                            navigate(
                              `/dashboard/tasks/${taskId}/recovery/${encodeURIComponent(record.agentCode)}/personnel`
                            )
                          }
                        >
                          任务人员回收详情
                        </button>
                        <button
                          className="text-xs text-primary hover:text-primary/80 mr-2"
                          onClick={() => handleEditAllocation(record)}
                        >
                          修改任务分配
                        </button>
                        <button
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={() =>
                            navigate(
                              `/dashboard/tasks/${taskId}/recovery/${encodeURIComponent(record.agentCode)}/subtasks`
                            )
                          }
                        >
                          查看子任务
                        </button>
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

      {/* Dialogs */}
      <TaskAllocationDialog
        open={allocationDialogOpen}
        onOpenChange={setAllocationDialogOpen}
        onConfirm={handleAllocationConfirm}
        editRecord={editingRecord}
      />

      <PersonnelAssignDialog
        open={personnelDialogOpen}
        onOpenChange={setPersonnelDialogOpen}
      />

      <ShareWarningDialog
        open={warningDialogOpen}
        onOpenChange={setWarningDialogOpen}
        onConfirm={handleWarningConfirm}
      />
    </div>
  );
};

export default TaskRecoveryAgent;
