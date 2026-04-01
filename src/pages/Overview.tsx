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
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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

// ============================================================
// 列表视图：子维度 Mock 数据
// ============================================================

// 1. 任务维度聚合数据 (Task Dimension)
const aggregatedTaskData = [
  { id: "T001", name: "基础通用采集任务A", totalEst: 500, uploaded: 450, rate: 0.9, fpy: 0.85, tph: 45, tat: 2.1, rejection: 12, discarded: 3 },
  { id: "T002", name: "方言发音采集任务B", totalEst: 300, uploaded: 120, rate: 0.4, fpy: 0.72, tph: 32, tat: 5.6, rejection: 45, discarded: 15 },
  { id: "T003", name: "多模态肢体采集C", totalEst: 1000, uploaded: 820, rate: 0.82, fpy: 0.94, tph: 58, tat: 1.2, rejection: 8, discarded: 0 },
  { id: "T004", name: "特殊场景语义录制D", totalEst: 200, uploaded: 180, rate: 0.9, fpy: 0.88, tph: 24, tat: 3.4, rejection: 18, discarded: 5 },
];

// 2. 发音人维度聚合数据 (Speaker Dimension)
const aggregatedSpeakerData = [
  { id: "S1001", name: "王*明", taskCount: 4, audioCount: 1250, rate: 0.98, fpy: 0.92, tph: 65, tat: 0.8 },
  { id: "S1002", name: "李*华", taskCount: 2, audioCount: 840, rate: 0.85, fpy: 0.76, tph: 42, tat: 2.5 },
  { id: "S1003", name: "张*伟", taskCount: 7, audioCount: 3200, rate: 0.94, fpy: 0.88, tph: 55, tat: 1.1 },
  { id: "S1004", name: "赵*芳", taskCount: 1, audioCount: 450, rate: 0.72, fpy: 0.65, tph: 28, tat: 4.8 },
];

