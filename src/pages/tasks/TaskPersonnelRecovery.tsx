import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { mockPersonnelRecovery } from "./mockData";
import type { PersonnelRecoveryRecord } from "./types";
import EditTaskInfoDialog from "@/components/tasks/EditTaskInfoDialog";
import EditRecorderInfoDialog from "@/components/tasks/EditRecorderInfoDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 10;

const TaskPersonnelRecovery = () => {
  const navigate = useNavigate();
  const { taskId, agentId } = useParams<{ taskId: string; agentId: string }>();

  // Filter states
  const [filterRecorderName, setFilterRecorderName] = useState("");
  const [filterRecorderId, setFilterRecorderId] = useState("");
  const [filterTaskRemark, setFilterTaskRemark] = useState("");
  const [filterIsTaskEnded, setFilterIsTaskEnded] = useState<string>("all");
  const [filterCreateTime, setFilterCreateTime] = useState("");

  // Dialog states
  const [editTaskInfoOpen, setEditTaskInfoOpen] = useState(false);
  const [editRecorderInfoOpen, setEditRecorderInfoOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PersonnelRecoveryRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering logic
  const filteredRecords = mockPersonnelRecovery.filter((record) => {
    if (filterRecorderName && !record.recorderName.includes(filterRecorderName)) return false;
    if (filterRecorderId && !record.recorderId.includes(filterRecorderId)) return false;
    if (filterTaskRemark && !record.taskRemark.includes(filterTaskRemark)) return false;
    if (filterCreateTime && !record.createTime.includes(filterCreateTime)) return false;
    if (filterIsTaskEnded !== "all") {
      const ended = filterIsTaskEnded === "yes";
      if (record.isTaskEnded !== ended) return false;
    }
    return true;
  });

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setFilterRecorderName("");
    setFilterRecorderId("");
    setFilterTaskRemark("");
    setFilterIsTaskEnded("all");
    setFilterCreateTime("");
    setCurrentPage(1);
  };

  const handleQuery = () => {
    setCurrentPage(1);
  };

  const handleEditTaskInfo = (record: PersonnelRecoveryRecord) => {
    setSelectedRecord(record);
    setEditTaskInfoOpen(true);
  };

  const handleEditRecorderInfo = (record: PersonnelRecoveryRecord) => {
    setSelectedRecord(record);
    setEditRecorderInfoOpen(true);
  };

  const handleSaveTaskInfo = (remark: string) => {
    // In real app, call API to update
    console.log("Save task remark:", remark, "for recorder:", selectedRecord?.recorderId);
  };

  const handleSaveRecorderInfo = (data: {
    recorderName: string;
    contact: string;
    gender: string;
    age: number;
    growthLocation: string;
  }) => {
    // In real app, call API to update
    console.log("Save recorder info:", data, "for recorder:", selectedRecord?.recorderId);
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
            onClick={() => navigate(`/dashboard/tasks/${taskId}/recovery`)}
          >
            任务回收详情
          </button>
          <span>/</span>
          <span className="text-foreground">任务人员回收详情</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">任务人员回收详情</h1>
      </div>

      {/* Info bar */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">任务id:</span>
            <span className="text-sm font-semibold text-foreground">fsfefe-20251223-aa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">代理人:</span>
            <span className="text-sm font-semibold text-foreground">王工</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">代理人id:</span>
            <span className="text-sm font-semibold text-foreground">wg-20251223-0804</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">录音人</span>
            <Input
              value={filterRecorderName}
              onChange={(e) => setFilterRecorderName(e.target.value)}
              placeholder="请输入录音人"
              className="w-40 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">录音人ID</span>
            <Input
              value={filterRecorderId}
              onChange={(e) => setFilterRecorderId(e.target.value)}
              placeholder="请输入录音人ID"
              className="w-40 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">任务备注</span>
            <Input
              value={filterTaskRemark}
              onChange={(e) => setFilterTaskRemark(e.target.value)}
              placeholder="请输入任务备注"
              className="w-40 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">是否结束任务</span>
            <select
              value={filterIsTaskEnded}
              onChange={(e) => setFilterIsTaskEnded(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">全部</option>
              <option value="yes">是</option>
              <option value="no">否</option>
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
                  <input type="checkbox" className="accent-primary" />
                </th>
                <th>录音人</th>
                <th>录音人ID</th>
                <th>任务备注</th>
                <th>联系方式</th>
                <th>性别</th>
                <th>年龄</th>
                <th>成长地点</th>
                <th>已上传音频数量</th>
                <th>是否结束任务</th>
                <th>通过条数</th>
                <th>创建时间</th>
                <th className="min-w-[320px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center text-muted-foreground py-8">
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, idx) => (
                  <tr key={record.recorderId + "-" + idx}>
                    <td className="text-center">
                      <input type="checkbox" className="accent-primary" />
                    </td>
                    <td>{record.recorderName}</td>
                    <td>{record.recorderId}</td>
                    <td>{record.taskRemark || "-"}</td>
                    <td>{record.contact}</td>
                    <td>{record.gender}</td>
                    <td>{record.age}</td>
                    <td>{record.growthLocation}</td>
                    <td>{record.uploadedAudioCount}</td>
                    <td>
                      {record.isTaskEnded ? (
                        <span className="text-green-500">是</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{record.passedTerms}</td>
                    <td>{record.createTime}</td>
                    <td>
                      <div className="flex items-center flex-wrap">
                        <button
                          className="text-xs text-primary hover:text-primary/80 mr-2"
                          onClick={() =>
                            navigate(
                              `/dashboard/tasks/${taskId}/recovery/${agentId}/personnel/${encodeURIComponent(record.recorderId)}/audio`
                            )
                          }
                        >
                          音频详情
                        </button>
                        <button
                          className="text-xs text-primary hover:text-primary/80 mr-2"
                          onClick={() => handleEditTaskInfo(record)}
                        >
                          修改任务信息
                        </button>
                        <button
                          className="text-xs text-primary hover:text-primary/80 mr-2"
                          onClick={() => handleEditRecorderInfo(record)}
                        >
                          修改录音人信息
                        </button>
                        <button
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={() => toast.info("隐私协议预览功能开发中")}
                        >
                          预览隐私协议书
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
      <EditTaskInfoDialog
        open={editTaskInfoOpen}
        onOpenChange={setEditTaskInfoOpen}
        currentRemark={selectedRecord?.taskRemark || ""}
        onSave={handleSaveTaskInfo}
      />

      <EditRecorderInfoDialog
        open={editRecorderInfoOpen}
        onOpenChange={setEditRecorderInfoOpen}
        recorder={
          selectedRecord
            ? {
                recorderName: selectedRecord.recorderName,
                contact: selectedRecord.contact,
                gender: selectedRecord.gender,
                age: selectedRecord.age,
                growthLocation: selectedRecord.growthLocation,
              }
            : null
        }
        onSave={handleSaveRecorderInfo}
      />
    </div>
  );
};

export default TaskPersonnelRecovery;
