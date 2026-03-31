import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, RotateCcw, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { mockPersonnelRecovery, mockTasks } from "./mockData";
import { STORAGE_KEYS, getStorageData, setStorageData } from "@/utils/storage";
import type { PersonnelRecoveryRecord } from "./types";
import EditTaskInfoDialog from "@/components/tasks/EditTaskInfoDialog";
import EditRecorderInfoDialog from "@/components/tasks/EditRecorderInfoDialog";
import PrivacyAgreementDialog from "@/components/tasks/PrivacyAgreementDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/DateRangePicker";
import type { DateRange } from "react-day-picker";
import { isWithinInterval, parse, startOfDay, endOfDay } from "date-fns";

const ITEMS_PER_PAGE = 10;

const TaskPersonnelRecovery = () => {
  const navigate = useNavigate();
  const { taskId, agentId } = useParams<{ taskId: string; agentId: string }>();

  // 数据状态（持久化）
  const [personnelData, setPersonnelData] = useState<PersonnelRecoveryRecord[]>(() => 
    getStorageData(STORAGE_KEYS.RECORDERS, mockPersonnelRecovery)
  );
  
  // Find current task info
  const currentTask = mockTasks.find(t => t.id === taskId);

  // 脱敏辅助函数
  const maskPhone = (phone: string) => {
    if (!phone || phone === "-") return "-";
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
  };

  // Filter states
  const [filterRecorderName, setFilterRecorderName] = useState("");
  const [filterRecorderId, setFilterRecorderId] = useState("");
  const [filterTaskRemark, setFilterTaskRemark] = useState("");
  const [filterIsTaskEnded, setFilterIsTaskEnded] = useState<string>("all");
  const [filterUpdateTime, setFilterUpdateTime] = useState<DateRange | undefined>(undefined);
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Dialog states
  const [editTaskInfoOpen, setEditTaskInfoOpen] = useState(false);
  const [editRecorderInfoOpen, setEditRecorderInfoOpen] = useState(false);
  const [privacyAgreementOpen, setPrivacyAgreementOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PersonnelRecoveryRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchEdit, setIsBatchEdit] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState("");

  // Filtering logic
  const filteredRecords = personnelData.filter((record) => {
    if (filterRecorderName && !record.recorderName.includes(filterRecorderName)) return false;
    if (filterRecorderId && !record.recorderId.includes(filterRecorderId)) return false;
    if (filterTaskRemark && !record.taskRemark.includes(filterTaskRemark)) return false;
    if (filterIsTaskEnded !== "all") {
      const ended = filterIsTaskEnded === "yes";
      if (record.isTaskEnded !== ended) return false;
    }
    if (filterUpdateTime?.from && filterUpdateTime?.to) {
      const recordDate = parse(record.createTime, "yyyy/MM/dd HH:mm:ss", new Date());
      if (!isWithinInterval(recordDate, { 
        start: startOfDay(filterUpdateTime.from), 
        end: endOfDay(filterUpdateTime.to) 
      })) return false;
    }
    return true;
  });

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReset = () => {
    setFilterRecorderName("");
    setFilterRecorderId("");
    setFilterTaskRemark("");
    setFilterIsTaskEnded("all");
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
      const allIds = paginatedRecords.map((r) => r.recorderId);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.has(r.recorderId));

  const handleEditTaskInfo = (record: PersonnelRecoveryRecord) => {
    setSelectedRecord(record);
    setIsBatchEdit(false);
    setEditTaskInfoOpen(true);
  };

  const handleBatchEditTaskInfo = () => {
    setIsBatchEdit(true);
    setEditTaskInfoOpen(true);
  };

  const handleEditRecorderInfo = (record: PersonnelRecoveryRecord) => {
    setSelectedRecord(record);
    setEditRecorderInfoOpen(true);
  };

  const handlePreviewAgreement = (record: PersonnelRecoveryRecord) => {
    setSelectedRecord(record);
    setPrivacyAgreementOpen(true);
  };

  const handleSaveTaskInfo = (remark: string) => {
    let updatedData: PersonnelRecoveryRecord[];
    if (isBatchEdit) {
      updatedData = personnelData.map(r => 
        selectedIds.has(r.recorderId) ? { ...r, taskRemark: remark } : r
      );
      setPersonnelData(updatedData);
      setStorageData(STORAGE_KEYS.RECORDERS, updatedData);
      toast.success(`已成功批量修改 ${selectedIds.size} 条记录的任务信息`);
      setSelectedIds(new Set());
    } else if (selectedRecord) {
      updatedData = personnelData.map(r => 
        r.recorderId === selectedRecord.recorderId ? { ...r, taskRemark: remark } : r
      );
      setPersonnelData(updatedData);
      setStorageData(STORAGE_KEYS.RECORDERS, updatedData);
      toast.success("任务信息修改成功");
    }
  };

  const handleSaveRecorderInfo = (data: {
    recorderName: string;
    contact: string;
    gender: string;
    age: number;
    growthLocation: string;
  }) => {
    if (selectedRecord) {
      const updatedData = personnelData.map(r => 
        r.recorderId === selectedRecord.recorderId ? { ...r, ...data } : r
      );
      setPersonnelData(updatedData);
      setStorageData(STORAGE_KEYS.RECORDERS, updatedData);
      toast.success("录音人信息修改成功");
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
            <span className="text-sm font-semibold text-foreground">{taskId}</span>
          </div>
          {currentTask?.isAgentMode && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">代理人:</span>
                <span className="text-sm font-semibold text-foreground">王工</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">代理人id:</span>
                <span className="text-sm font-semibold text-foreground">{agentId}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 min-w-[200px]">
              <span className="text-sm text-muted-foreground whitespace-nowrap w-16">录音人</span>
              <Input
                value={filterRecorderName}
                onChange={(e) => setFilterRecorderName(e.target.value)}
                placeholder="请输入录音人"
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-1.5 min-w-[200px]">
              <span className="text-sm text-muted-foreground whitespace-nowrap w-16">录音人ID</span>
              <Input
                value={filterRecorderId}
                onChange={(e) => setFilterRecorderId(e.target.value)}
                placeholder="请输入录音人ID"
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-1.5 min-w-[200px]">
              <span className="text-sm text-muted-foreground whitespace-nowrap w-16">任务备注</span>
              <Input
                value={filterTaskRemark}
                onChange={(e) => setFilterTaskRemark(e.target.value)}
                placeholder="请输入任务备注"
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" onClick={handleQuery} className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                <Search className="h-4 w-4 mr-1.5" /> 查询
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="h-9 px-4 gap-2 border-border text-foreground hover:bg-accent">
                <RotateCcw className="h-4 w-4" /> 重置
              </Button>
              <button
                className="h-9 w-9 flex items-center justify-center border border-border rounded-md hover:bg-accent transition-colors"
                title="刷新数据"
                onClick={() => {
                  toast.success("数据已刷新");
                  handleReset();
                  setSelectedIds(new Set());
                }}
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="h-9 px-2 text-primary hover:bg-primary/5 flex items-center gap-1"
              >
                {isFilterExpanded ? (
                  <>收起 <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>展开 <ChevronDown className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>

          {isFilterExpanded && (
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-dashed border-border animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1.5 min-w-[200px]">
                <span className="text-sm text-muted-foreground whitespace-nowrap w-16">任务状态</span>
                <select
                  value={filterIsTaskEnded}
                  onChange={(e) => setFilterIsTaskEnded(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">任务是否结束：全部</option>
                  <option value="yes">任务已结束</option>
                  <option value="no">任务进行中</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground whitespace-nowrap w-16">更新时间</span>
                <DateRangePicker
                  dateRange={filterUpdateTime}
                  onSelect={setFilterUpdateTime}
                  className="w-64"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchEditTaskInfo}
              disabled={selectedIds.size === 0}
              className="h-9 px-4 border-primary text-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              批量修改任务信息 {selectedIds.size > 0 && `(${selectedIds.size})`}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Action buttons could go here if needed, currently empty */}
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
                  <input
                    type="checkbox"
                    className="accent-primary cursor-pointer"
                    checked={isAllSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
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
                <th>更新时间</th>
                <th className="min-w-[280px] sticky right-0 !bg-card z-20 shadow-[-6px_0_6px_-3px_rgba(0,0,0,0.05)] border-l">操作</th>
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
                  <tr key={record.recorderId + "-" + idx} className={selectedIds.has(record.recorderId) ? "bg-primary/5" : ""}>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="accent-primary cursor-pointer"
                        checked={selectedIds.has(record.recorderId)}
                        onChange={() => toggleRow(record.recorderId)}
                      />
                    </td>
                    <td>{record.recorderName}</td>
                    <td>{record.recorderId}</td>
                    <td>{record.taskRemark || "-"}</td>
                    <td>{maskPhone(record.contact)}</td>
                    <td>{record.gender}</td>
                    <td>{record.age}</td>
                    <td>{record.growthLocation}</td>
                    <td>{record.uploadedAudioCount}</td>
                    <td>{record.isTaskEnded ? <span className="text-green-500 font-medium">是</span> : <span className="text-muted-foreground">-</span>}</td>
                    <td>{record.passedTerms}</td>
                    <td>{record.createTime}</td>
                    <td className="sticky right-0 !bg-card z-10 shadow-[-6px_0_6px_-3px_rgba(0,0,0,0.05)] border-l transition-colors group-hover:!bg-accent text-sm">
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
                          onClick={() => handlePreviewAgreement(record)}
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
      <EditTaskInfoDialog
        open={editTaskInfoOpen}
        onOpenChange={setEditTaskInfoOpen}
        currentRemark={isBatchEdit ? "" : (selectedRecord?.taskRemark || "")}
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

      <PrivacyAgreementDialog
        open={privacyAgreementOpen}
        onOpenChange={setPrivacyAgreementOpen}
        recorderName={selectedRecord?.recorderName || ""}
        signDate={selectedRecord?.createTime || ""}
      />
    </div>
  );
};

export default TaskPersonnelRecovery;
