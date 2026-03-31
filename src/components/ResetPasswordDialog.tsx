import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PasswordStrength from "@/components/PasswordStrength";
import { Eye, EyeOff } from "lucide-react";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string | number; name?: string; realName?: string; loginName?: string; loginPhone?: string } | null;
  onConfirm: (newPassword: string) => void;
}

const ResetPasswordDialog = ({
  open,
  onOpenChange,
  user,
  onConfirm,
}: ResetPasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset fields when opening/closing
  useEffect(() => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  if (!user) return null;

  const displayName = user.realName || user.name || user.loginName || user.loginPhone || "用户";
  const displayAccount = user.loginName || user.loginPhone || "";

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return false;
    return true;
  };

  const isPasswordValid = validatePassword(newPassword);
  const isMatch = newPassword === confirmPassword && confirmPassword !== "";
  const canSubmit = isPasswordValid && isMatch;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm(newPassword);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>重置密码</DialogTitle>
          <DialogDescription>
            正在为用户 <span className="font-semibold text-foreground">{displayName}</span> {displayAccount && `(${displayAccount})`} 设置新密码，设置后用户下次登录需要输入新密码。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">新密码</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={newPassword} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认新密码</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && !isMatch && (
              <p className="text-xs text-destructive mt-1">两次输入的密码不一致</p>
            )}
            {confirmPassword && isMatch && (
              <p className="text-xs text-success mt-1">密码匹配一致</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit}>
            确认重置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
