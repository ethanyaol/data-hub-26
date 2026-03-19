import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PasswordStrength from "@/components/PasswordStrength";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const ChangePasswordDialog = ({ open, onOpenChange }: Props) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "密码长度至少8位";
    if (!/[a-z]/.test(pwd)) return "需要包含小写字母";
    if (!/[A-Z]/.test(pwd)) return "需要包含大写字母";
    if (!/[0-9]/.test(pwd)) return "需要包含数字";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return "需要包含特殊字符";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim()) { toast.error("请输入原密码"); return; }
    const err = validatePassword(newPassword);
    if (err) { toast.error(err); return; }
    if (newPassword !== confirmPassword) { toast.error("两次密码不一致"); return; }
    toast.success("密码修改成功");
    onOpenChange(false);
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>原密码</Label>
            <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="请输入原密码" />
          </div>
          <div className="space-y-2">
            <Label>新密码</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="大小写字母+数字+特殊字符，至少8位" />
            <PasswordStrength password={newPassword} />
          </div>
          <div className="space-y-2">
            <Label>确认新密码</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit">确认修改</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
