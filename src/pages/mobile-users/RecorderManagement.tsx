import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mockRecorders, mockMobileUsers } from "./mockData";
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
  const [recorders, setRecorders] = useState<RecorderRecord[]>(mockRecorders);
  const totalCount = 100; // 模拟总数

  // 获取父级用户手机号
  const parentUser = mockMobileUsers.find(u => u.id === userId);
  const loginPhone = parentUser?.loginPhone || "-";

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
  const itemsPerPage = 10;

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
    if (filterNickname && !r.nickname.includes(filterNickname)) return false;
    if (filterId && !r.id.toLowerCase().includes(filterId.toLowerCase()))
      return false;
    if (filterContact && !r.contact.includes(filterContact)) return false;
    if (age && r.age.toString() !== age.toString()) return false;
    if (growthLocation && !r.growthLocation.includes(growthLocation)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRecorders.length / itemsPerPage);
  const paginatedRecorders = filteredRecorders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
        nickname: data.nickname,
        gender: data.gender,
        age: data.age,
        contact: data.contact,
        growthLocation: data.growthLocation,
        createTime: new Date().toLocaleString("zh-CN").replace(/\//g, "/"),
      };
      setRecorders((prev) => [newRecorder, ...prev]);
      toast.success("录音人添加成功");
    } else if (editingRecorder) {
      setRecorders((prev) =>
        prev.map((r) =>
          r.id === editingRecorder.id ? { ...r, ...data } : r
        )
      );
      toast.success("录音人信息已更新");
    }
  };

  const handleDeleteRecorder = (recorder: RecorderRecord) => {
    if (recorders.length <= 1) {
      toast.error("必须保留至少一个录音人，不可全部删除");
      return;
    }
    // Assuming the first recorder is a special one that cannot be deleted
    // This logic might need adjustment based on actual requirements
    if (recorder.id === recorders[0].id) {
      toast.error("第一个录音人不可删除");
      return;
    }
    setDeleteDialog({ open: true, recorder });
  };

  const confirmDelete = () => {
    if (deleteDialog.recorder) {
      setRecorders((prev) =>
        prev.filter((r) => r.id !== deleteDialog.recorder!.id)
      );
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
                      {totalCount - ((currentPage - 1) * itemsPerPage + index)}
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
                        <button
                          className="text-xs text-destructive hover:text-destructive/80"
                          onClick={() => handleDeleteRecorder(recorder)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRecorders.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              展示 {(currentPage - 1) * itemsPerPage + 1} 到{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredRecorders.length
              )}
              ，共 {filteredRecorders.length} 条数据
            </span>
            <div className="flex items-center gap-1">
              <button
                className="px-3 py-1 text-sm border border-input rounded hover:bg-accent disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 text-sm border rounded ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input hover:bg-accent"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="px-3 py-1 text-sm border border-input rounded hover:bg-accent disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
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
