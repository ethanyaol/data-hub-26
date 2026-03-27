import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Monitor,
  Server,
  ChevronDown,
  ChevronRight,
  FileText,
  LogOut,
  Layers,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { key: "home", label: "首页", icon: <Home className="h-4 w-4" />, path: "/dashboard" },
  {
    key: "multimodal",
    label: "多模态采集",
    icon: <Layers className="h-4 w-4" />,
    children: [
      { key: "overview", label: "数据统计", icon: <BarChart3 className="h-4 w-4" />, path: "/dashboard/overview" },
      { key: "task-mgmt", label: "任务管理", icon: <FileText className="h-4 w-4" />, path: "/dashboard/tasks" },
      { key: "mobile-users", label: "移动端用户管理", icon: <Monitor className="h-4 w-4" />, path: "/dashboard/mobile-users" },
      { key: "server-users", label: "服务端用户管理", icon: <Server className="h-4 w-4" />, path: "/dashboard/user-management" },
    ],
  },
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["multimodal"]);
  const currentUser = localStorage.getItem("auth_user") || "admin";

  const toggleMenu = (key: string) => {
    setExpandedMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    toast.success("已退出登录");
    navigate("/");
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.key);
    const isActive = item.path
      ? item.path === "/dashboard"
        ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
        : location.pathname.startsWith(item.path)
      : false;

    return (
      <div key={item.key}>
        <div
          className={`sidebar-menu-item ${isActive ? "active" : ""}`}
          style={{ paddingLeft: `${16 + depth * 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.key);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
        >
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {hasChildren && (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {item.children!.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 bg-card border-b border-border flex items-center px-4 justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">D</span>
          </div>
          <span className="font-semibold text-foreground">端侧数据采集平台</span>
          <span className="ml-4 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
            数据汇聚中心
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium">{currentUser}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 bg-sidebar border-r border-sidebar-border overflow-y-auto shrink-0">
          <nav className="py-3 space-y-0.5">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
