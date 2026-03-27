import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RECORDING_TYPES, LANGUAGES, SPEEDS } from "@/pages/tasks/types";
import { toast } from "sonner";

interface AddTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (term: { recordingType: string; language: string; speed: string; text: string }) => void;
  editTerm?: { recordingType: string; language: string; speed: string; text: string } | null;
}

const AddTermDialog = ({ open, onOpenChange, onSave, editTerm }: AddTermDialogProps) => {
  const [recordingType, setRecordingType] = useState("");
  const [language, setLanguage] = useState("");
  const [speed, setSpeed] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (editTerm) {
      setRecordingType(editTerm.recordingType);
      setLanguage(editTerm.language);
      setSpeed(editTerm.speed);
      setText(editTerm.text);
    } else {
      setRecordingType("");
      setLanguage("");
      setSpeed("");
      setText("");
    }
  }, [editTerm, open]);

  const handleSave = () => {
    if (!recordingType) {
      toast.error("请选择录制类型");
      return;
    }
    if (!language) {
      toast.error("请选择录制语言");
      return;
    }
    if (!speed) {
      toast.error("请选择录制语速");
      return;
    }
    if (!text.trim()) {
      toast.error("请输入录制文本");
      return;
    }
    onSave({ recordingType, language, speed, text: text.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editTerm ? "编辑词条" : "新增词条"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>录制类型</Label>
            <select
              value={recordingType}
              onChange={(e) => setRecordingType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">请选择</option>
              {RECORDING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>录制语言</Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">请选择</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>录制语速</Label>
            <select
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">请选择</option>
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>录制文本</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              placeholder="请输入录制文本"
            />
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

export default AddTermDialog;
