import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { USER_ROLES, USER_STATUSES } from "@/pages/mobile-users/types";

interface EditMobileUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  user?: { name: string; loginPhone: string; role: string; status: string } | null;
  onSave: (data: { name: string; loginPhone: string; role: string; status: string }) => void;
}

const EditMobileUserDialog = ({
  open,
  onOpenChange,
  mode,
  user,
  onSave,
}: EditMobileUserDialogProps) => {
  const [name, setName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [role, setRole] = useState("用户");
  const [status, setStatus] = useState("启用");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && user) {
        setName(user.name || "");
        setLoginPhone(user.loginPhone || "");
        setRole(user.role || "用户");
        setStatus(user.status || "启用");
      } else {
        setName("");
        setLoginPhone("");
        setRole("用户");
        setStatus("启用");
      }
    }
  }, [open, mode, user]);

  const handleSave = () => {
    if (!loginPhone.trim()) {
      toast.error("请输入登录手机号");
      return;
    }
    if (!/^1\d{10}$/.test(loginPhone.trim())) {
      toast.error("请输入正确的手机号格式");
      return;
    }

    const nameTrimmed = name.trim();
    if (nameTrimmed) {
      if (nameTrimmed.length < 2 || nameTrimmed.length > 50) {
        toast.error("姓名长度应在 2 到 50 个字符之间");
        return;
      }
      if (!/^[\u4e00-\u9fa5・]+$/.test(nameTrimmed)) {
        toast.error("姓名仅支持汉字与间隔点「・」，且不能包含空格、数字或字母");
        return;
      }
      if (nameTrimmed.startsWith('・') || nameTrimmed.endsWith('・')) {
        toast.error("间隔点「・」不能出现在姓名首尾");
        return;
      }
      if (nameTrimmed.includes('・・')) {
        toast.error("间隔点「・」不能连续出现");
        return;
      }
      const dotCount = (nameTrimmed.match(/・/g) || []).length;
      if (dotCount > 3) {
        toast.error("间隔点「・」最多允许出现 3 个");
        return;
      }
    }

    onSave({ 
      name: nameTrimmed, 
      loginPhone: loginPhone.trim(), 
      role, 
      status 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "新增用户" : "编辑用户信息"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              登录手机号 <span className="text-destructive">*</span>
            </Label>
            <Input
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              placeholder="请输入手机号"
              maxLength={11}
              disabled={mode === "edit"}
              className={mode === "edit" ? "bg-muted cursor-not-allowed" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label>
              姓名
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入姓名"
            />
          </div>
          <div className="space-y-2">
            <Label>
              角色 <span className="text-destructive">*</span>
            </Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>
              状态 <span className="text-destructive">*</span>
            </Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus:ring-ring"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {USER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMobileUserDialog;
