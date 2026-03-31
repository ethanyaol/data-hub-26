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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { provinces } from "../../pages/mobile-users/locations";
import Cascader from "@/components/ui/cascader";
import { Info } from "lucide-react";

interface EditRecorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  loginPhone?: string;
  recorder?: {
    nickname: string;
    gender: string;
    contact: string;
    age: number;
    growthLocation: string;
    createTime: string;
    isSyncRecorder?: boolean;
  } | null;
  onSave: (data: {
    nickname: string;
    gender: string;
    contact: string;
    age: number;
    growthLocation: string;
  }) => void;
}

const EditRecorderDialog = ({
  open,
  onOpenChange,
  mode,
  loginPhone,
  recorder,
  onSave,
}: EditRecorderDialogProps) => {
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("男");
  const [contact, setContact] = useState("");
  const [age, setAge] = useState<number>(18);
  const [growthLocation, setGrowthLocation] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && recorder) {
        setNickname(recorder.nickname || "");
        setGender(recorder.gender || "男");
        setContact(recorder.contact || "");
        setAge(recorder.age || 18);
        setGrowthLocation(recorder.growthLocation || "");
      } else {
        setNickname("");
        setGender("男");
        setContact("");
        setAge(18);
        setGrowthLocation("");
      }
    }
  }, [open, mode, recorder, loginPhone]);

  const handleSave = () => {
    if (!nickname.trim()) {
      toast.error("请输入昵称");
      return;
    }
    const nicknameRegex = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
    if (!nicknameRegex.test(nickname)) {
      toast.error("昵称仅支持中英文及数字，且不能包含空格");
      return;
    }
    if (nickname.length > 10) {
      toast.error("昵称字数不能超过 10 个字符");
      return;
    }
    if (!age || age < 14) {
      toast.error("录音人最小年龄为 14 岁");
      return;
    }
    if (!growthLocation) {
      toast.error("请选择成长地");
      return;
    }
    onSave({
      nickname: nickname.trim(),
      gender,
      contact: contact.trim(),
      age,
      growthLocation,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "新建录音人" : "编辑录音人信息"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                昵称 <span className="text-destructive">*</span>
              </Label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
                maxLength={10}
                disabled={recorder?.isSyncRecorder}
                className={recorder?.isSyncRecorder ? "bg-muted cursor-not-allowed" : ""}
              />
              {recorder?.isSyncRecorder && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3" />
                  默认录音人昵称随用户姓名同步，不可在此修改
                </p>
              )}
            </div>
            {loginPhone && (
              <div className="space-y-2">
                <Label>登录手机号</Label>
                <Input value={loginPhone} disabled />
              </div>
            )}
            <div className="space-y-2">
              <Label>性别</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>联系方式</Label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="请输入联系方式"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label>
                年龄 <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                value={age || ""}
                onChange={(e) => setAge(Number(e.target.value))}
                min={14}
                max={120}
              />
            </div>
            <div className="space-y-2">
              <Label>
                成长地 <span className="text-destructive">*</span>
              </Label>
              <Cascader
                value={growthLocation}
                onValueChange={setGrowthLocation}
                placeholder="选择成长地 (省-市)"
              />
            </div>
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

export default EditRecorderDialog;
