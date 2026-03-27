import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, X, ChevronDown, ChevronUp, RotateCcw, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { mockMobileUsers } from "./mockData";
import type { MobileUser } from "./types";
import { DEVICE_TYPES, USER_ROLES, USER_STATUSES } from "./types";
import EditMobileUserDialog from "@/components/mobile-users/EditMobileUserDialog";
import { ClearableSelect } from "@/components/ClearableSelect";
import { Button } from "@/components/ui/button";
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

const MobileUserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<MobileUser[]>(mockMobileUsers);
  const totalCount = 500; // 总注册用户数一致

  // 脱敏辅助函数
  const maskPhone = (phone: string) => {
    if (!phone) return "-";
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
  };

  const maskName = (name: string) => {
    if (!name) return "-";
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + "*";
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  };


  // Filters
  const [filterId, setFilterId] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterDeviceType, setFilterDeviceType] = useState("");
  const [filterDeviceModel, setFilterDeviceModel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterAccountName, setFilterAccountName] = useState("");
  const [filterOrg, setFilterOrg] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogMode, setEditDialogMode] = useState<"add" | "edit">("add");
  const [editingUser, setEditingUser] = useState<MobileUser | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => { } });

  const filteredUsers = users.filter((u) => {
    if (filterId && !u.id.toLowerCase().includes(filterId.toLowerCase())) return false;
    if (filterPhone && !u.loginPhone.includes(filterPhone)) return false;
    if (filterDeviceType && u.deviceType !== filterDeviceType) return false;
    if (filterDeviceModel && !u.deviceModel.toLowerCase().includes(filterDeviceModel.toLowerCase())) return false;
    if (filterStatus && u.status !== filterStatus) return false;
    if (filterRole && u.role !== filterRole) return false;
    if (filterName && !u.name.includes(filterName)) return false;
    if (filterAccountName && !u.accountName.toLowerCase().includes(filterAccountName.toLowerCase())) return false;
    if (filterOrg && !u.organization.includes(filterOrg)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReset = () => {
    setFilterId("");
    setFilterPhone("");
    setFilterDeviceType("");
    setFilterDeviceModel("");
    setFilterStatus("");
    setFilterRole("");
    setFilterName("");
    setFilterAccountName("");
    setFilterOrg("");
    setCurrentPage(1);
  };

  const handleQuery = () => {
    setCurrentPage(1);
  };

  const handleAddUser = () => {
    setEditDialogMode("add");
    setEditingUser(null);
    setEditDialogOpen(true);
  };

  const handleEditUser = (user: MobileUser) => {
    setEditDialogMode("edit");
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveUser = (data: { name: string; loginPhone: string; role: string; status: string }) => {
    if (editDialogMode === "add") {
      const newUser: MobileUser = {
        id: `user-${Date.now()}`,
        name: data.name,
        loginPhone: data.loginPhone,
        role: data.role as MobileUser["role"],
        deviceType: "",
        accountName: "",
        deviceModel: "",
        userSource: "4A",
        organization: "",
        status: data.status as MobileUser["status"],
        createTime: new Date().toLocaleString("zh-CN").replace(/\//g, "/"),
      };
      setUsers((prev) => [newUser, ...prev]);
      toast.success("用户添加成功");
    } else if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
              ...u,
              name: data.name,
              loginPhone: data.loginPhone,
              role: data.role as MobileUser["role"],
              status: data.status as MobileUser["status"]
            }
            : u
        )
      );
      toast.success("用户信息已更新");
    }
  };

  const handleResetPassword = (user: MobileUser) => {
    setConfirmDialog({
      open: true,
      title: "确认重置密码",
      description: `确认将用户"${user.name || user.loginPhone}"的登录密码重置为默认密码？重置后，该用户下次登录时将被要求必须修改密码。`,
      onConfirm: () => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isDefaultPassword: true } : u
          )
        );
        toast.success("密码已重置为默认密码");
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleToggleStatus = (user: MobileUser) => {
    const newStatus = user.status === "启用" ? "停用" : "启用";
    const action = newStatus === "停用" ? "停用" : "启用";
    setConfirmDialog({
      open: true,
      title: `确认${action}`,
      description:
        newStatus === "停用"
          ? `确认停用用户"${user.name || user.loginPhone}"？停用后该用户登录时将显示"该账号已停用，请联系管理员"`
          : `确认启用用户"${user.name || user.loginPhone}"？`,
      onConfirm: () => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, status: newStatus } : u
          )
        );
        toast.success(`已${action}用户`);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">移动端用户管理</h1>
        <button
          onClick={handleAddUser}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增用户
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 text-sm">
        <span className="text-muted-foreground">
          总注册用户数：<span className="text-foreground font-medium">500</span>
        </span>
        <span className="text-muted-foreground">
          总录音人数量：<span className="text-foreground font-medium">700</span>
        </span>
      </div>

      {/* 筛选行 - 优化为双行布局 */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        {/* 第一行：核心筛选与操作按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* ID 搜索 */}
            <div className="relative group">
              <input
                className="h-9 w-36 px-3 text-sm border border-border rounded-md bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring pr-8"
                placeholder="ID"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
              />
              {filterId && (
                <X
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => setFilterId("")}
                />
              )}
            </div>

            {/* 登录账号 */}
            <div className="relative group">
              <input
                className="h-9 w-40 px-3 text-sm border border-border rounded-md bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring pr-8"
                placeholder="登录账号(手机号)"
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
              />
              {filterPhone && (
                <X
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => setFilterPhone("")}
                />
              )}
            </div>

            {/* 姓名 */}
            <div className="relative group">
              <input
                className="h-9 w-36 px-3 text-sm border border-border rounded-md bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring pr-8"
                placeholder="姓名"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              {filterName && (
                <X
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => setFilterName("")}
                />
              )}
            </div>

            <ClearableSelect
              options={USER_ROLES.map(r => ({ label: r, value: r }))}
              value={filterRole}
              onValueChange={setFilterRole}
              placeholder="请选择角色"
              className="w-36 h-9"
            />
            <ClearableSelect
              options={USER_STATUSES.map(s => ({ label: s, value: s }))}
              value={filterStatus}
              onValueChange={setFilterStatus}
              placeholder="请选择状态"
              className="w-32 h-9"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 h-9 px-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "收起" : "展开"}
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 px-4 gap-2 border-border text-foreground hover:bg-accent"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
            <Button
              size="sm"
              onClick={handleQuery}
              className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              查询
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

        {/* 第二行：折叠展示次要筛选项 */}
        {expanded && (
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100/50">
            <ClearableSelect
              options={DEVICE_TYPES.map(t => ({ label: t, value: t }))}
              value={filterDeviceType}
              onValueChange={setFilterDeviceType}
              placeholder="请选择端侧类型"
              className="w-40 h-9"
            />
            <div className="relative group">
              <input
                className="h-9 w-40 px-3 text-sm border border-border rounded-md bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring pr-8"
                placeholder="端侧型号"
                value={filterDeviceModel}
                onChange={(e) => setFilterDeviceModel(e.target.value)}
              />
              {filterDeviceModel && (
                <X
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => setFilterDeviceModel("")}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>登录账号</th>
                <th>姓名</th>
                <th>角色</th>
                <th>端侧类型</th>
                <th>端侧型号</th>
                <th>创建时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted-foreground py-8">
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>
                      {totalCount - ((currentPage - 1) * itemsPerPage + index)}
                    </td>
                    <td>{maskPhone(user.loginPhone)}</td>
                    <td>{maskName(user.name)}</td>
                    <td>{user.role}</td>
                    <td>{user.deviceType || "-"}</td>
                    <td>{user.deviceModel || "-"}</td>
                    <td className="text-xs text-muted-foreground">
                      {user.createTime}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs ${user.status === "启用"
                          ? "text-green-600"
                          : "text-red-500"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.status === "启用"
                            ? "bg-green-500"
                            : "bg-red-500"
                            }`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={() => handleEditUser(user)}
                        >
                          编辑用户信息
                        </button>
                        <button
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={() =>
                            navigate(
                              `/dashboard/mobile-users/${user.id}/recorders`
                            )
                          }
                        >
                          录音人管理
                        </button>
                          <button
                            className="text-xs text-primary hover:text-primary/80"
                            onClick={() => handleResetPassword(user)}
                          >
                            重置密码
                          </button>
                          <button
                            className={`text-xs ${user.status === "启用"
                              ? "text-destructive hover:text-destructive/80"
                              : "text-green-600 hover:text-green-500"
                              }`}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.status === "启用" ? "停用" : "启用"}
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
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              展示 {(currentPage - 1) * itemsPerPage + 1} 到{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}，共{" "}
              {filteredUsers.length} 条数据
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
                    className={`px-3 py-1 text-sm border rounded ${page === currentPage
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

      {/* Edit User Dialog */}
      <EditMobileUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode={editDialogMode}
        user={editingUser}
        onSave={handleSaveUser}
      />

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm}>
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MobileUserList;
