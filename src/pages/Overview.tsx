import { useState, useMemo } from "react";
import { Users, FileText, UserCheck, Mic, ArrowUpRight, ArrowDownRight, Minus, CalendarIcon, Download, RotateCcw } from "lucide-react";
import { MultiSelectFuzzySearch, type Option } from "@/components/MultiSelectFuzzySearch";
import { Button } from "@/components/ui/button";

import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ============================================================
// Types
// ============================================================
type Trend = "up" | "down" | "flat";

interface StatCardData {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend: Trend;
  trendLabel: string;
}

// ============================================================
// Mock data — PDF 指标
// ============================================================
const stats: StatCardData[] = [
  {
    label: "移动端用户数（人）",
    value: "4,234",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    trend: "up",
    trendLabel: "+126",
  },
  {
    label: "总录制条数",
    value: "42,340",
    icon: FileText,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    trend: "up",
    trendLabel: "+1,280",
  },
  {
    label: "今日活跃用户数（人）",
    value: "125",
    icon: UserCheck,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    trend: "down",
    trendLabel: "-18",
  },
  {
    label: "今日录制条数",
    value: "1,250",
    icon: Mic,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    trend: "up",
    trendLabel: "+320",
  },
];

const pieData = [
  { name: "进行中", value: 5, color: "#3b82f6" },
  { name: "已完成", value: 3, color: "#60a5fa" },
  { name: "已归档", value: 2, color: "#93c5fd" },
];

const generateBarData = () => {
  const dates = ["12-22", "12-23", "12-24", "12-25", "12-26", "12-27", "12-28", "12-29"];
  return dates.map((date) => ({
    date,
    uploadCount: Math.floor(Math.random() * 200 + 50),
    inspectedCount: Math.floor(Math.random() * 150 + 30),
    activeUsers: Math.floor(Math.random() * 20 + 2),
  }));
};

const mockTasks: Option[] = [
  { value: "task-2", label: "xxxxx任务(进行中)", id: "TASK-20260101" },
  { value: "task-3", label: "xxxxxx任务(已完成)", id: "TASK-20260102" },
  { value: "task-4", label: "多模态语音采集任务A", id: "TASK-20260101" },
  { value: "task-5", label: "图像标注采集任务B", id: "TASK-20260102" },
  { value: "task-6", label: "文本对话采集任务C", id: "TASK-20260103" },
];

// 列表视图 mock 数据
const mockTableData = [
  { id: "TASK-20260101", name: "多模态语音采集任务A", uploadCount: 12580, inspectedCount: 9840, activeUsers: 56 },
  { id: "TASK-20260102", name: "图像标注采集任务B", uploadCount: 8920, inspectedCount: 7100, activeUsers: 34 },
  { id: "TASK-20260103", name: "文本对话采集任务C", uploadCount: 5640, inspectedCount: 5200, activeUsers: 21 },
  { id: "TASK-20260104", name: "视频采集任务D", uploadCount: 3200, inspectedCount: 1800, activeUsers: 15 },
  { id: "TASK-20260105", name: "语音情感采集任务E", uploadCount: 7800, inspectedCount: 6500, activeUsers: 42 },
  { id: "TASK-20260106", name: "多轮对话采集任务F", uploadCount: 2100, inspectedCount: 980, activeUsers: 8 },
  { id: "TASK-20260107", name: "方言语音采集任务G", uploadCount: 4500, inspectedCount: 3200, activeUsers: 28 },
  { id: "TASK-20260108", name: "图文配对采集任务H", uploadCount: 1650, inspectedCount: 1200, activeUsers: 11 },
];

// ============================================================
// Sub-components
// ============================================================

/** 周环比趋势指示器 */
const TrendBadge = ({ trend, label }: { trend: Trend; label: string }) => {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500">
        <ArrowUpRight className="h-3 w-3" />
        {label}
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-500">
        <ArrowDownRight className="h-3 w-3" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" />
      {label}
    </span>
  );
};

