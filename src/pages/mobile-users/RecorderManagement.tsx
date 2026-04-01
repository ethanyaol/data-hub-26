import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mockRecorders, mockMobileUsers } from "./mockData";
import { STORAGE_KEYS, getStorageData, setStorageData } from "@/utils/storage";
import { provinces } from "./locations";
import type { RecorderRecord } from "./types";
import EditRecorderDialog from "@/components/mobile-users/EditRecorderDialog";
import Cascader from "@/components/ui/cascader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

const RecorderManagement = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [recorders, setRecorders] = useState<RecorderRecord[]>(() => 
    getStorageData(STORAGE_KEYS.RECORDERS, mockRecorders)
  );
  const totalCount = 100; // 模拟总数

  // 获取父级用户手机号
  const parentUser = mockMobileUsers.find(u => u.id === userId);
  const loginPhone = parentUser?.loginPhone || "-";

  // 数据兜底策略：如果当前用户的录音人为空，尝试从 mockData 中恢复
  useEffect(() => {
    const userRecorders = recorders.filter(r => r.userId === userId);
    if (userRecorders.length === 0) {
      const initialMockRecorders = mockRecorders.filter(r => r.userId === userId);
      if (initialMockRecorders.length > 0) {
        const newRecorders = [...recorders, ...initialMockRecorders];
        setRecorders(newRecorders);
        setStorageData(STORAGE_KEYS.RECORDERS, newRecorders);
      }
    }
  }, [userId, recorders]);

  // 脱敏辅助函数
  const maskPhone = (phone: string) => {
    if (!phone || phone === "-") return "-";
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
  };

  const maskName = (name: string) => {
    if (!name) return "-";
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + "*";
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  };

  // Filters
  const [filterNickname, setFilterNickname] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterContact, setFilterContact] = useState("");
  const [age, setAge] = useState<number | string>(""); 
  const [growthLocation, setGrowthLocation] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState("");

  // Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogMode, setEditDialogMode] = useState<"add" | "edit">("add");
  const [editingRecorder, setEditingRecorder] =
    useState<RecorderRecord | null>(null);

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    recorder: RecorderRecord | null;
  }>({ open: false, recorder: null });

  const filteredRecorders = recorders.filter((r) => {
    if (r.userId !== userId) return false; // 必须匹配当前用户 ID
    if (filterNickname && !r.nickname.includes(filterNickname)) return false;
    if (filterId && !r.id.toLowerCase().includes(filterId.toLowerCase()))
      return false;
    if (filterContact && !r.contact.includes(filterContact)) return false;
    if (age && r.age.toString() !== age.toString()) return false;
    if (growthLocation && !r.growthLocation.includes(growthLocation)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRecorders.length / pageSize);
  const paginatedRecorders = filteredRecorders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReset = () => {
    setFilterNickname("");
    setAge("");
    setGrowthLocation("");
    setFilterId("");
    setFilterContact("");
    setCurrentPage(1);
  };

  const handleQuery = () => {
    const ageNum = Number(age);
    if (age !== "" && !isNaN(ageNum) && ageNum < 14) {
      toast.error("年龄筛选须不小于 14 岁");
      return;
    }
    setCurrentPage(1);
  };

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

  const handleAgeBlur = () => {
    const ageNum = Number(age);
    if (age !== "" && !isNaN(ageNum) && ageNum < 14) {
      setAge("");
      toast.error("年龄筛选须不小于 14 岁");
    }
  };

  const handleAddRecorder = () => {
    setEditDialogMode("add");
    setEditingRecorder(null);
    setEditDialogOpen(true);
  };

  const handleEditRecorder = (recorder: RecorderRecord) => {
    setEditDialogMode("edit");
    setEditingRecorder(recorder);
    setEditDialogOpen(true);
  };

  const handleSaveRecorder = (data: {
    nickname: string;
    gender: string;
    contact: string;
    age: number;
    growthLocation: string;
    createTime?: string; // Add createTime as optional for edit mode
  }) => {
    if (editDialogMode === "add") {
      const newRecorder: RecorderRecord = {
        id: `rec-${Date.now()}`,
        userId: userId || "",
        nickname: data.nickname,
        gender: data.gender,
        age: data.age,
        contact: data.contact,
        growthLocation: data.growthLocation,
        createTime: new Date().toLocaleString("zh-CN").replace(/\//g, "/"),
        isSyncRecorder: false,
      };
      const updatedRecorders = [newRecorder, ...recorders];
      setRecorders(updatedRecorders);
      setStorageData(STORAGE_KEYS.RECORDERS, updatedRecorders);
      toast.success("录音人添加成功");
    } else if (editingRecorder) {
      const updatedRecorders = recorders.map((r) =>
        r.id === editingRecorder.id ? { ...r, ...data } : r
      );
      setRecorders(updatedRecorders);
      setStorageData(STORAGE_KEYS.RECORDERS, updatedRecorders);
      toast.success("录音人信息已更新");
    }
  };

  const handleDeleteRecorder = (recorder: RecorderRecord) => {
    if (recorder.isSyncRecorder) {
      toast.error("默认同步录音人不可删除");
      return;
    }
    setDeleteDialog({ open: true, recorder });
  };

  const confirmDelete = () => {
    if (deleteDialog.recorder) {
      const updatedRecorders = recorders.filter((r) => r.id !== deleteDialog.recorder!.id);
      setRecorders(updatedRecorders);
      setStorageData(STORAGE_KEYS.RECORDERS, updatedRecorders);
      toast.success("录音人已删除");
    }
    setDeleteDialog({ open: false, recorder: null });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard/mobile-users")}
          className="hover:text-primary"
        >
          移动端用户管理
        </button>
        <span>/</span>
        <span className="text-foreground">录音人管理</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">录音人管理</h1>
        <button
          onClick={handleAddRecorder}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新建录音人
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              昵称
            </label>
            <input
              className="h-8 px-3 text-sm border border-input rounded-md bg-background w-32"
              placeholder="请输入..."
              value={filterNickname}
              onChange={(e) => setFilterNickname(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              年龄
            </label>
            <input
              className="h-8 px-3 text-sm border border-input rounded-md bg-background w-24"
              placeholder="请输入..."
              value={age}
              onChange={(e) => setAge(e.target.value)}
              onBlur={handleAgeBlur}
              type="number"
              min={14}
              max={120}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              成长地
            </label>
            <Cascader
              value={growthLocation}
              onValueChange={setGrowthLocation}
              placeholder="所有城市"
              className="h-8 w-[180px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              ID
            </label>
            <input
              className="h-8 px-3 text-sm border border-input rounded-md bg-background w-32"
              placeholder="请输入..."
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              联系方式
            </label>
            <input
              className="h-8 px-3 text-sm border border-input rounded-md bg-background w-32"
              placeholder="请输入..."
              value={filterContact}
              onChange={(e) => setFilterContact(e.target.value)}
            />
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-input rounded-md hover:bg-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            重置
          </button>
          <button
            onClick={handleQuery}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Search className="h-3.5 w-3.5" />
            查询
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>登录手机号</th>
                <th>昵称</th>
                <th>性别</th>
                <th>年龄</th>
                <th>联系方式</th>
                <th>成长地</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecorders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedRecorders.map((recorder, index) => (
                  <tr key={recorder.id}>
                    <td>
                      {totalCount - ((currentPage - 1) * pageSize + index)}
                    </td>
                    <td>{maskPhone(loginPhone)}</td>
                    <td>{recorder.nickname}</td>
                    <td>{recorder.gender}</td>
                    <td>{recorder.age}</td>
                    <td>{maskPhone(recorder.contact)}</td>
                    <td>{recorder.growthLocation}</td>
                    <td className="text-xs text-muted-foreground">
                      {recorder.createTime}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={() => handleEditRecorder(recorder)}
                        >
                          编辑录音人信息
                        </button>
                        {!recorder.isSyncRecorder && (
                          <button
                            className="text-xs text-destructive hover:text-destructive/80"
                            onClick={() => handleDeleteRecorder(recorder)}
                          >
                            删除
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

        {/* 分页控制 */}
        {filteredRecorders.length > 0 && (
          <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground px-4 py-3 border-t border-border">
            <span>共 {filteredRecorders.length} 条</span>
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
        )}
      </div>

      {/* Edit Recorder Dialog */}
      <EditRecorderDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode={editDialogMode}
        loginPhone={loginPhone}
        recorder={
          editingRecorder
            ? {
                nickname: editingRecorder.nickname,
                gender: editingRecorder.gender,
                contact: editingRecorder.contact,
                age: editingRecorder.age,
                growthLocation: editingRecorder.growthLocation,
                createTime: editingRecorder.createTime,
                isSyncRecorder: editingRecorder.isSyncRecorder,
              }
            : null
        }
        onSave={handleSaveRecorder}
      />

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确认删除录音人"{deleteDialog.recorder?.nickname}"？删除后不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecorderManagement;
