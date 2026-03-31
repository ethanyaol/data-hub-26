import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Edit, FileText, Settings2, ShieldCheck, 
  LayoutList, Check, Search, Download, ExternalLink,
  Calendar, User, Tag, Info, Mic2, Clock, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockTasks, mockTerms } from "./mockData";
import { cn } from "@/lib/utils";

const TaskDetail = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 模拟加载逻辑
  const task = mockTasks.find(t => t.id === taskId);
  
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

  // 模拟额外的配置信息（在 mockTasks 基础上扩展）
  const detailConfig = {
    recordingMode: "唤醒词",
    speed: "正常语速",
    duration: "1.5s - 3.0s",
    termLength: "短词条",
    proxyMode: task.isAgentMode ? "开启代理" : "关闭代理",
    instructionText: "# 采集任务说明\n\n1. 请在安静环境下录制\n2. 语速保持自然中等\n3. 避免吞音或喷麦\n4. 每个词条录制一遍即可",
    hasPrivacy: true
  };

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: any }) => (
    <div className="flex items-center py-3 border-b border-border/40 last:border-0 group">
      <div className="w-32 shrink-0 flex items-center gap-2 text-muted-foreground text-sm">
        {Icon && <Icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />}
        <span>{label}</span>
      </div>
      <div className="flex-1 text-sm font-medium text-foreground">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 顶部导航区 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <button 
              onClick={() => navigate("/dashboard/tasks")}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              任务管理
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">任务详情</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
            <Badge className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
              task.status === "进行中" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
              task.status === "已结束" ? "bg-slate-50 text-slate-500 border-slate-200" :
              "bg-amber-50 text-amber-600 border-amber-200"
            )}>
              {task.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[11px]">{task.id}</span>
            <span>·</span>
            <span>创建于 {task.createTime}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/tasks")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10">
            <Edit className="w-4 h-4 mr-2" />
            编辑任务
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧及中间：主要详情 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 基础配置与规格预览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/60" />
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FileText className="w-5 h-5 text-blue-600/70" />
                <CardTitle className="text-base">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <InfoRow label="发起人" value={task.initiator} icon={User} />
                <InfoRow label="任务类型" value={task.taskType} icon={Mic2} />
                <InfoRow label="标签分类" value={task.tag || "通用"} icon={Tag} />
                <InfoRow label="结束日期" value={task.endTime} icon={Calendar} />
                <div className="pt-3">
                  <span className="text-muted-foreground text-xs block mb-1.5">需求方信息:</span>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm leading-relaxed italic text-muted-foreground border border-border/40">
                    "{task.demandInfo}"
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600/60" />
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Settings2 className="w-5 h-5 text-emerald-600/70" />
                <CardTitle className="text-base">规格参数</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <InfoRow label="录制模式" value={task.recordingType} icon={Layers} />
                <InfoRow label="预估份数" value={task.estimatedCount} icon={Check} />
                <InfoRow label="录制内容" value={detailConfig.recordingMode} icon={Mic2} />
                <InfoRow label="任务用途" value={task.taskPurpose} icon={Tag} />
                <InfoRow label="语速要求" value={detailConfig.speed} icon={Clock} />
                <InfoRow label="有效时长" value={detailConfig.duration} icon={Clock} />
                <InfoRow label="词条长度" value={detailConfig.termLength} icon={Info} />
                <InfoRow label="代理人模式" value={detailConfig.proxyMode} icon={ShieldCheck} />
              </CardContent>
            </Card>
          </div>

          {/* 词条数据表格 */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <LayoutList className="w-5 h-5 text-primary/70" />
                <CardTitle className="text-base">关联词条清单</CardTitle>
                <Badge variant="secondary" className="ml-2 bg-muted/50 text-[10px] font-normal">
                  {mockTerms.length} 条记录
                </Badge>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  placeholder="搜索词条内容..." 
                  className="pl-9 h-8 text-xs bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-t border-border/40">
                  <thead className="bg-muted/20 text-muted-foreground/70 text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3 text-left w-20">序号</th>
                      <th className="px-4 py-3 text-left">词条内容 (Text)</th>
                      <th className="px-4 py-3 text-left w-32">更新时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {mockTerms
                      .filter(t => t.text.includes(searchTerm))
                      .map((term, idx) => (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-4 font-medium text-foreground max-w-md truncate">
                          {term.text}
                        </td>
                        <td className="px-4 py-4 text-xs text-muted-foreground tabular-nums">
                          {task.createTime.split(' ')[0]} {/* 模拟更新时间 */}
                        </td>
                      </tr>
                    ))}
                    {mockTerms.filter(t => t.text.includes(searchTerm)).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic text-xs">
                          没有找到匹配的词条
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：资源预览与状态摘要 */}
        <div className="space-y-8">
          <Card className="border-border/60 shadow-sm overflow-hidden bg-primary/5 border-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                采集资源预览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-background border border-border shadow-sm group cursor-pointer hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">任务说明文档</h4>
                      <p className="text-[10px] text-muted-foreground">Markdown 格式渲染</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="h-24 bg-muted/30 rounded p-2 overflow-hidden text-[10px] text-muted-foreground/60 leading-relaxed blur-[0.5px]">
                  {detailConfig.instructionText}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border shadow-sm group cursor-pointer hover:border-emerald-400/40 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">用户授权协议</h4>
                      <p className="text-[10px] text-muted-foreground">已开启数字签名合规</p>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-md font-medium">
                  <Check className="w-3 h-3" />
                  采集隐私协议已锁定，受托法律效力
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                任务轨迹摘要
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-6">
              {[
                { title: "任务正式发布", time: task.createTime, user: task.initiator, desc: "完成最终规格锁定并全网分发" },
                { title: "初始模板定义", time: "2025/12/19 14:20", user: "系统管理员", desc: "创建了任务骨架并配置了基础采集规格" },
              ].map((log, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-muted/50 last:border-0 pb-6 last:pb-0">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-muted-foreground/20 border-2 border-background" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold flex items-center justify-between">
                      {log.title}
                      <span className="text-[10px] font-normal text-muted-foreground italic font-mono">{log.time}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{log.desc}</p>
                    <p className="text-[9px] text-primary/60 inline-block bg-primary/5 px-1.5 py-0.5 rounded uppercase font-bold">
                      Operator: {log.user}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
