// 任务管理模块 - 共享类型和常量

// ===== 常量 =====

export const TASK_TYPES = ["音频"] as const;

export const TASK_PURPOSES = ["暂无", "训练集", "测试集", "调优集"] as const;

export const RECORDING_MODES = [
  { value: "whole", label: "整份录制，重复录制" },
  { value: "quantitative", label: "定量录制，不重复录制" },
] as const;

export const TERM_LENGTHS = ["长词条", "短词条"] as const;

export const RECORDING_TYPES = ["唤醒词", "命令词", "识别词"] as const;

export const LANGUAGES = [
  "普通话", "四川话", "粤语", "东北话", "山东话", "上海话",
  "闽南话", "河南话", "长沙话", "天津话", "河北话", "云南话",
  "武汉话", "贵州话", "英语", "日语", "韩语",
] as const;

export const SPEEDS = ["超快语速", "快语速", "正常语速", "慢语速"] as const;

export const TASK_STATUSES = ["草稿", "进行中", "已完成", "已归档"] as const;

export const ACCEPTANCE_STATUSES = ["待上传", "待验收", "已通过", "已打回", "已补录", "已废弃"] as const;

export const CLAIM_STATUSES = ["已领取", "未领取"] as const;

export const RECOVERY_STATUSES = ["已回收", "未回收"] as const;

export const ALLOCATION_STATUSES = ["进行中", "已完成"] as const;

// ===== 类型 =====

export interface TaskRecord {
  id: string;
  taskType: string;
  title: string;
  recordingType: string;
  taskPurpose: string;
  estimatedCount: number;
  initiator: string;
  demandInfo: string;
  isAgentMode: boolean;
  endTime: string;
  isPublished: boolean;
  status: "草稿" | "进行中" | "已完成" | "已归档";
  createTime: string;
  updateTime: string;
  tag?: string;
  totalTerms?: number;      // 任务导入的总词条数量
  termsPerPerson?: number;  // 定量录制下每个采集人可领取条数
}

export interface TaskTerm {
  termIndex: number;
  recordingIndex: string;
  recordingType: string;
  language: string;
  speed: string;
  text: string;
  updateTime: string;
}

export interface AgentRecoveryRecord {
  taskId?: string; // 关联的任务 ID
  agentName: string;
  agentCode: string;
  collectionCode: string;
  estimatedAudioCount: number;
  collectedAudioCount: number;
  estimatedAudioTerms: number;
  collectedAudioTerms: number;
  genderRatio: string;
  completedAcceptanceTerms: string;
  status: "进行中" | "已完成";
  createTime: string;
  selectedPersonIds?: string[];
}

export interface NonAgentRecoveryRecord {
  taskId?: string; // 关联的任务 ID
  planIndex: number;
  planName: string;
  estimatedAudioCount: number;
  collectedAudioCount: number;
  estimatedAudioTerms: number;
  collectedAudioTerms: number;
  genderRatio: string;
  completedAcceptanceTerms: string;
  createTime: string;
  status: "进行中" | "已完成";
  selectedPersonIds?: string[];
}

export interface SubtaskExecutionRecord {
  subtaskId: string;
  startIndex: number;
  endIndex: number;
  claimStatus: "已领取" | "未领取";
  recoveryStatus: "已回收" | "未回收";
  taskCount: number;
  recorderName: string;
  recorderId: string;
  gender: "男" | "女" | "-";
  taskRemark: string;
  uploadedAudioCount: string;
  passedTerms: string;
  subtaskRemark: string;
  createTime: string;
  updateTime: string;
}

export interface PersonnelRecoveryRecord {
  recorderName: string;
  recorderId: string;
  taskRemark: string;
  contact: string;
  gender: string;
  age: number;
  growthLocation: string;
  uploadedAudioCount: string;
  isTaskEnded: boolean;
  passedTerms: string;
  createTime: string;
}

export interface AudioDetailRecord {
  termIndex: number;
  audioRowkey: string;
  language: string;
  speed: string;
  recordingText: string;
  recognitionResult: string;
  textMatchConsistent: boolean;
  audioFormat: string;
  acceptanceStatus: "待上传" | "待验收" | "已通过" | "已打回" | "已补录" | "已废弃";
  remark: string;
  updateTime: string;
}

export interface PersonnelAssignRecord {
  id: string;
  name: string;
  title: string;
  phone: string;
}
