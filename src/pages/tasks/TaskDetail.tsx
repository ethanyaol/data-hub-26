import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Edit, FileText, Settings2, ShieldCheck,
  LayoutList, Check, Search, Download, ExternalLink,
  Calendar, User, Tag, Info, Mic2, Clock, Layers,
  BarChart3, PieChart, Activity, UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockTasks, mockTerms, mockAgentRecovery, mockNonAgentRecovery } from "./mockData";
import { cn } from "@/lib/utils";
import { STORAGE_KEYS, getStorageData } from "@/utils/storage";

const TaskDetail = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"config" | "stats">("config");
  const [isStatsReady, setIsStatsReady] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  const formatNow = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  };

  const handleUpdateData = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setLastUpdateTime(formatNow());
      setIsStatsReady(true);
      setIsCalculating(false);
    }, 1500);
  };

  const [editForm, setEditForm] = useState({
    initiator: "",
    demandInfo: "",
    endTime: "",
    instruction: "# 采集任务说明\n\n1. 请在安静环境下录制\n2. 语速保持自然中等\n3. 避免吞音或喷麦",
    instructionType: "text" as "text" | "file",
    instructionFile: { name: "指导手册_v1.pdf", size: "1.2MB" } as { name: string; size: string } | null
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 模拟加载逻辑
  const task = useMemo(() => {
    const allTasks = getStorageData(STORAGE_KEYS.TASKS, mockTasks);
    return allTasks.find(t => t.id === taskId);
  }, [taskId]);

  useEffect(() => {
    if (task) {
      setEditForm(prev => ({
        ...prev,
        initiator: task.initiator,
        demandInfo: task.demandInfo,
        endTime: task.endTime.split(" ")[0],
        // 模拟识别初始化模式 (如果内容以 # 开头则为文本，否则可能模拟为文件)
        instructionType: task.title.includes("采集") ? "text" : "file"
      }));
    }
  }, [task]);

  const handleFieldChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
    }, 1000);
  };

  const handleCancelEdit = () => {
    if (task) {
      setEditForm({
        initiator: task.initiator,
        demandInfo: task.demandInfo,
        endTime: task.endTime.split(" ")[0],
        instruction: "# 采集任务说明\n\n1. 请在安静环境下录制\n2. 语速保持自然中等\n3. 避免吞音或喷麦",
        instructionType: task.title.includes("采集") ? "text" : "file",
        instructionFile: { name: "指导手册_v1.pdf", size: "1.2MB" }
      });
    }
    setIsDirty(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        instructionType: "file",
        instructionFile: { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)}MB` }
      }));
      setIsDirty(true);
    }
  };

  // 模拟加载逻辑 (已在上方定义)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">正在读取任务深度配置...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
          <Info className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">任务未找到</h2>
        <p className="text-muted-foreground">抱歉，您访问的任务 ID 不存在或已被删除。</p>
        <Button onClick={() => navigate("/dashboard/tasks")}>返回任务列表</Button>
      </div>
    );
  }

  // 获取统计数据 - 从存储中读取真实的分配情况
  const recoveryRecords = task.isAgentMode
    ? getStorageData(STORAGE_KEYS.AGENT_RECOVERY, mockAgentRecovery).filter(r => r.taskId === taskId)
    : getStorageData(STORAGE_KEYS.NON_AGENT_RECOVERY, mockNonAgentRecovery).filter(r => r.taskId === taskId);

  const totalCollected = recoveryRecords.reduce((acc, curr) => acc + (curr.collectedAudioCount || 0), 0);
  const totalTerms = recoveryRecords.reduce((acc, curr) => acc + (curr.estimatedAudioTerms || 0), 0);
  const totalCollectedTerms = recoveryRecords.reduce((acc, curr) => acc + (curr.collectedAudioTerms || 0), 0);
  const progressPercent = task.estimatedCount > 0 ? Math.round((totalCollected / task.estimatedCount) * 100) : 0;

  const InfoRow = ({ label, value, icon: Icon, editable, field, type = "text" }: {
    label: string;
    value: string | React.ReactNode;
    icon?: any;
    editable?: boolean;
    field?: string;
    type?: "text" | "date";
  }) => (
    <div className="flex items-center py-3 border-b border-border/40 last:border-0 group min-h-[52px]">
      <div className="w-32 shrink-0 flex items-center gap-2 text-muted-foreground text-sm">
        {Icon && <Icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />}
        <span>{label}</span>
      </div>
      <div className="flex-1 text-sm font-medium text-foreground">
        {editable ? (
          <Input
            type={type}
            value={value as string}
            onChange={(e) => handleFieldChange(field!, e.target.value)}
            className="h-8 text-sm focus-visible:ring-primary/30 border-transparent hover:border-border focus:border-primary transition-all bg-transparent px-2 -ml-2"
          />
        ) : (
          value || "-"
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 顶部导航与状态 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <button onClick={() => navigate("/dashboard/tasks")} className="hover:text-primary transition-colors flex items-center gap-1">任务管理</button>
            <span>/</span>
            <span className="text-foreground font-medium">任务详情</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
            <Badge className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
              task.status === "进行中" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                task.status === "已完成" ? "bg-slate-50 text-slate-500 border-slate-200" :
                  "bg-amber-50 text-amber-600 border-amber-200"
            )}>
              {task.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">{task.id}</span>
            <span>·</span>
            <span>创建于 {task.createTime}</span>
          </div>
        </div>

      </div>

      {/* Tab 导航 */}
      <div className="flex items-center justify-between border-b border-border mb-2 sticky top-0 bg-background z-10 pt-2 pb-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab("config")}
            className={cn(
              "px-6 py-2.5 text-sm font-bold transition-all relative",
              activeTab === "config" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            任务配置
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={cn(
              "px-6 py-2.5 text-sm font-bold transition-all relative",
              activeTab === "stats" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            任务结果统计
          </button>
        </div>

        {activeTab === "stats" && (
          <div className="flex items-center gap-3 pb-2 pr-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {lastUpdateTime && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full border border-border/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                数据更新于 {lastUpdateTime}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "h-8 text-xs font-bold gap-2 transition-all",
                isCalculating ? "bg-muted cursor-not-allowed" : "hover:bg-primary/5 hover:border-primary/30"
              )}
              onClick={handleUpdateData}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  正在计算...
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  更新数据
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {activeTab === "config" ? (
        <div className="space-y-6">
          {isDirty && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3 text-primary">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">配置已修改</p>
                  <p className="text-[10px] opacity-70">您有未保存的变更，请记得及时提交。</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-9 text-xs font-bold" onClick={handleCancelEdit}>取消重置</Button>
                <Button size="sm" className="h-9 px-6 text-xs bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold" onClick={handleSaveConfig} disabled={isSaving}>
                  {isSaving ? "正在保存中..." : "保存全量变更"}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: 任务基本信息 */}
              <Card className="border-border/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/60" />
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0 font-bold border-blue-200 text-blue-600">1</Badge>
                    <CardTitle className="text-sm font-bold">任务基本信息</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <InfoRow label="任务标题" value={task.title} icon={FileText} />
                  <InfoRow label="发起人" value={editForm.initiator} icon={User} editable field="initiator" />
                  <InfoRow label="任务类型" value={task.taskType} icon={Mic2} />
                  <InfoRow label="需求方信息" value={editForm.demandInfo} icon={Info} editable field="demandInfo" />
                  <InfoRow label="结束日期" value={editForm.endTime} icon={Calendar} editable field="endTime" type="date" />
                </CardContent>
              </Card>

            {/* Step 2: 指标与用途 */}
            <Card className="border-border/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600/60" />
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0 font-bold border-emerald-200 text-emerald-600">2</Badge>
                  <CardTitle className="text-sm font-bold">指标与用途</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <InfoRow label="录制模式" value={task.recordingType} icon={Layers} />
                <InfoRow label="预估份数" value={`${task.estimatedCount} 份`} icon={Check} />
                <InfoRow label="任务用途" value={task.taskPurpose} icon={Tag} />
                <InfoRow label="词条长度" value="短词条" icon={Settings2} />
                <InfoRow label="代理人模式" value={task.isAgentMode ? "开启代理" : "关闭代理"} icon={ShieldCheck} />
              </CardContent>
            </Card>

            {/* Step 4: 录制词条清单 */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0 font-bold border-slate-200 text-slate-600">4</Badge>
                  <CardTitle className="text-sm font-bold">关联词条清单</CardTitle>
                </div>
                <div className="relative w-48 scale-90 origin-right">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input placeholder="搜索词条..." className="pl-9 h-7 text-[10px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/30 sticky top-0 z-10">
                    <tr className="text-muted-foreground font-bold uppercase tracking-wider border-b">
                      <th className="px-4 py-2.5 text-left w-16">序号</th>
                      <th className="px-4 py-2.5 text-left">词条内容 (Text)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {mockTerms.filter(t => t.text.includes(searchTerm)).map((term, i) => (
                      <tr key={i} className="hover:bg-muted/5 group">
                        <td className="px-4 py-3 text-muted-foreground font-mono">{i + 1}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{term.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Step 3: 说明与协议 */}
            <Card className="border-border/60 shadow-sm relative overflow-hidden bg-muted/5">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-600/60" />
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0 font-bold border-amber-200 text-amber-600">3</Badge>
                  <CardTitle className="text-sm font-bold">说明与协议</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="p-3 border rounded-lg bg-background group hover:border-primary/30 transition-all overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-blue-100 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold">采集指导说明 (任务说明)</span>
                        <div className="flex gap-2 mt-0.5">
                          <button
                            onClick={() => handleFieldChange("instructionType", "text")}
                            className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded transition-all", editForm.instructionType === "text" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted")}
                          >
                            文本模式
                          </button>
                          <button
                            onClick={() => handleFieldChange("instructionType", "file")}
                            className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded transition-all", editForm.instructionType === "file" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted")}
                          >
                            文件模式
                          </button>
                        </div>
                      </div>
                    </div>
                    {editForm.instructionType === "file" && (
                      <label className="cursor-pointer">
                        <Input type="file" className="hidden" onChange={handleFileUpload} />
                        <div className="flex items-center gap-1 text-[10px] text-primary font-bold hover:underline">
                          <Download className="w-3 h-3 rotate-180" /> 更换文件
                        </div>
                      </label>
                    )}
                  </div>

                  {editForm.instructionType === "text" ? (
                    <textarea
                      className="w-full min-h-[120px] bg-muted/20 rounded-md p-2 text-[10px] text-muted-foreground ring-0 border-0 focus:ring-1 focus:ring-primary/20 resize-none font-mono leading-relaxed"
                      value={editForm.instruction}
                      onChange={(e) => handleFieldChange("instruction", e.target.value)}
                      placeholder="请输入采集任务详细指导说明..."
                    />
                  ) : (
                    <div className="p-4 bg-muted/20 rounded-md border border-dashed border-border flex flex-col items-center justify-center text-center group/file relative min-h-[120px] animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center mb-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-[10px] font-bold text-foreground mb-1">{editForm.instructionFile?.name || "未选择文件"}</p>
                      <p className="text-[8px] text-muted-foreground uppercase">{editForm.instructionFile?.size || "0 KB"}</p>
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/file:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <label className="cursor-pointer scale-90">
                          <Input type="file" className="hidden" onChange={handleFileUpload} />
                          <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1.5 border-primary/20 hover:bg-primary hover:text-white transition-all">
                            <Edit className="w-3 h-3" /> 点击上传新指导文件
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border rounded-lg bg-background group cursor-pointer hover:border-emerald-400/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-emerald-100 flex items-center justify-center"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <span className="text-[11px] font-bold">隐私授权协议</span>
                    </div>
                    <Download className="w-3 h-3 text-muted-foreground group-hover:text-emerald-600" />
                  </div>
                  <Badge variant="secondary" className="w-full justify-start gap-1.5 py-1 text-[9px] bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    <Check className="w-2.5 h-2.5" /> 数字化合规签署已生效
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm bg-muted/5 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-[11px] font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> 任务发布日志
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {[
                  { title: "全量正式发布", time: task.createTime, user: "admin", color: "bg-blue-600" },
                  { title: "规格初始定义", time: "2025/12/19 14:20", user: "system", color: "bg-slate-400" },
                ].map((log, i) => (
                  <div key={i} className="relative pl-5 border-l border-muted-foreground/20 last:border-0 pb-4 last:pb-0">
                    <div className={`absolute -left-1 top-0 w-2 h-2 rounded-full ${log.color}`} />
                    <p className="text-[11px] font-bold">{log.title}</p>
                    <p className="text-[9px] text-muted-foreground mb-1 tabular-nums italic">{log.time}</p>
                    <span className="text-[8px] bg-muted/40 px-1 py-0.5 rounded text-muted-foreground">操作人: {log.user}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      ) : (
        <div className="space-y-6">
          {!isStatsReady ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-border/60 rounded-xl bg-muted/5 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6 relative">
                <BarChart3 className="w-10 h-10 text-muted-foreground/40" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                  <Search className="w-3 h-3 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">暂无统计数据</h3>
              <p className="text-sm text-muted-foreground max-w-xs text-center mb-8">
                当前任务统计数据尚未生成。点击右上角的“更新数据”按钮，系统将立即进行全链路数据跑批计算。
              </p>
              <Button
                onClick={handleUpdateData}
                disabled={isCalculating}
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-8 font-bold"
              >
                {isCalculating ? "正在深度计算中..." : "立即开始计算"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 宏观统计概览 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. 录制总份数 */}
                <Card className="shadow-sm border-border/60 hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-1 pt-4 px-4 flex-row items-center justify-between space-y-0">
                    <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">录制总份数</CardDescription>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-2">
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-2xl font-black tabular-nums tracking-tighter">{totalCollected}</span>
                      <span className="text-xs font-bold text-muted-foreground">/ {task.estimatedCount} 份</span>
                    </div>
                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden ring-1 ring-border/5">
                      <div className="bg-blue-600 h-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      已回收 {progressPercent}%
                    </p>
                  </CardContent>
                </Card>

                {/* 2. 音频回收量 */}
                <Card className="shadow-sm border-border/60 hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-1 pt-4 px-4 flex-row items-center justify-between space-y-0">
                    <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">音频上传量</CardDescription>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-2">
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-2xl font-black tabular-nums tracking-tighter">{totalCollectedTerms}</span>
                      <span className="text-xs font-bold text-muted-foreground">/ {totalTerms} 条</span>
                    </div>
                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden ring-1 ring-border/5">
                      <div className="bg-emerald-600 h-full transition-all duration-700 ease-out" style={{ width: `${totalTerms > 0 ? (totalCollectedTerms / totalTerms) * 100 : 0}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      已上传 {totalTerms > 0 ? Math.round((totalCollectedTerms / totalTerms) * 100) : 0}%
                    </p>
                  </CardContent>
                </Card>

                {/* 3. 总体验收率 */}
                <Card className="shadow-sm border-border/60 hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-1 pt-4 px-4 flex-row items-center justify-between space-y-0">
                    <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">验收通过率</CardDescription>
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-2">
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-2xl font-black tabular-nums tracking-tighter">92.5</span>
                      <span className="text-xs font-bold text-muted-foreground">%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden ring-1 ring-border/5">
                      <div className="bg-amber-500 h-full transition-all duration-700 ease-out" style={{ width: '92.5%' }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium flex justify-between">
                      <span>通过 1,850 条</span>
                    </p>
                  </CardContent>
                </Card>

                {/* 4. 发音人性别比 */}
                <Card className="shadow-sm border-border/60 overflow-hidden relative group hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-1 pt-4 px-4 flex-row items-center justify-between space-y-0">
                    <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">发音人性别比</CardDescription>
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                      <PieChart className="w-4 h-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-2">
                    <div className="flex justify-between items-end mb-2.5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 mb-0.5 opacity-80">
                          <User className="w-2.5 h-2.5 text-blue-600" />
                          <span className="text-[9px] font-bold text-blue-600">男</span>
                        </div>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl font-black tabular-nums tracking-tighter">52</span>
                          <span className="text-[9px] font-bold text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 mb-0.5 opacity-80">
                          <span className="text-[9px] font-bold text-rose-500">女</span>
                          <UserCheck className="w-2.5 h-2.5 text-rose-500" />
                        </div>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl font-black tabular-nums tracking-tighter text-right text-rose-500">48</span>
                          <span className="text-[9px] font-bold text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-muted/50 rounded-full flex overflow-hidden ring-1 ring-border/20">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-blue-600 h-full transition-all duration-700 ease-out hover:brightness-110 cursor-help" style={{ width: '52%' }} />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-[10px]">1040 人</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-rose-500 h-full transition-all duration-700 ease-out hover:brightness-110 cursor-help" style={{ width: '48%' }} />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-[10px]">960 人</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="mt-2.5 flex justify-between text-[9px] font-bold text-muted-foreground/50 tracking-tight">
                      <span className="flex items-center gap-1">1,040 人</span>
                      <span className="flex items-center gap-1">960 人</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 2. 全链路监控区域 (Workflow Monitor) */}
              <Card className="border-border/60 shadow-sm overflow-hidden bg-muted/5">
                <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      <CardTitle className="text-base font-bold">全链路生命周期监控</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border/50">
                    {/* 分配环节 */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" /> 1. 分配与激活
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-1">分配覆盖率</p>
                          <p className="text-lg font-black text-blue-600">98.5%</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-1">人员激活率</p>
                          <p className="text-lg font-black text-blue-600">84.2%</p>
                        </div>
                      </div>
                    </div>

                    {/* 执行环节 */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" /> 2. 执行与时耗
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-1">人均时效 (TPH)</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-lg font-black text-emerald-600">42.5</p>
                            <span className="text-[10px] text-muted-foreground font-bold">条/H</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-1">交付时耗 (TAT)</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-lg font-black text-emerald-600">28.4</p>
                            <span className="text-[10px] text-muted-foreground font-bold">H</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 验收环节 */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500" /> 3. 验收与损耗
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-1 whitespace-nowrap">一次通过 (FPY)</p>
                          <p className="text-lg font-black text-rose-600">86.4%</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-1 whitespace-nowrap">当前打回量</p>
                          <p className="text-lg font-black text-rose-600">142</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-1 whitespace-nowrap">任务废弃量</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-lg font-black text-rose-600 tracking-tighter">28</p>
                            <span className="text-[10px] text-rose-600/60 font-bold">条</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 数据详情列表 (各分配项明细 - 增强表头) */}
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <LayoutList className="w-4 h-4" /> 分配数据详情
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs min-w-[900px]">
                    <thead className="bg-muted/40">
                      <tr className="text-muted-foreground font-bold border-b">
                        <th className="px-6 py-3 text-left">{task.isAgentMode ? "代理人" : "发音人"}</th>
                        <th className="px-4 py-3 text-center">预估份数</th>
                        <th className="px-4 py-3 text-center">预估条数</th>
                        <th className="px-4 py-3 text-center">已上传条数</th>
                        <th className="px-4 py-3 text-center text-rose-500">已验收通过</th>
                        <th className="px-4 py-3 text-center">通过率</th>
                        <th className="px-4 py-3 text-center">打回量</th>
                        <th className="px-4 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {recoveryRecords.length > 0 ? (
                        recoveryRecords.map((record: any, idx: number) => {
                          // 模拟新指标数据 (数据仅供 UI 演示)
                          const mockRejects = Math.floor(Math.random() * 15);
                          const uploaded = record.collectedAudioTerms || 0;
                          const accepted = uploaded > 0 ? Math.floor(uploaded * (0.88 + Math.random() * 0.1)) : 0;
                          const passRate = uploaded > 0 ? ((accepted / uploaded) * 100).toFixed(1) : "0.0";

                          return (
                            <tr key={idx} className="hover:bg-muted/5 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground">{(record as any).agentName || (record as any).planName || (record as any).personName || "未命名"}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">{(record as any).agentCode || `PLAN-${(record as any).planIndex}`}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center font-mono font-medium">{record.estimatedAudioCount}</td>
                              <td className="px-4 py-4 text-center font-mono text-muted-foreground">{record.estimatedAudioTerms}</td>
                              <td className="px-4 py-4 text-center font-mono">{uploaded}</td>
                              <td className="px-4 py-4 text-center">
                                <span className="font-mono font-bold text-rose-600">{accepted}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="font-bold text-emerald-600">{passRate}%</span>
                                  <div className="w-12 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${passRate}%` }} />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center text-rose-500 font-bold">{mockRejects}</td>
                              <td className="px-4 py-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-[11px] text-primary hover:text-primary/80 hover:bg-primary/5 font-bold"
                                  onClick={() => {
                                    const baseUrl = `/dashboard/tasks/${taskId}`;
                                    const path = task.isAgentMode
                                      ? `recovery/${(record as any).agentCode}`
                                      : `recovery-plan/${(record as any).planIndex}`;
                                    navigate(`${baseUrl}/${path}/execution`);
                                  }}
                                >
                                  详情 <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic text-xs">
                            任务暂未开始分配或数据同步中
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
