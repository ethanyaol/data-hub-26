import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Upload, Download, Trash2, Check, ChevronsUpDown, CalendarIcon,
  FileText, Settings2, ShieldCheck, LayoutList
} from "lucide-react";
import { format, parseISO, parse, isBefore, startOfDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";
import { mockTerms, mockTasks } from "./mockData";
import type { TaskTerm, TaskRecord } from "./types";
import { STORAGE_KEYS, getStorageData, setStorageData } from "@/utils/storage";
import { TASK_PURPOSES, RECORDING_TYPES, LANGUAGES, SPEEDS } from "./types";
import AddTermDialog from "@/components/tasks/AddTermDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// 模拟有权限的发起人数据
const AUTHORIZED_USERS = [
  { realName: "管理员", loginName: "admin" },
  { realName: "左*****", loginName: "xyfan10" },
  { realName: "王****", loginName: "tnwang301" },
  { realName: "蔡**", loginName: "bbchai" },
  { realName: "汪*", loginName: "yingwang80" },
  { realName: "付*", loginName: "fywang" },
  { realName: "陈*", loginName: "cxgong" },
];

const CreateTask = () => {
  const navigate = useNavigate();

  // 表单字段状态
  const [title, setTitle] = useState("");
  const [demandInfo, setDemandInfo] = useState("");
  const [endDate, setEndDate] = useState("");
  const [initiator, setInitiator] = useState("");
  const [instructionMode, setInstructionMode] = useState<"text" | "file">("text");
  const [instructionText, setInstructionText] = useState("");
  const [instructionFile, setInstructionFile] = useState<File | null>(null);
  const [taskPurpose, setTaskPurpose] = useState("暂无");
  const [recordingMode, setRecordingMode] = useState("");
  const [estimatedCount, setEstimatedCount] = useState("");
  const [termLength, setTermLength] = useState("短词条");
  const [privacyFile, setPrivacyFile] = useState<File | null>(null);
  const [agentMode, setAgentMode] = useState("yes");
  const [initiatorOpen, setInitiatorOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { title: "任务基本信息" },
    { title: "采集规格参数" },
    { title: "任务说明与协议" },
    { title: "录制词条" },
  ];

  // 词条相关状态
  const [terms, setTerms] = useState<TaskTerm[]>([...mockTerms]);
  const [selectedTerms, setSelectedTerms] = useState<number[]>([]);
  const [addTermOpen, setAddTermOpen] = useState(false);
  const [editTerm, setEditTerm] = useState<{ recordingType: string; language: string; speed: string; text: string } | null>(null);
  const [editTermIndex, setEditTermIndex] = useState<number | null>(null);

  const [activePreview, setActivePreview] = useState<"instruction" | "privacy">("instruction");
  const [instructionPreviewUrl, setInstructionPreviewUrl] = useState<string | null>(null);
  const [privacyPreviewUrl, setPrivacyPreviewUrl] = useState<string | null>(null);

  // 初始化默认发起人
  useEffect(() => {
    const authUserName = localStorage.getItem("auth_user") || "admin";
    const user = AUTHORIZED_USERS.find(u => u.loginName === authUserName);
    if (user) {
      setInitiator(`${user.realName}(${user.loginName})`);
    } else {
      setInitiator(`${authUserName}(${authUserName})`);
    }
  }, []);

  useEffect(() => {
    if (instructionFile && instructionFile.type === "application/pdf") {
      const url = URL.createObjectURL(instructionFile);
      setInstructionPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setInstructionPreviewUrl(null);
    }
  }, [instructionFile]);

  useEffect(() => {
    if (privacyFile && privacyFile.type === "application/pdf") {
      const url = URL.createObjectURL(privacyFile);
      setPrivacyPreviewUrl(url);
      setActivePreview("privacy"); // 自动切换至协议预览
      return () => URL.revokeObjectURL(url);
    } else {
      setPrivacyPreviewUrl(null);
    }
  }, [privacyFile]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTerms(terms.map((t) => t.termIndex));
    } else {
      setSelectedTerms([]);
    }
  };

  const handleSelectTerm = (termIndex: number, checked: boolean) => {
    if (checked) {
      setSelectedTerms([...selectedTerms, termIndex]);
    } else {
      setSelectedTerms(selectedTerms.filter((i) => i !== termIndex));
    }
  };

  const handleAddTerm = (term: { recordingType: string; language: string; speed: string; text: string }) => {
    if (editTermIndex !== null) {
      // 编辑现有词条
      setTerms(terms.map((t) =>
        t.termIndex === editTermIndex
          ? { ...t, recordingType: term.recordingType, language: term.language, speed: term.speed, text: term.text, updateTime: new Date().toLocaleString() }
          : t
      ));
      setEditTermIndex(null);
      setEditTerm(null);
      toast.success("词条已更新");
    } else {
      // 添加新词条
      const newIndex = terms.length > 0 ? Math.max(...terms.map((t) => t.termIndex)) + 1 : 1;
      const newTerm: TaskTerm = {
        termIndex: newIndex,
        recordingIndex: `new-${Date.now()}`,
        recordingType: term.recordingType,
        language: term.language,
        speed: term.speed,
        text: term.text,
        updateTime: new Date().toLocaleString(),
      };
      setTerms([...terms, newTerm]);
      toast.success("词条已添加");
    }
  };

  const handleEditTerm = (term: TaskTerm) => {
    setEditTerm({
      recordingType: term.recordingType,
      language: term.language,
      speed: term.speed,
      text: term.text,
    });
    setEditTermIndex(term.termIndex);
    setAddTermOpen(true);
  };

  const handleDeleteTerm = (termIndex: number) => {
    setTerms(terms.filter((t) => t.termIndex !== termIndex));
    setSelectedTerms(selectedTerms.filter((i) => i !== termIndex));
    toast.success("词条已删除");
  };

  const handleBatchDelete = () => {
    if (selectedTerms.length === 0) {
      toast.error("请先选择要删除的词条");
      return;
    }
    if (!window.confirm(`确认删除选中的 ${selectedTerms.length} 条词条？`)) return;
    setTerms(terms.filter((t) => !selectedTerms.includes(t.termIndex)));
    setSelectedTerms([]);
    toast.success("批量删除成功");
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!title.trim()) { toast.error("请输入任务名称"); return false; }
        const titleRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
        if (!titleRegex.test(title)) {
          toast.error("任务名称只能包含中英文或数字");
          return false;
        }
        if (/^[a-zA-Z]+$/.test(title) || /^\d+$/.test(title)) {
          toast.error("任务名称不能是纯数字或英文");
          return false;
        }
        if (!endDate) { toast.error("请选择任务结束日期"); return false; }
        const endDateTime = parse(endDate, "yyyy-MM-dd HH:mm:ss", new Date());
        if (isBefore(endDateTime, new Date())) {
          toast.error("任务结束日期不能早于当前时间");
          return false;
        }
        if (!demandInfo.trim()) { toast.error("请输入需求方对任务背景描述、要求等信息，快速了解任务信息"); return false; }
        if (!initiator.trim()) { toast.error("请输入发起人"); return false; }
        if (!agentMode) { toast.error("请选择是否启用代理模式"); return false; }
        return true;
      case 2:
        if (!taskPurpose) { toast.error("请选择任务用途"); return false; }
        if (!termLength) { toast.error("请选择词条长度"); return false; }
        if (!recordingMode) { toast.error("请选择录制类型"); return false; }
        if (!estimatedCount.trim()) { toast.error("请输入预计录制份数"); return false; }
        return true;
      case 3:
        if (instructionMode === "text" && !instructionText.trim()) { toast.error("请输入任务说明"); return false; }
        if (instructionMode === "file" && !instructionFile) { toast.error("请上传任务说明文件"); return false; }
        if (!privacyFile) { toast.error("请上传采集隐私协议"); return false; }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveData = (status: "进行中" | "已结束" | "已归档", isPublishedValue: boolean) => {
    // 如果是保存草稿 (isPublishedValue === false)，则仅需校验第一步
    if (!isPublishedValue) {
      if (!validateStep(1)) return;
    } else {
      // 如果是发布 (isPublishedValue === true)，则需通过前三步的全部校验
      if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;
    }

    const newTask: TaskRecord = {
      id: `task-${Date.now()}`,
      taskType: "音频",
      title,
      recordingType: recordingMode === "quantitative" ? "定量录制，不重复录制" : "整份录制，重复录制",
      taskPurpose: taskPurpose as any,
      estimatedCount: parseInt(estimatedCount) || 0,
      initiator: initiator.split("(")[0],
      demandInfo,
      isAgentMode: agentMode === "yes",
      endTime: endDate,
      isPublished: isPublishedValue,
      status: status,
      createTime: format(new Date(), "yyyy/MM/dd HH:mm:ss"),
      tag: taskPurpose === "暂无" ? "通用" : taskPurpose,
    };

    const existingTasks = getStorageData(STORAGE_KEYS.TASKS, mockTasks);
    const updatedTasks = [newTask, ...existingTasks];
    setStorageData(STORAGE_KEYS.TASKS, updatedTasks);

    toast.success(isPublishedValue ? "任务发布成功" : "任务保存成功");
    navigate("/dashboard/tasks");
  };

  const handleSave = () => {
    handleSaveData("进行中", false); // 保存草稿：状态进行中，发布状态为否
  };

  const handlePublish = () => {
    handleSaveData("进行中", true); // 发布任务：状态进行中，发布状态为是
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <button onClick={() => navigate("/dashboard/tasks")} className="hover:text-primary transition-colors">任务管理</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">新建任务</span>
      </div>

      {/* 步骤指示器 - 极简大气设计 (水平排列式) */}
      <div className="bg-transparent mb-12 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-10">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className={cn("flex flex-1 items-center group", isLast && "flex-initial")}>
                <div className="flex items-center gap-4 relative">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                      isActive 
                        ? "bg-primary text-white ring-8 ring-primary/10" 
                        : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-50 text-slate-400 border border-slate-200"
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                  </div>
                  <div className="flex flex-col">
                    <span 
                      className={cn(
                        "text-[13px] font-bold tracking-wide transition-colors",
                        isActive ? "text-primary" : isCompleted ? "text-emerald-600" : "text-slate-400"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-tighter">
                      Step {stepNumber}
                    </span>
                  </div>
                </div>
                {!isLast && (
                  <div className="flex-1 mx-8 h-[1px] bg-slate-200 relative overflow-hidden">
                    <div 
                      className={cn(
                        "absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-1000 ease-in-out",
                        isCompleted ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 第一阶段：任务基本信息 */}
      {currentStep === 1 && (
        <div className="bg-card border border-border rounded-lg p-10 space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              任务基本信息
            </h3>
            <p className="text-sm text-muted-foreground mt-1">请填写任务的核心标识和背景描述</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 font-medium">
                <span className="text-destructive">*</span> 任务名称:
              </Label>
              <div className="relative group">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={30}
                  placeholder="将展示给采集人，请言简意赅表达任务需求"
                  className="pr-14 h-11 border-border/60 focus:border-primary transition-all bg-muted/5 group-hover:bg-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 font-mono">
                  {title.length}/30
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 font-medium">
                <span className="text-destructive">*</span> 任务结束日期:
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-11 justify-between text-left font-normal border-border/60 focus:border-primary bg-muted/5 group-hover:bg-transparent",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      {endDate ? (
                        format(parse(endDate, "yyyy-MM-dd HH:mm:ss", new Date()), "yyyy年MM月dd日 HH:mm:ss", { locale: zhCN })
                      ) : (
                        <span>选择任务截止日期</span>
                      )}
                    </div>
                    <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 flex flex-col" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ? parse(endDate, "yyyy-MM-dd HH:mm:ss", new Date()) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const timeStr = endDate ? endDate.split(" ")[1] : "23:59:59";
                        setEndDate(`${format(date, "yyyy-MM-dd")} ${timeStr}`);
                      }
                    }}
                    initialFocus
                    locale={zhCN}
                    disabled={{ before: startOfDay(new Date()) }}
                    className="w-full"
                    classNames={{
                      months: "w-full",
                      month: "w-full",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      row: "flex w-full mt-2",
                      head_cell: "text-muted-foreground rounded-md flex-1 w-auto font-normal text-[0.8rem]",
                      cell: "h-9 flex-1 w-auto text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      day: cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-9 w-full p-0 font-normal aria-selected:opacity-100"
                      ),
                    }}
                  />
                  <div className="p-3 border-t border-border bg-muted/20">
                    <div className="flex items-center justify-between gap-3 overflow-hidden">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">精确设置</Label>
                      <div className="flex items-center gap-1.5 flex-1 justify-end">
                        <div className="flex flex-col gap-1 w-10">
                          <Input
                            type="number"
                            min={0}
                            max={23}
                            value={endDate ? endDate.split(" ")[1].split(":")[0] : "23"}
                            onChange={(e) => {
                              const val = e.target.value.padStart(2, "0").slice(-2);
                              const parts = (endDate || format(new Date(), "yyyy-MM-dd 23:59:59")).split(" ");
                              const timeParts = parts[1].split(":");
                              timeParts[0] = val;
                              const newDateTimeStr = `${parts[0]} ${timeParts.join(":")}`;
                              const newDateTime = parse(newDateTimeStr, "yyyy-MM-dd HH:mm:ss", new Date());

                              if (isBefore(newDateTime, new Date())) {
                                toast.warning("设置的时间不能早于当前时间");
                                // 修正为当前小时或默认 23
                                return;
                              }
                              setEndDate(newDateTimeStr);
                            }}
                            className="h-8 px-1 text-center text-xs border-border/50 focus:border-primary"
                          />
                        </div>
                        <span className="text-muted-foreground">:</span>
                        <div className="flex flex-col gap-1 w-10">
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            value={endDate ? endDate.split(" ")[1].split(":")[1] : "59"}
                            onChange={(e) => {
                              const val = e.target.value.padStart(2, "0").slice(-2);
                              const parts = (endDate || format(new Date(), "yyyy-MM-dd 23:59:59")).split(" ");
                              const timeParts = parts[1].split(":");
                              timeParts[1] = val;
                              const newDateTimeStr = `${parts[0]} ${timeParts.join(":")}`;
                              const newDateTime = parse(newDateTimeStr, "yyyy-MM-dd HH:mm:ss", new Date());

                              if (isBefore(newDateTime, new Date())) {
                                toast.warning("设置的时间不能早于当前时间");
                                return;
                              }
                              setEndDate(newDateTimeStr);
                            }}
                            className="h-8 px-1 text-center text-xs border-border/50 focus:border-primary"
                          />
                        </div>
                        <span className="text-muted-foreground">:</span>
                        <div className="flex flex-col gap-1 w-10">
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            value={endDate ? endDate.split(" ")[1].split(":")[2] : "59"}
                            onChange={(e) => {
                              const val = e.target.value.padStart(2, "0").slice(-2);
                              const parts = (endDate || format(new Date(), "yyyy-MM-dd 23:59:59")).split(" ");
                              const timeParts = parts[1].split(":");
                              timeParts[2] = val;
                              const newDateTimeStr = `${parts[0]} ${timeParts.join(":")}`;
                              const newDateTime = parse(newDateTimeStr, "yyyy-MM-dd HH:mm:ss", new Date());

                              if (isBefore(newDateTime, new Date())) {
                                toast.warning("设置的时间不能早于当前时间");
                                return;
                              }
                              setEndDate(newDateTimeStr);
                            }}
                            className="h-8 px-1 text-center text-xs border-border/50 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="flex items-center gap-1 font-medium">
                <span className="text-destructive">*</span> 需求方信息:
              </Label>
              <div className="relative">
                <Textarea
                  value={demandInfo}
                  onChange={(e) => setDemandInfo(e.target.value)}
                  maxLength={500}
                  placeholder="请输入需求方对任务背景描述、质量要求等，帮助业务人员快速理解背景"
                  rows={4}
                  className="pb-10 border-border/60 focus:border-primary bg-muted/5 group-hover:bg-transparent resize-none leading-relaxed"
                />
                <span className="absolute right-3 bottom-3 text-xs text-muted-foreground/60 font-mono">
                  {demandInfo.length}/500
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 font-medium">
                <span className="text-destructive">*</span> 发起人:
              </Label>
              <Popover open={initiatorOpen} onOpenChange={setInitiatorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={initiatorOpen}
                    className="w-full h-11 justify-between border-border/60 hover:border-primary/50 bg-muted/5 font-normal px-3 group"
                  >
                    <span className={initiator ? "text-foreground" : "text-muted-foreground"}>
                      {initiator || "选择发起人"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80 transition-opacity" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 pointer-events-auto w-[400px]" align="start">
                  <Command className="w-full">
                    <CommandInput placeholder="搜索人员姓名或账号..." className="h-9" />
                    <CommandList className="max-h-[200px]">
                      <CommandEmpty>未找到相关人员</CommandEmpty>
                      <CommandGroup>
                        {AUTHORIZED_USERS.map((user) => {
                          const label = `${user.realName}(${user.loginName})`;
                          return (
                            <CommandItem
                              key={user.loginName}
                              value={label}
                              onSelect={(currentValue) => {
                                setInitiator(currentValue);
                                setInitiatorOpen(false);
                              }}
                              className="text-sm cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
                                  initiator === label ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {label}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-1 font-medium">
                <span className="text-destructive">*</span> 是否启用代理模式:
              </Label>
              <div className="flex items-center gap-6 h-11 px-4 bg-muted/10 rounded-md border border-border/40">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="agentMode"
                    checked={agentMode === "yes"}
                    onChange={() => setAgentMode("yes")}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">开启</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="agentMode"
                    checked={agentMode === "no"}
                    onChange={() => setAgentMode("no")}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">关闭</span>
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-primary/60" />
                开启后，任务将由代理人统筹分配给采集人员
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 第二阶段：采集规格参数 */}
      {currentStep === 2 && (
        <div className="bg-card border border-border rounded-lg p-10 space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              采集规格参数
            </h3>
            <p className="text-sm text-muted-foreground mt-1">定义采集任务的技术指标和用途</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-3">
              <Label className="flex items-center gap-1 font-medium">
                <span className="text-destructive">*</span> 数据类型:
              </Label>
              <div className="flex items-center gap-4 h-11 px-4 bg-muted/10 rounded-md border border-border/40">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked readOnly className="accent-primary w-4 h-4" />
                  <span className="text-sm font-medium">音频数据</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-1 font-medium">
                <span className="text-destructive">*</span> 任务用途:
              </Label>
              <div className="flex items-center items-center gap-4 h-11 px-4 bg-muted/10 rounded-md border border-border/40 flex-wrap overflow-hidden">
                {TASK_PURPOSES.map((purpose) => (
                  <label key={purpose} className="flex items-center gap-2 cursor-pointer group whitespace-nowrap">
                    <input
                      type="radio"
                      name="taskPurpose"
                      checked={taskPurpose === purpose}
                      onChange={() => setTaskPurpose(purpose)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">{purpose}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-1 font-medium">
                <span className="text-destructive">*</span> 词条长度:
              </Label>
              <div className="flex items-center gap-8 h-11 px-4 bg-muted/10 rounded-md border border-border/40">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="termLength"
                    checked={termLength === "短词条"}
                    onChange={() => setTermLength("短词条")}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">短词条 (短词句)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="termLength"
                    checked={termLength === "长词条"}
                    onChange={() => setTermLength("长词条")}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">长词条 (长文本)</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 col-span-2 p-6 rounded-xl bg-muted/5 border border-dashed border-border/60">
              <Label className="flex items-center gap-1 font-semibold text-primary">
                <span className="text-destructive">*</span> 录制模式及份数:
              </Label>
              <div className="flex items-center gap-10">
                <div className="flex flex-col gap-5">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="recordingMode"
                        checked={recordingMode === "whole"}
                        onChange={() => setRecordingMode("whole")}
                        className="accent-primary w-4 h-4"
                      />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors tracking-wide">整份录制</span>
                    </label>
                    <p className="pl-6.5 ml-6.5 text-[11px] text-muted-foreground/60 leading-relaxed border-l-2 border-primary/10">所有录制者使用同一套文本，内容统一</p>
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="recordingMode"
                        checked={recordingMode === "quantitative"}
                        onChange={() => setRecordingMode("quantitative")}
                        className="accent-primary w-4 h-4"
                      />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors tracking-wide">定量录制</span>
                    </label>
                    <p className="pl-6.5 ml-6.5 text-[11px] text-muted-foreground/60 leading-relaxed border-l-2 border-primary/10">系统根据每个人可领取条数自动按总量拆分文本分发给录制者</p>
                  </div>
                </div>

                <div className="w-px h-24 bg-border/40 mx-2" />

                <div className="flex-1 space-y-3">
                  <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-widest text-[#6366f1]">
                    {recordingMode === "quantitative" ? "每个人可领取条数" : "预计录制份数 (全部词条算一份)"}:
                  </Label>
                  <div className="relative max-w-[280px]">
                    <Input
                      type="number"
                      value={estimatedCount}
                      min={1}
                      max={1000000}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 1000000) return;
                        setEstimatedCount(e.target.value);
                      }}
                      placeholder="支持 1 - 1,000,000"
                      className="h-11 pl-4 pr-12 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary/40 bg-background/80 px-1">
                      {recordingMode === "quantitative" ? "条" : "份"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 第三阶段：任务说明与协议 */}
      {currentStep === 3 && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-8 space-y-8 shadow-sm">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  任务说明配置
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-1 bg-muted/30 rounded-lg w-fit">
                  <button
                    onClick={() => setInstructionMode("text")}
                    className={`px-6 py-2 rounded-md transition-all text-sm font-medium ${instructionMode === "text" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Markdown编辑
                  </button>
                  <button
                    onClick={() => setInstructionMode("file")}
                    className={`px-6 py-2 rounded-md transition-all text-sm font-medium ${instructionMode === "file" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    文件式上传
                  </button>
                </div>

                {instructionMode === "text" ? (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">任务指引内容 (支持 Markdown 语法)</Label>
                    <Textarea
                      value={instructionText}
                      onChange={(e) => setInstructionText(e.target.value)}
                      placeholder="# 标题&#10;1. 采集要求: 请在安静环境下录音...&#10;2. 语速要求: 语速平稳..."
                      rows={12}
                      className="font-mono bg-muted/5 border-border/40 focus:border-primary/60 transition-colors leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    <Label className="text-sm font-medium text-muted-foreground">上传预设指引文档 (PDF/docx)</Label>
                    <div className="border-2 border-dashed border-border/60 rounded-xl p-10 flex flex-col items-center justify-center bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer relative group">
                      <Upload className="h-12 w-12 text-muted-foreground/30 group-hover:text-primary/40 transition-colors mb-4" />
                      <span className="text-sm font-medium">点击或拖拽文件至此处上传</span>
                      <span className="text-xs text-muted-foreground mt-2">支持 PDF, docx，最大支持 200MB</span>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.docx"
                        onChange={(e) => setInstructionFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    {instructionFile && (
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">FILE</div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium max-w-[200px] truncate">{instructionFile.name}</span>
                            <span className="text-[10px] text-muted-foreground">{(instructionFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button onClick={() => setInstructionFile(null)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border">
                <Label className="flex items-center gap-1 font-medium mb-3">
                  <span className="text-destructive">*</span> 采集隐私协议 (PDF):
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <div className="h-11 px-4 border border-input rounded-md bg-muted/5 flex items-center gap-3 overflow-hidden">
                      <Upload className="h-4 w-4 text-primary" />
                      <span className="text-sm truncate text-muted-foreground flex-1">
                        {privacyFile ? privacyFile.name : "请上传必填的隐私授权协议"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={(e) => setPrivacyFile(e.target.files?.[0] || null)}
                      />
                      <Button variant="ghost" size="sm" className="h-7 text-[10px]" type="button">点击浏览</Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-11" onClick={() => toast.info("示例下载开发中")}>
                    下载协议模版
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">PDF格式，建议大小 10MB 以内</p>
              </div>
            </div>

            {/* 实时渲染预览区 */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">实时预览渲染</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter bg-muted px-2 py-0.5 rounded">Preview Mode</span>
              </div>
              <div className="flex-1 p-0 overflow-hidden bg-white relative">
                {instructionMode === "text" ? (
                  <div className="p-8 h-full overflow-y-auto scrollbar-thin">
                    <div className="prose prose-sm max-w-none">
                      {instructionText ? (
                        <div className="space-y-4">
                          {instructionText.split('\n').map((line, idx) => {
                            if (line.trim().startsWith('# ')) return <h1 key={idx} className="text-2xl font-bold border-b pb-2 text-foreground">{line.replace('# ', '')}</h1>;
                            if (line.trim().startsWith('## ')) return <h2 key={idx} className="text-xl font-bold mt-4 text-foreground">{line.replace('## ', '')}</h2>;
                            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) return <li key={idx} className="ml-4 list-disc text-muted-foreground">{line.substring(2)}</li>;
                            return <p key={idx} className="min-h-[1.5em] text-muted-foreground leading-relaxed">{line}</p>;
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20 opacity-30">
                          <span className="text-3xl font-light italic">Empty Preview</span>
                          <p className="text-xs mt-2">左侧输入 Markdown 实时查看渲染效果</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full">
                    {instructionFile ? (
                      instructionFile.type === "application/pdf" && instructionPreviewUrl ? (
                        <iframe src={instructionPreviewUrl} className="w-full h-full border-none" title="Instruction Preview" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground bg-muted/5">
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Upload className="h-8 w-8 text-primary/60" />
                          </div>
                          <h4 className="text-sm font-semibold text-foreground">{instructionFile.name}</h4>
                          <p className="text-xs mt-2 opacity-60">
                            {instructionFile.type.includes("word") ? "Word文档预览受限，建议下载后查看" : "文件格式预览中..."}
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 opacity-20 bg-muted/5">
                        <Upload className="h-20 w-20 mb-6" />
                        <p className="italic font-medium">未上传任何说明文档</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 隐私协议浮层预览 */}
                {activePreview === "privacy" && privacyFile && privacyPreviewUrl && (
                  <div className="absolute inset-0 bg-white z-20 animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                    <div className="h-10 bg-primary/5 border-b border-primary/10 flex items-center justify-between px-4">
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        正在预览：采集隐私协议
                      </span>
                    </div>
                    <iframe src={privacyPreviewUrl} className="flex-1 w-full border-none" title="Privacy Preview" />
                  </div>
                )}
              </div>
              <div className="px-6 py-3 bg-muted/40 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-muted-foreground font-medium">预览切换：</span>
                  <button
                    className={cn(
                      "text-[10px] font-bold transition-all",
                      activePreview === "instruction" ? "text-primary underline underline-offset-4" : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => setActivePreview("instruction")}
                  >
                    任务说明
                  </button>
                  {privacyFile && (
                    <button
                      className={cn(
                        "text-[10px] font-bold transition-all",
                        activePreview === "privacy" ? "text-primary underline underline-offset-4" : "text-muted-foreground hover:text-primary"
                      )}
                      onClick={() => setActivePreview("privacy")}
                    >
                      隐私协议
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 第四阶段：录制词条 */}
      {currentStep === 4 && (
        <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  录制词条配置
                </h3>
                <p className="text-sm text-muted-foreground mt-1">上传或管理本次采集任务的具体文本内容</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-muted hover:bg-muted/80 text-xs"
                  onClick={() => toast.info("模版已导出")}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Excel模版
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all font-semibold"
                  onClick={() => {
                    setEditTermIndex(null);
                    setAddTermOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  单条新增
                </Button>
                <Button
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700"
                  onClick={() => toast.info("批量导入开发中")}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  批量导入
                </Button>
                {selectedTerms.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs animate-in zoom-in-95"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    删除选中 ({selectedTerms.length})
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-background shadow-inner">
              <div className="overflow-x-auto">
                <table className="admin-table w-full text-sm border-none">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={terms.length > 0 && selectedTerms.length === terms.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="accent-primary"
                        />
                      </th>
                      <th className="px-4 whitespace-nowrap">词条序号</th>
                      <th className="px-4 whitespace-nowrap">录制序号</th>
                      <th className="px-4 whitespace-nowrap">录制类型</th>
                      <th className="px-4 whitespace-nowrap">语言/方言</th>
                      <th className="px-4 whitespace-nowrap">语速</th>
                      <th className="px-4">文本</th>
                      <th className="px-4 whitespace-nowrap">更新时间</th>
                      <th className="px-4 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terms.map((term) => (
                      <tr key={term.termIndex} className="hover:bg-muted/5 transition-colors border-b last:border-0 border-border/40">
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedTerms.includes(term.termIndex)}
                            onChange={(e) => handleSelectTerm(term.termIndex, e.target.checked)}
                            className="accent-primary"
                          />
                        </td>
                        <td className="font-mono text-[11px] text-muted-foreground whitespace-nowrap px-4">{term.termIndex}</td>
                        <td className="font-mono text-[11px] text-muted-foreground/80 whitespace-nowrap px-4">{term.recordingIndex}</td>
                        <td>
                          <span className="px-1.5 py-0.5 bg-primary/5 text-primary text-[10px] rounded font-bold border border-primary/10 whitespace-nowrap">
                            {term.recordingType}
                          </span>
                        </td>
                        <td className="whitespace-nowrap">{term.language}</td>
                        <td className="whitespace-nowrap">{term.speed}</td>
                        <td className="max-w-[120px] truncate font-medium">{term.text}</td>
                        <td className="text-[11px] text-muted-foreground whitespace-nowrap font-mono">{term.updateTime}</td>
                        <td>
                          <div className="flex items-center justify-center gap-4">
                            <button
                              className="text-primary hover:text-primary/70 transition-colors text-xs font-semibold"
                              onClick={() => handleEditTerm(term)}
                            >
                              编辑
                            </button>
                            <button
                              className="text-destructive hover:text-destructive/70 transition-colors text-xs font-semibold"
                              onClick={() => handleDeleteTerm(term.termIndex)}
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {terms.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-24 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <Plus className="h-10 w-10 mb-2" />
                            <span className="text-sm font-medium italic">空空如也，请点击右上角新增词条</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部导航按钮区 */}
      <div className="flex items-center justify-between pt-6 border-t border-border/60">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/tasks")}
          className="h-11 px-8 border-border/80 hover:bg-muted transition-colors text-muted-foreground"
        >
          丢弃并离开
        </Button>

        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="h-11 px-8 hover:bg-muted text-foreground transition-all border-border/80"
              type="button"
            >
              上一步
            </Button>
          )}

          {currentStep < steps.length ? (
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleSave}
                  className="h-11 px-8 border-primary/20 text-primary hover:bg-primary/5 transition-all"
                  type="button"
                >
                  保存草稿
                </Button>
              )}
              <Button
                onClick={nextStep}
                className="h-11 px-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-semibold"
                type="button"
              >
                继续下一步
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                className="h-11 px-8 border-primary/20 text-primary hover:bg-primary/5 transition-all"
                type="button"
              >
                保存草稿
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="h-11 px-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all font-bold">
                    完成并发布任务
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl">发布任务确认</AlertDialogTitle>
                    <AlertDialogDescription className="text-base text-muted-foreground">
                      确认正式发布任务「{title}」吗？<br />
                      <span className="text-xs text-destructive font-bold mt-2 inline-block">注意：发布后核心参数和词条内容将锁定，不可修改。</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="h-11 rounded-lg border-border">我再想想</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handlePublish}
                      className="h-11 rounded-lg bg-blue-600 hover:bg-blue-700 px-8"
                    >
                      确认并分发任务
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>

      {/* 新增/编辑词条弹窗 */}
      <AddTermDialog
        open={addTermOpen}
        onOpenChange={setAddTermOpen}
        onSave={handleAddTerm}
        editTerm={editTerm}
      />
    </div>
  );
};

export default CreateTask;
