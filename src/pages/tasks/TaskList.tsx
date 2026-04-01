import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { mockTasks, mockAgentRecovery, mockNonAgentRecovery } from "./mockData";
import type { TaskRecord, AgentRecoveryRecord, NonAgentRecoveryRecord } from "./types";
import { STORAGE_KEYS, getStorageData, setStorageData } from "@/utils/storage";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay, parse, isAfter } from "date-fns";
import { ClearableSelect } from "@/components/ClearableSelect";
import { MultiSelectFuzzySearch } from "@/components/MultiSelectFuzzySearch";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";



// 徽章样式辅助函数
const purposeBadgeClass = (purpose: string) => {
  switch (purpose) {
    case "暂无":
      return "border border-green-300 text-green-600 bg-green-50";
    case "训练集":
      return "border border-green-300 text-green-600 bg-green-50";
    case "测试集":
      return "border border-blue-300 text-blue-600 bg-blue-50";
    case "调优集":
      return "border border-purple-300 text-purple-600 bg-purple-50";
    default:
      return "border border-gray-300 text-gray-600 bg-gray-50";
  }
};

const TaskList = () => {
  const navigate = useNavigate();

  // 筛选状态
  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [filterRecordingType, setFilterRecordingType] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");
  const [filterInitiator, setFilterInitiator] = useState("");
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPublished, setFilterPublished] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // 数据状态（持久化）
  const [tasks, setTasks] = useState<TaskRecord[]>(() => {
    const savedTasks = getStorageData(STORAGE_KEYS.TASKS, mockTasks);
    // 强制迁移：解决缓存导致的“已结束”残留及缺少 updateTime 的问题
    return savedTasks.map(t => ({
      ...t,
      status: (t.status as string) === "已结束" ? "已完成" as const : t.status,
      updateTime: t.updateTime || t.createTime
    }));
  });

  // UI 状态
  const [expanded, setExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [goToPage, setGoToPage] = useState("");

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => { } });

  // 核心业务逻辑：计算任务的有效状态
  const processedTasks = useMemo(() => {
    return tasks.map((task) => {
      // 业务规则优先级最高：若未发布，则状态强制判定为“草稿”
      if (!task.isPublished) {
        return { ...task, status: "草稿" as const };
      }

      // 既有的状态纠偏：如果从缓存中读到了旧的“已结束”或当前已超时，均视为“已完成”
      if ((task.status as string) === "已结束" || (task.status === "进行中" && isAfter(new Date(), parse(task.endTime, "yyyy/MM/dd HH:mm:ss", new Date())))) {
        return { ...task, status: "已完成" as const };
      }
      return task;
    }).sort((a, b) => {
      const timeA = parse(a.updateTime || a.createTime, "yyyy/MM/dd HH:mm:ss", new Date()).getTime();
      const timeB = parse(b.updateTime || b.createTime, "yyyy/MM/dd HH:mm:ss", new Date()).getTime();
      return timeB - timeA;
    });
  }, [tasks]);

  // 筛选逻辑
  const filteredTasks = useMemo(() => {
    return processedTasks.filter((task) => {
      if (filterSearchTerm) {
        const term = filterSearchTerm.toLowerCase();
        if (!(task.id.toLowerCase().includes(term) || task.title.toLowerCase().includes(term))) return false;
      }
      if (filterRecordingType && task.recordingType !== filterRecordingType) return false;
      if (filterPurpose && task.taskPurpose !== filterPurpose) return false;
      if (filterInitiator && !task.initiator.toLowerCase().includes(filterInitiator.toLowerCase())) return false;

      if (filterDateRange?.from) {
        // 根据合并筛选的需求，时间范围筛选使用创建时间 (createTime)
        const taskDate = parse(task.createTime, "yyyy/MM/dd HH:mm:ss", new Date());
        const start = startOfDay(filterDateRange.from);
        const end = filterDateRange.to ? endOfDay(filterDateRange.to) : endOfDay(filterDateRange.from);
        if (!isWithinInterval(taskDate, { start, end })) return false;
      }

      if (filterStatus && task.status !== filterStatus) return false;
      if (filterPublished) {
        const isPublished = filterPublished === "是";
        if (task.isPublished !== isPublished) return false;
      }
      return true;
    });
  }, [
    processedTasks,
    filterSearchTerm,
    filterRecordingType,
    filterPurpose,
    filterInitiator,
    filterDateRange,
    filterStatus,
    filterPublished
  ]);


  // 分页数据计算
  const totalCount = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReset = () => {
    setFilterSearchTerm("");
    setFilterRecordingType("");
    setFilterPurpose("");
    setFilterInitiator("");
    setFilterDateRange(undefined);
    setFilterStatus("");
    setFilterPublished("");
    setCurrentPage(1);
    toast.success("筛选条件已重置");
  };

  const handleQuery = () => {
    setCurrentPage(1);
  };

  // 复选框处理程序
  const allSelected =
    paginatedTasks.length > 0 &&
    paginatedTasks.every((t) => selectedRows.has(t.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedTasks.map((t) => t.id)));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 导航辅助函数
  const handleRecoveryDetail = (task: TaskRecord) => {
    if (task.isAgentMode) {
      navigate(`/dashboard/tasks/${task.id}/recovery`);
    } else {
      navigate(`/dashboard/tasks/${task.id}/recovery-plan`);
    }
  };

  const handleTaskDetail = (task: TaskRecord) => {
    navigate(`/dashboard/tasks/${task.id}/detail`);
  };

  // 带有确认环节的操作处理程序完成翻译
  const handleStopTask = (task: TaskRecord) => {
    setConfirmDialog({
      open: true,
      title: "停用任务",
      description: `确定要停用任务「${task.title}」吗？`,
      onConfirm: () => {
        const newTasks = tasks.map(t => t.id === task.id ? { ...t, status: "已完成" as const } : t);
        setTasks(newTasks);
        setStorageData(STORAGE_KEYS.TASKS, newTasks);
        toast.success(`任务「${task.title}」已停用`);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleDeleteTask = (task: TaskRecord) => {
    setConfirmDialog({
      open: true,
      title: "删除任务",
      description: `确定要删除任务「${task.title}」吗？此操作不可恢复。`,
      onConfirm: () => {
        const newTasks = tasks.filter(t => t.id !== task.id);
        setTasks(newTasks);
        setStorageData(STORAGE_KEYS.TASKS, newTasks);
        toast.success(`任务「${task.title}」已删除`);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleArchiveTask = (task: TaskRecord) => {
    // 检查是否存在“进行中”的子任务分配
    const hasActiveAssignments = task.isAgentMode 
      ? getStorageData<AgentRecoveryRecord[]>(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery).some(r => r.taskId === task.id && r.status === "进行中")
      : getStorageData<NonAgentRecoveryRecord[]>(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery).some(r => r.taskId === task.id && r.status === "进行中");

    setConfirmDialog({
      open: true,
      title: "任务归档",
      description: hasActiveAssignments 
        ? `任务「${task.title}」仍有正在进行的分配，归档将强制结束这些分配并停用任务。确定要继续吗？`
        : `确定要归档任务「${task.title}」吗？`,
      onConfirm: () => {
        // 1. 更新主任务状态
        const newTasks = tasks.map(t => t.id === task.id ? { ...t, status: "已归档" as const } : t);
        setTasks(newTasks);
        setStorageData(STORAGE_KEYS.TASKS, newTasks);

        // 2. 如果有活跃分配，级联更新分配状态为已完成
        if (hasActiveAssignments) {
          if (task.isAgentMode) {
            const records = getStorageData<AgentRecoveryRecord[]>(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery);
            const newRecords = records.map(r => r.taskId === task.id ? { ...r, status: "已完成" as const } : r);
            setStorageData(STORAGE_KEYS.AGENT_RECOVERY, newRecords);
          } else {
            const records = getStorageData<NonAgentRecoveryRecord[]>(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery);
            const newRecords = records.map(r => r.taskId === task.id ? { ...r, status: "已完成" as const } : r);
            setStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, newRecords);
          }
        }

        toast.success(`任务「${task.title}」已归档`);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleEnableTask = (task: TaskRecord) => {
    setConfirmDialog({
      open: true,
      title: "启用任务",
      description: `确定要启用任务「${task.title}」吗？`,
      onConfirm: () => {
        const newTasks = tasks.map(t => t.id === task.id ? { ...t, status: "进行中" as const } : t);
        setTasks(newTasks);
        setStorageData(STORAGE_KEYS.TASKS, newTasks);
        toast.success(`任务「${task.title}」已启用`);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };


  const handleDownload = (task: TaskRecord) => {
    toast.success(`任务「${task.title}」正在下载`);
  };

  // 根据任务状态渲染操作按钮
  const renderActions = (task: TaskRecord) => {
    switch (task.status as string) {
      case "草稿":
        return (
          <>
            <button
              className="text-primary hover:text-primary/80"
              onClick={() => navigate(`/dashboard/tasks/edit/${task.id}`)}
            >
              编辑
            </button>
            <button
              className="text-destructive hover:text-destructive/80"
              onClick={() => handleDeleteTask(task)}
            >
              删除
            </button>
          </>
        );
      case "进行中":
        return (
          <>
            <button
              className="text-primary hover:text-primary/80"
              onClick={() => handleRecoveryDetail(task)}
            >
              任务分配详情
            </button>
            <button
              className="text-primary hover:text-primary/80"
              onClick={() => handleStopTask(task)}
            >
              停用任务
            </button>
            <button
              className="text-destructive hover:text-destructive/80"
              onClick={() => handleDeleteTask(task)}
            >
              删除
            </button>
          </>
        );
      case "已完成":
      case "已结束": // 兼容旧数据
        {
          const isExpired = isAfter(new Date(), parse(task.endTime, "yyyy/MM/dd HH:mm:ss", new Date()));
          return (
            <>
              <button
                className="text-primary hover:text-primary/80"
                onClick={() => handleRecoveryDetail(task)}
              >
                任务分配详情
              </button>
              {!isExpired && (
                <button
                  className="text-primary hover:text-primary/80"
                  onClick={() => handleEnableTask(task)}
                >
                  启用任务
                </button>
              )}
              <button
                className="text-primary hover:text-primary/80"
                onClick={() => handleArchiveTask(task)}
              >
                任务归档
              </button>
              <button
                className="text-destructive hover:text-destructive/80"
                onClick={() => handleDeleteTask(task)}
              >
                删除
              </button>
            </>
          );
        }
      case "已归档":
        return (
          <>
            <button
              className="text-primary hover:text-primary/80"
              onClick={() => handleRecoveryDetail(task)}
            >
              任务分配详情
            </button>
            <button
              className="text-primary hover:text-primary/80"
              onClick={() => handleDownload(task)}
            >
              下载
            </button>
          </>
        );
      default:
        return null;
    }
  };

  // 生成页码列表
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, 4, 5, 6);
      if (currentPage > 6 && currentPage < totalPages - 1) {
        pages.push("ellipsis", currentPage);
      } else {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPage("");
    }
  };

  // 通用 Select 样式类
  const selectCls =
    "h-8 px-3 text-sm border border-border rounded-md bg-background text-foreground appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 标题 */}
      <h1 className="text-xl font-semibold text-foreground">任务管理</h1>

      {/* 筛选行 - 优化为双行逻辑布局，确保按钮位置稳定 */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        {/* 第一行：核心筛选 + 操作按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* 核心筛选 - 任务单项模糊搜索 */}
            <div className="relative group">
              <input
                className="h-9 w-64 px-3 text-sm border border-border rounded-md bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring pr-8"
                placeholder="搜索任务ID或任务标题..."
                value={filterSearchTerm}
                onChange={(e) => setFilterSearchTerm(e.target.value)}
              />
              {filterSearchTerm && (
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-full px-1 flex items-center cursor-pointer hover:bg-muted/50 rounded-sm transition-colors z-10 group/clear"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFilterSearchTerm("");
                  }}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground group-hover/clear:text-destructive" />
                </div>
              )}
            </div>

            {/* 发起人输入框支持清除 */}
            <div className="relative group">
              <input
                className="h-9 w-40 px-3 text-sm border border-border rounded-md bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring pr-8"
                placeholder="请输入发起人"
                value={filterInitiator}
                onChange={(e) => setFilterInitiator(e.target.value)}
              />
              {filterInitiator && (
                <X
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => setFilterInitiator("")}
                />
              )}
            </div>

            <ClearableSelect
              options={[
                { label: "整份录制", value: "整份录制，重复录制" },
                { label: "定量录制", value: "定量录制，不重复录制" },
              ]}
              value={filterRecordingType}
              onValueChange={setFilterRecordingType}
              placeholder="请选择录制类型"
              className="w-44 h-9"
            />

            <ClearableSelect
              options={[
                { label: "暂无", value: "暂无" },
                { label: "训练集", value: "训练集" },
                { label: "测试集", value: "测试集" },
                { label: "调优集", value: "调优集" },
              ]}
              value={filterPurpose}
              onValueChange={setFilterPurpose}
              placeholder="请选择任务用途"
              className="w-40 h-9"
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
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/tasks/create")}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              新建任务
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

        {/* 第二行：扩展筛选（仅展开时显示） */}
        {expanded && (
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100/50">
            <DateRangePicker
              dateRange={filterDateRange}
              onSelect={setFilterDateRange}
              placeholder="开始时间 至 结束时间"
              className="w-[260px] h-9"
            />
            <ClearableSelect
              options={[
                { label: "进行中", value: "进行中" },
                { label: "已完成", value: "已完成" },
                { label: "已归档", value: "已归档" },
              ]}
              value={filterStatus}
              onValueChange={setFilterStatus}
              placeholder="请选择任务状态"
              className="w-40 h-9"
            />
            <ClearableSelect
              options={[
                { label: "是", value: "是" },
                { label: "否", value: "否" },
              ]}
              value={filterPublished}
              onValueChange={setFilterPublished}
              placeholder="请选择是否发布"
              className="w-40 h-9"
            />
          </div>
        )}
      </div>

      {/* 数据表格 */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full whitespace-nowrap">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="accent-primary cursor-pointer"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th>任务标题</th>
                <th>任务ID</th>
                <th>任务类型</th>
                <th>录制类型</th>
                <th>任务用途</th>
                <th>预估份数</th>
                <th>发起人</th>
                <th>需求方信息</th>
                <th>代理人模式</th>
                <th>任务结束时间</th>
                <th>是否发布</th>
                <th>任务状态</th>
                <th>创建时间</th>
                <th>更新时间</th>
                <th className="min-w-[260px] sticky right-0 !bg-card z-20 shadow-[-6px_0_6px_-3px_rgba(0,0,0,0.05)] border-l">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={16}
                    className="text-center text-muted-foreground py-8"
                  >
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => (
                  <tr key={task.id} className="group">
                    <td>
                      <input
                        type="checkbox"
                        className="accent-primary cursor-pointer"
                        checked={selectedRows.has(task.id)}
                        onChange={() => toggleRow(task.id)}
                      />
                    </td>
                    <td>
                      <button
                        className="font-medium text-primary hover:underline text-left"
                        onClick={() => handleTaskDetail(task)}
                      >
                        {task.title}
                      </button>
                    </td>
                    <td className="text-muted-foreground font-mono text-xs">{task.id}</td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded text-xs border border-blue-300 text-blue-500 bg-blue-50">
                        音频
                      </span>
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded text-xs border border-blue-300 text-blue-500 bg-blue-50">
                        {task.recordingType.includes("整份") ? "整份" : "定量"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${purposeBadgeClass(
                          task.taskPurpose
                        )}`}
                      >
                        {task.taskPurpose}
                      </span>
                    </td>
                    <td>{task.estimatedCount}</td>
                    <td>{task.initiator}</td>
                    <td>
                      {task.demandInfo.length > 8 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-4">
                                {task.demandInfo.slice(0, 8)}...
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="max-w-[200px] text-xs leading-relaxed">{task.demandInfo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span>{task.demandInfo}</span>
                      )}
                    </td>
                    <td>{task.isAgentMode ? "是" : "否"}</td>
                    <td className="text-muted-foreground">{task.endTime}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${task.isPublished ? "text-blue-600 bg-blue-50" : "text-gray-400"
                        }`}>
                        {task.isPublished ? "已发布" : "未发布"}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs border ${
                        task.status === "草稿" ? "border-slate-300 text-slate-500 bg-slate-50" :
                        task.status === "进行中" ? "border-green-300 text-green-600 bg-green-50" :
                        (task.status === "已完成" || (task.status as string) === "已结束") ? "border-gray-300 text-gray-500 bg-gray-50" :
                        "border-amber-300 text-amber-600 bg-amber-50"
                        }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground text-xs">{task.createTime}</td>
                    <td className="text-muted-foreground text-xs">{task.updateTime}</td>
                    <td className="sticky right-0 !bg-card z-10 shadow-[-6px_0_6px_-3px_rgba(0,0,0,0.05)] border-l transition-colors group-hover:!bg-accent">
                      <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                        {renderActions(task)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页控制 */}
      <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
        <span>共 {totalCount} 条</span>
        <select
          className="h-7 px-2 text-xs border border-border rounded bg-background cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          value={pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            setPageSize(newSize);
            setCurrentPage(1); // 切换条数时重置到第一页
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
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-accent"
                  }`}
              >
                {p}
              </button>
            )
          )}
          <button
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
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

      {/* 共享确认对话框 */}
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
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskList;