// 3. 代理人维度聚合数据 (Agent Dimension)
const aggregatedAgentData = [
  { id: "A101", name: "华东音频工会", activeTasks: 5, totalQuota: 2000, activationRate: 0.88, teamAudio: 15600, teamRate: 0.92, teamFpy: 0.84, teamTph: 52 },
  { id: "A102", name: "北方声码传媒", activeTasks: 3, totalQuota: 1200, activationRate: 0.95, teamAudio: 10200, teamRate: 0.96, teamFpy: 0.91, teamTph: 68 },
  { id: "A103", name: "西域方言社", activeTasks: 8, totalQuota: 4500, activationRate: 0.45, teamAudio: 21000, teamRate: 0.78, teamFpy: 0.68, teamTph: 35 },
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
  const [tableDimension, setTableDimension] = useState<"task" | "speaker" | "agent">("task");
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
    let sourceData = [];
    if (tableDimension === "task") sourceData = aggregatedTaskData;
    else if (tableDimension === "speaker") sourceData = aggregatedSpeakerData;
    else sourceData = aggregatedAgentData;

    if (tableTasks.length === 0) return sourceData;
    
    return sourceData.filter((item: any) => {
      return tableTasks.some(val => {
        return item.name.includes(val) || item.id.includes(val);
      });
    });
  }, [tableDimension, tableTasks]);

  const handleReset = () => {
    setTableTasks([]);
    setTableDateRange(undefined);
  };

  const now = new Date();
  const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  /** 导出当前维度表格为 CSV */
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (tableDimension === "task") {
      headers = ["任务名称", "任务ID", "总预估份数", "已回收份数", "完成进度", "一次通过率", "录制时效", "平均耗时", "打回量"];
      rows = filteredTableData.map((r: any) => [
        r.name, r.id, r.totalEst, r.uploaded, `${(r.rate * 100).toFixed(1)}%`, `${(r.fpy * 100).toFixed(1)}%`, r.tph, `${r.tat}h`, r.rejection
      ]);
    } else if (tableDimension === "speaker") {
      headers = ["发音人姓名", "人员ID", "参与任务数", "累计录制音频", "综合通过率", "个人一次通过率", "个人录制时效", "平均响应(h)"];
      rows = filteredTableData.map((r: any) => [
        r.name, r.id, r.taskCount, r.audioCount, `${(r.rate * 100).toFixed(1)}%`, `${(r.fpy * 100).toFixed(1)}%`, r.tph, r.tat
      ]);
    } else {
      headers = ["代理人名称", "计划承接总量", "人员激活率", "累计音频量", "团队通过率", "团队一次通过率", "团队录制时效"];
      rows = filteredTableData.map((r: any) => [
        r.name, r.totalQuota, `${(r.activationRate * 100).toFixed(1)}%`, r.teamAudio, `${(r.teamRate * 100).toFixed(1)}%`, `${(r.teamFpy * 100).toFixed(1)}%`, r.teamTph
      ]);
    }

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dimName = tableDimension === 'task' ? '任务' : tableDimension === 'speaker' ? '发音人' : '代理人';
    link.setAttribute("download", `${dimName}维度统计_${format(now, "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          {/* 二级维度切换 (胶囊样) */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-lg w-fit">
            {(["task", "speaker", "agent"] as const).map((dim) => (
              <button
                key={dim}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer",
                  tableDimension === dim
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTableDimension(dim)}
              >
                {dim === "task" ? "任务维度" : dim === "speaker" ? "发音人维度" : "代理人维度"}
              </button>
            ))}
          </div>

          {/* 列表视图筛选栏 */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Input
                  value={tableTasks[0] || ""}
                  onChange={(e) => setTableTasks([e.target.value])}
                  placeholder={
                    tableDimension === "task" ? "搜索任务名称/ID..." :
                    tableDimension === "speaker" ? "搜索发音人姓名/ID..." : "搜索代理人名称/ID..."
                  }
                  className="w-64 h-9"
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
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4" />
                导出当前维度表格
              </button>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 whitespace-nowrap">
                  {tableDimension === "task" ? (
                    <>
                      <TableHead className="font-bold text-foreground">任务名称</TableHead>
                      <TableHead className="font-bold text-foreground">任务ID</TableHead>
                      <TableHead className="font-bold text-foreground text-right">总预估份数</TableHead>
                      <TableHead className="font-bold text-foreground text-right">已回收份数</TableHead>
                      <TableHead className="font-bold text-foreground text-right">完成进度</TableHead>
                      <TableHead className="font-bold text-foreground text-right">一次通过率</TableHead>
                      <TableHead className="font-bold text-foreground text-right">录制时效(条/h)</TableHead>
                      <TableHead className="font-bold text-foreground text-right">平均耗时</TableHead>
                      <TableHead className="font-bold text-foreground text-right text-destructive">打回量</TableHead>
                    </>
                  ) : tableDimension === "speaker" ? (
                    <>
                      <TableHead className="font-bold text-foreground">发音人姓名</TableHead>
                      <TableHead className="font-bold text-foreground">人员ID</TableHead>
                      <TableHead className="font-bold text-foreground text-right">参与任务数</TableHead>
                      <TableHead className="font-bold text-foreground text-right">累计录制音频</TableHead>
                      <TableHead className="font-bold text-foreground text-right">综合通过率</TableHead>
                      <TableHead className="font-bold text-foreground text-right">个人一次通过率</TableHead>
                      <TableHead className="font-bold text-foreground text-right text-blue-600">个人时效(条/h)</TableHead>
                      <TableHead className="font-bold text-foreground text-right">平均响应(h)</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="font-bold text-foreground">代理人名称</TableHead>
                      <TableHead className="font-bold text-foreground text-right">计划承接总量</TableHead>
                      <TableHead className="font-bold text-foreground text-right">人员激活率</TableHead>
                      <TableHead className="font-bold text-foreground text-right">累计音频量</TableHead>
                      <TableHead className="font-bold text-foreground text-right">团队通过率</TableHead>
                      <TableHead className="font-bold text-foreground text-right text-emerald-600">团队一次通过率</TableHead>
                      <TableHead className="font-bold text-foreground text-right">团队时效(条/h)</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTableData.map((row: any) => (
                  <TableRow key={row.id} className="hover:bg-blue-50/30 transition-colors border-b last:border-0">
                    {tableDimension === "task" ? (
                      <>
                        <TableCell className="font-bold text-blue-600 text-xs">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-[10px]">{row.id}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.totalEst}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{row.uploaded}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">
                            {(row.rate * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{(row.fpy * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right tabular-nums font-bold">{row.tph}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.tat}h</TableCell>
                        <TableCell className="text-right tabular-nums text-destructive font-bold">{row.rejection}</TableCell>
                      </>
                    ) : tableDimension === "speaker" ? (
                      <>
                        <TableCell className="font-bold">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-[10px]">{row.id}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.taskCount}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{row.audioCount}</TableCell>
                        <TableCell className="text-right tabular-nums">{(row.rate * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right tabular-nums font-bold">{(row.fpy * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right tabular-nums text-blue-600 font-bold">{row.tph}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.tat}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-bold text-slate-700">{row.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.totalQuota}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold", row.activationRate > 0.8 ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600")}>
                            {(row.activationRate * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{row.teamAudio}</TableCell>
                        <TableCell className="text-right tabular-nums">{(row.teamRate * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right tabular-nums font-bold text-emerald-600">{(row.teamFpy * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right tabular-nums">{row.teamTph}</TableCell>
                      </>
                    )}
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
