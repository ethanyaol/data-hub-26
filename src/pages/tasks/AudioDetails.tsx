import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { mockAudioDetails } from "./mockData";
import type { AudioDetailRecord } from "./types";
import { SPEEDS, ACCEPTANCE_STATUSES } from "./types";
import AudioPlayerDialog from "@/components/tasks/AudioPlayerDialog";
import BatchRejectDialog from "@/components/tasks/BatchRejectDialog";
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
import { Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const AudioDetails = () => {
  const navigate = useNavigate();
  const { taskId, agentId, personId } = useParams<{
    taskId: string;
    agentId: string;
    personId: string;
  }>();

  // Filter states
  const [filterRowkey, setFilterRowkey] = useState("");
  const [filterSpeed, setFilterSpeed] = useState<string>("all");
  const [filterRecordingText, setFilterRecordingText] = useState("");
  const [filterAcceptanceStatus, setFilterAcceptanceStatus] = useState<string>("all");
  const [filterCreateTime, setFilterCreateTime] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Dialog states
  const [batchRejectOpen, setBatchRejectOpen] = useState(false);
  const [batchPassConfirmOpen, setBatchPassConfirmOpen] = useState(false);
  const [audioPlayerOpen, setAudioPlayerOpen] = useState(false);
  const [audioPlayerIndex, setAudioPlayerIndex] = useState(0);

  // Filtering logic
  const filteredRecords = mockAudioDetails.filter((record) => {
    if (filterRowkey && !record.audioRowkey.includes(filterRowkey)) return false;
    if (filterSpeed !== "all" && record.speed !== filterSpeed) return false;
    if (filterRecordingText && !record.recordingText.includes(filterRecordingText)) return false;
    if (filterAcceptanceStatus !== "all" && record.acceptanceStatus !== filterAcceptanceStatus) return false;
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
    setFilterRowkey("");
    setFilterSpeed("all");
    setFilterRecordingText("");
    setFilterAcceptanceStatus("all");
    setFilterCreateTime("");
    setCurrentPage(1);
  };

  const handleQuery = () => {
    setCurrentPage(1);
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = new Set(paginatedRecords.map((r) => r.audioRowkey));
      setSelectedRows(allKeys);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowkey: string, checked: boolean) => {
    const next = new Set(selectedRows);
    if (checked) {
      next.add(rowkey);
    } else {
      next.delete(rowkey);
    }
    setSelectedRows(next);
  };

  const isAllSelected =
    paginatedRecords.length > 0 &&
    paginatedRecords.every((r) => selectedRows.has(r.audioRowkey));

  // Batch actions
  const handleBatchRejectConfirm = (remark: string) => {
    setBatchRejectOpen(false);
    toast.success(`已批量打回 ${selectedRows.size} 条记录${remark ? "，备注：" + remark : ""}`);
    setSelectedRows(new Set());
  };

  const handleBatchPassConfirm = () => {
    setBatchPassConfirmOpen(false);
    toast.success(`已批量通过 ${selectedRows.size} 条记录`);
    setSelectedRows(new Set());
  };

  // Audio player
  const handleOpenPlayer = (index: number) => {
    setAudioPlayerIndex(index);
    setAudioPlayerOpen(true);
  };

  // Acceptance status badge renderer
  const renderAcceptanceStatus = (status: AudioDetailRecord["acceptanceStatus"]) => {
    switch (status) {
      case "待验收":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
            待验收
          </span>
        );
      case "已通过":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
            已通过
          </span>
        );
      case "已打回":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
            已打回
          </span>
        );
      case "已补录":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">
            已补录
          </span>
        );
      case "已废弃":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-500">
            已废弃
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Pagination page numbers
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
          <span>...</span>
          <span>/</span>
          <span className="text-foreground">音频详情</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">音频详情</h1>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={selectedRows.size === 0}
              onClick={() => setBatchRejectOpen(true)}
            >
              批量确认打回
            </Button>
            <Button
              size="sm"
              disabled={selectedRows.size === 0}
              onClick={() => setBatchPassConfirmOpen(true)}
            >
              批量确认通过
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">音频rowkey</span>
            <Input
              value={filterRowkey}
              onChange={(e) => setFilterRowkey(e.target.value)}
              placeholder="请输入音频rowkey"
              className="w-40 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">语速</span>
            <select
              value={filterSpeed}
              onChange={(e) => setFilterSpeed(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">全部</option>
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">录制文本</span>
            <Input
              value={filterRecordingText}
              onChange={(e) => setFilterRecordingText(e.target.value)}
              placeholder="请输入录制文本"
              className="w-40 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground whitespace-nowrap">验收情况</span>
            <select
              value={filterAcceptanceStatus}
              onChange={(e) => setFilterAcceptanceStatus(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">全部</option>
              {ACCEPTANCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>词条序号</th>
                <th>音频rowkey</th>
                <th>语言</th>
                <th>语速</th>
                <th>录制文本</th>
                <th>音频格式</th>
                <th>验收情况</th>
                <th>备注</th>
                <th>创建时间</th>
                <th className="min-w-[180px]">操作</th>
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
                paginatedRecords.map((record, idx) => {
                  const globalIdx = filteredRecords.findIndex(
                    (r) => r.audioRowkey === record.audioRowkey
                  );
                  return (
                    <tr key={record.audioRowkey + "-" + idx}>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={selectedRows.has(record.audioRowkey)}
                          onChange={(e) =>
                            handleSelectRow(record.audioRowkey, e.target.checked)
                          }
                        />
                      </td>
                      <td>{record.termIndex}</td>
                      <td>{record.audioRowkey}</td>
                      <td>{record.language}</td>
                      <td>{record.speed}</td>
                      <td>{record.recordingText}</td>
                      <td>{record.audioFormat}</td>
                      <td>{renderAcceptanceStatus(record.acceptanceStatus)}</td>
                      <td>{record.remark || "-"}</td>
                      <td>{record.createTime}</td>
                      <td>
                        <div className="flex items-center flex-wrap">
                          <button
                            className="text-xs text-primary hover:text-primary/80 mr-2"
                            onClick={() => handleOpenPlayer(globalIdx)}
                          >
                            试听
                          </button>
                          <button
                            className="text-xs text-primary hover:text-primary/80 mr-2"
                            onClick={() => toast.info("链接已复制")}
                          >
                            分享
                          </button>
                          <button
                            className="text-xs text-primary hover:text-primary/80"
                            onClick={() => toast.info("已暂时隐藏")}
                          >
                            暂时隐藏
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
      <BatchRejectDialog
        open={batchRejectOpen}
        onOpenChange={setBatchRejectOpen}
        onConfirm={handleBatchRejectConfirm}
        count={selectedRows.size}
      />

      <AlertDialog open={batchPassConfirmOpen} onOpenChange={setBatchPassConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>批量确认通过</AlertDialogTitle>
            <AlertDialogDescription>
              确认将选中的 {selectedRows.size} 条音频标记为通过？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchPassConfirm}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AudioPlayerDialog
        open={audioPlayerOpen}
        onOpenChange={setAudioPlayerOpen}
        audioList={filteredRecords}
        currentIndex={audioPlayerIndex}
        onIndexChange={setAudioPlayerIndex}
      />
    </div>
  );
};

export default AudioDetails;
