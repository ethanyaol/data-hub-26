import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ResetPasswordConfirmDialog } from "@/components/ResetPasswordConfirmDialog";

interface UserRecord {
  id: number;
  loginName: string;
  realName: string;
  email: string;
  tenant: string;
  status: "启用" | "停用";
}

const mockUsers: UserRecord[] = [
  { id: 1, loginName: "xyfan10", realName: "左*****", email: "112****@qq.com", tenant: "AI机构", status: "启用" },
  { id: 2, loginName: "yingwang80", realName: "y*****", email: "", tenant: "AI机构", status: "启用" },
  { id: 3, loginName: "admin2", realName: "安*****", email: "", tenant: "AI机构", status: "启用" },
  { id: 4, loginName: "fywang", realName: "f*****", email: "", tenant: "AI机构", status: "启用" },
  { id: 5, loginName: "cxgong", realName: "c*****", email: "", tenant: "test租户", status: "启用" },
  { id: 6, loginName: "tnwang5", realName: "t*****", email: "", tenant: "测试角色优化机构1", status: "启用" },
  { id: 7, loginName: "tnwang301", realName: "王****", email: "452****@qq.com", tenant: "数据专区朱月", status: "启用" },
  { id: 8, loginName: "user12", realName: "1*", email: "", tenant: "AI能力认证_CP", status: "启用" },
  { id: 9, loginName: "tnwang3", realName: "t*****", email: "452****@qq.com", tenant: "测试角色优化机构1", status: "启用" },
  { id: 10, loginName: "bbchai", realName: "b*****", email: "", tenant: "AI机构", status: "启用" },
];

const UserManagement = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"internal" | "external">("internal");
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 39;
  const totalUsers = 390;

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const filteredUsers = mockUsers.filter((u) => {
    if (searchName && !u.loginName.includes(searchName) && !u.realName.includes(searchName)) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">用户管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          用户管理模块可进行用户管理，在这里可进行用户状态的查看。用户个数: {totalUsers}个
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={userType === "internal"}
              onChange={() => setUserType("internal")}
              className="accent-primary"
            />
            <span className="text-sm">移动内部</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={userType === "external"}
              onChange={() => setUserType("external")}
              className="accent-primary"
            />
            <span className="text-sm">移动外部</span>
          </label>
        </div>

        <Select>
          <SelectTrigger className="w-32 h-9"><SelectValue placeholder="所属公司" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="cmcc">中国移动</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-32 h-9"><SelectValue placeholder="租户名称" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="ai">AI机构</SelectItem>
            <SelectItem value="test">test租户</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9"><SelectValue placeholder="用户状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="启用">启用</SelectItem>
            <SelectItem value="停用">停用</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="登录名称、用户姓名"
            className="w-48 h-9 pr-8"
          />
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Button variant="outline" size="sm" onClick={() => { setSearchName(""); setStatusFilter("all"); }}>
          重置
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/dashboard/user-management/create")}>
            <Plus className="h-4 w-4 mr-1" /> 新建用户
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => toast.info("已刷新")}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th className="w-16">序号</th>
              <th>登录名称</th>
              <th>用户姓名</th>
              <th>邮箱</th>
              <th>所属租户</th>
              <th className="w-24">用户状态</th>
              <th className="w-40">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="text-center">{user.id}</td>
                <td>{user.loginName}</td>
                <td>{user.realName}</td>
                <td>{user.email || "-"}</td>
                <td>{user.tenant}</td>
                <td>
                  <Badge variant={user.status === "启用" ? "default" : "secondary"} className="text-xs">
                    {user.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/dashboard/user-management/edit/${user.id}`)} className="text-xs text-primary hover:text-primary/80">编辑</button>
                    <button onClick={() => navigate(`/dashboard/user-management/detail/${user.id}`)} className="text-xs text-primary hover:text-primary/80">详情</button>
                    <button onClick={() => { setSelectedUser(user); setResetModalOpen(true); }} className="text-xs text-primary hover:text-primary/80">重置密码</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <span>共{totalUsers}条记录</span>
        <span>第 {currentPage}/{totalPages}</span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 border border-border rounded text-xs hover:bg-muted disabled:opacity-50"
          >
            &lt;
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-2.5 py-1 border rounded text-xs ${currentPage === p
                ? "border-primary text-primary bg-primary/5"
                : "border-border hover:bg-muted"
                }`}
            >
              {p}
            </button>
          ))}
          <span className="px-1">...</span>
          <button
            onClick={() => setCurrentPage(totalPages)}
            className={`px-2.5 py-1 border rounded text-xs ${currentPage === totalPages
              ? "border-primary text-primary bg-primary/5"
              : "border-border hover:bg-muted"
              }`}
          >
            {totalPages}
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 border border-border rounded text-xs hover:bg-muted disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      <ResetPasswordConfirmDialog
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;
