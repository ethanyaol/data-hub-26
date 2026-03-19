import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const ResetPasswordDialog = ({ open, onOpenChange }: Props) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      toast.error("请填写完整信息");
      return;
    }
    toast.success("重置密码链接已发送到您的邮箱");
    onOpenChange(false);
    setUsername("");
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>重置密码</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>用户名</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名" />
          </div>
          <div className="space-y-2">
            <Label>注册邮箱</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入注册邮箱" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit">提交</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
