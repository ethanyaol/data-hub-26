export const STORAGE_KEYS = {
  TASKS: "datahub_tasks",
  MOBILE_USERS: "datahub_mobile_users",
  RECORDERS: "datahub_recorders",
  TASK_REMARKS: "datahub_task_remarks",
  USERS: "datahub_users",
} as const;

export const getStorageData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

export const setStorageData = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};
