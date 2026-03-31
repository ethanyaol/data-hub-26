// 移动端用户管理 - 共享类型和常量

export const DEVICE_TYPES = ["安卓", "苹果", "鸿蒙", "其他"] as const;

export const USER_ROLES = ["用户", "代理人"] as const;

export const USER_STATUSES = ["启用", "停用"] as const;

export interface MobileUser {
  id: string;
  name: string;
  loginPhone: string;
  role: "用户" | "代理人";
  deviceType: string;
  accountName: string;
  deviceModel: string;
  userSource: string;
  organization: string;
  status: "启用" | "停用";
  createTime: string;
  isDefaultPassword?: boolean;
}

export interface RecorderRecord {
  id: string;
  userId: string; // 关联的移动端用户ID
  nickname: string;
  gender: string;
  age: number;
  contact: string;
  growthLocation: string;
  createTime: string;
  isSyncRecorder?: boolean; // 是否为同步创建的默认录音人
}
