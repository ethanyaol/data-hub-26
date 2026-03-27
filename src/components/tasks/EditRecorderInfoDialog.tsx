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

interface EditRecorderInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recorder: {
    recorderName: string;
    contact: string;
    gender: string;
    age: number;
    growthLocation: string;
  } | null;
  onSave: (data: {
    recorderName: string;
    contact: string;
    gender: string;
    age: number;
    growthLocation: string;
  }) => void;
}

const EditRecorderInfoDialog = ({
  open,
  onOpenChange,
  recorder,
  onSave,
}: EditRecorderInfoDialogProps) => {
  const [recorderName, setRecorderName] = useState("");
  const [contact, setContact] = useState("");
  const [gender, setGender] = useState("男");
  const [age, setAge] = useState<number>(0);
  const [growthLocation, setGrowthLocation] = useState("");

  useEffect(() => {
    if (open && recorder) {
      setRecorderName(recorder.recorderName);
      setContact(recorder.contact);
      setGender(recorder.gender);
      setAge(recorder.age);
      setGrowthLocation(recorder.growthLocation);
    }
  }, [recorder, open]);

  const handleSave = () => {
    if (!recorderName.trim()) {
      toast.error("请输入录音人");
      return;
    }
    if (!contact.trim()) {
      toast.error("请输入联系方式");
      return;
    }
    onSave({
      recorderName: recorderName.trim(),
      contact: contact.trim(),
      gender,
      age,
      growthLocation: growthLocation.trim(),
    });
    onOpenChange(false);
    toast.success("录音人信息修改成功");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>修改录音人信息</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>录音人</Label>
              <Input
                value={recorderName}
                onChange={(e) => setRecorderName(e.target.value)}
                placeholder="请输入录音人"
              />
            </div>
            <div className="space-y-2">
              <Label>联系方式</Label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="请输入联系方式"
              />
            </div>
            <div className="space-y-2">
              <Label>性别</Label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>年龄</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                placeholder="请输入年龄"
              />
            </div>
            <div className="space-y-2">
              <Label>成长地点</Label>
              <Input
                value={growthLocation}
                onChange={(e) => setGrowthLocation(e.target.value)}
                placeholder="请输入成长地点"
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

export default EditRecorderInfoDialog;