/** 统计卡片 — 截图的大数字 + 图标样式 */
const StatCard = ({ stat }: { stat: StatCardData }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 transition-shadow hover:shadow-md cursor-default">
    <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center shrink-0`}>
      <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground truncate">{stat.label}</span>
        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">较上周</span>
        <TrendBadge trend={stat.trend} label={stat.trendLabel} />
      </div>
      <div className="text-3xl font-bold text-blue-600 mt-1 tabular-nums tracking-tight">
        {stat.value}
      </div>
    </div>
  </div>
);

/** 饼图自定义标签 */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {value}个
    </text>
  );
};

// ============================================================
// Page Component
// ============================================================
const Overview = () => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"visual" | "table">("visual");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const barData = useMemo(() => {
    const baseData = generateBarData();
    // 模拟根据选中任务数量调整幅值
    // 如果没有选择，则视为“全部”，此时使用默认生成的数据
    if (selectedTasks.length === 0) return baseData;
    
    // 如果选择了特定任务，模拟其数据量（通常特定任务的数据量会小于整体）
    const factor = Math.max(0.2, selectedTasks.length / mockTasks.length);
    return baseData.map(item => ({
      ...item,
      uploadCount: Math.round(item.uploadCount * factor),
      inspectedCount: Math.round(item.inspectedCount * factor),
      activeUsers: Math.max(1, Math.round(item.activeUsers * factor)),
    }));
  }, [selectedTasks]);
  // 列表视图状态
  const [tableTasks, setTableTasks] = useState<string[]>([]);
  const [tableDateRange, setTableDateRange] = useState<DateRange | undefined>();

  const filteredTableData = useMemo(() => {
    if (tableTasks.length === 0) {
      return mockTableData;
    }
        // 简易模拟筛选：如果选中了任务，通过 ID 进行匹配
    return mockTableData.filter(item => {
      return tableTasks.some(val => {
        const t = mockTasks.find(o => o.value === val);
        return t && item.id === t.id;
      });
    });
  }, [tableTasks]);

  const handleReset = () => {
    setTableTasks([]);
    setTableDateRange(undefined);
  };

  const now = new Date();
  const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── 页面标题 ── */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">数据统计</h1>
        <p className="text-sm text-muted-foreground mt-1">
          数据统计可查看平台重要业务数据信息，包含用户数量、录制条数、活跃用户、任务状态等重要业务信息。
        </p>
      </div>

      {/* ── Tab 切换 ── */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(["visual", "table"] as const).map((tab) => (
            <button
              key={tab}
              className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === tab
                ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full"
                : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "visual" ? "可视化视图" : "列表视图"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "visual" ? (
        <div className="space-y-6">
          {/* ── 总览数据 ── */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-sm" />
                <h2 className="text-sm font-semibold text-foreground">总览数据</h2>
              </div>
              <span className="text-[10px] text-muted-foreground pt-0.5">数据更新时间：{currentTime}</span>
            </div>

            {/* 上：4 张统计卡片 + 右侧饼图 */}
            <div className="flex gap-4">
              {/* 左：2×2 指标卡片 */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <StatCard key={s.label} stat={s} />
                ))}
              </div>

              {/* 右：任务状态饼图 */}
              <div className="w-80 shrink-0 bg-white rounded-xl border border-gray-100 p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-foreground">任务状态</h3>
                </div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${value}个`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-5 pt-2 border-t border-gray-50">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── 任务采集概览 ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-blue-600 rounded-sm" />
              <h2 className="text-sm font-semibold text-foreground">任务采集概览</h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-5">
                <MultiSelectFuzzySearch
                  options={mockTasks}
                  selectedValues={selectedTasks}
                  onSelect={setSelectedTasks}
                  placeholder="选择任务 (留空表示全部)..."
                  className="w-64"
                />
                <DateRangePicker
                  dateRange={dateRange}
                  onSelect={setDateRange}
                  className="w-auto ml-auto"
                />
              </div>

              {/* 图例 */}
              <div className="flex items-center justify-center gap-8 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-blue-500" />
                  <span className="text-xs text-muted-foreground">已上传条数</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-400" />
                  <span className="text-xs text-muted-foreground">已质检条数</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded-full bg-teal-400" />
                  <span className="text-xs text-muted-foreground">活跃人数</span>
                </div>
              </div>

              {/* 图表 */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="uploadCount"
                      name="已上传条数"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="inspectedCount"
                      name="已质检条数"
                      fill="#fbbf24"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="activeUsers"
                      name="活跃人数"
                      stroke="#2dd4bf"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#2dd4bf", strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 列表视图筛选栏 */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MultiSelectFuzzySearch
                  options={mockTasks}
                  selectedValues={tableTasks}
                  onSelect={setTableTasks}
                  placeholder="搜索任务名称/ID..."
                  className="w-64"
                />

                <DateRangePicker
                  dateRange={tableDateRange}
                  onSelect={setTableDateRange}
                  className="w-[260px]"
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 gap-2 border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                  重置
                </Button>
              </div>

              <button
                className="h-9 px-4 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors inline-flex items-center gap-2"
                onClick={() => {
                  const headers = ["任务名称", "任务ID", "已上传条数", "已质检条数", "活跃用户数"];
                  const rows = mockTableData.map((r) => [r.name, r.id, r.uploadCount, r.inspectedCount, r.activeUsers].join(","));
                  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `任务采集概览_${format(new Date(), "yyyyMMdd")}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" />
                下载表格
              </button>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="bg-white rounded-xl border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="font-semibold text-foreground">任务名称</TableHead>
                  <TableHead className="font-semibold text-foreground">任务ID</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">已上传条数</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">已质检条数</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">活跃用户数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTableData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-blue-50/30">
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{row.id}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.uploadCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.inspectedCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.activeUsers.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
