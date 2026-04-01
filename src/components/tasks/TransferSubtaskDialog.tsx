import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Mock potential recorders
const MOCK_POTENTIAL_RECORDERS = [
  { id: "rec-20260401-001", name: "张三" },
  { id: "rec-20260401-002", name: "李四" },
  { id: "rec-20260401-003", name: "王五" },
  { id: "rec-20260401-004", name: "赵六" },
  { id: "rec-20260401-005", name: "陈七" },
];

interface TransferSubtaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtaskId: string;
  currentRecorderName: string;
  currentRecorderId: string;
  onConfirm: (recorderId: string, recorderName: string) => void;
}

const TransferSubtaskDialog = ({
  open,
  onOpenChange,
  subtaskId,
  currentRecorderName,
  currentRecorderId,
  onConfirm,
}: TransferSubtaskDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecorder, setSelectedRecorder] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedRecorder(null);
    }
  }, [open]);

  const filteredRecorders = MOCK_POTENTIAL_RECORDERS.filter(
    (r) =>
      (r.name.includes(searchQuery) || r.id.includes(searchQuery)) &&
      r.id !== currentRecorderId
  );

  const handleConfirm = () => {
    if (!selectedRecorder) {
      toast.error("请选择目标录音人");
      return;
    }
    onConfirm(selectedRecorder.id, selectedRecorder.name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            子任务转派
          </DialogTitle>
          <DialogDescription>
            正在为子任务 <span className="font-mono font-bold text-foreground">{subtaskId}</span> 指定新的录音人，重新分配人员后，历史录制信息将全部废弃，请只在必要情况下执行该操作
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Recorder Info */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">当前录音人</Label>
              <div className="text-sm font-medium">{currentRecorderName} ({currentRecorderId})</div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
            <div className="space-y-1 text-right">
              <Label className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">目标录音人</Label>
              <div className="text-sm font-bold text-primary italic">
                {selectedRecorder ? `${selectedRecorder.name} (${selectedRecorder.id})` : "请选择..."}
              </div>
            </div>
          </div>

          {/* Search Area */}
          <div className="space-y-3">
            <Label>选择新录音人</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索姓名或 ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="border border-border rounded-lg overflow-hidden max-h-[200px] overflow-y-auto bg-background">
              {filteredRecorders.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">暂无可选录音人</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredRecorders.map((recorder) => (
                    <div
                      key={recorder.id}
                      className={`px-4 py-3 text-sm flex items-center justify-between cursor-pointer transition-colors hover:bg-primary/5 ${
                        selectedRecorder?.id === recorder.id ? "bg-primary/10" : ""
                      }`}
                      onClick={() => setSelectedRecorder(recorder)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{recorder.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{recorder.id}</span>
                      </div>
                      {selectedRecorder?.id === recorder.id && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedRecorder}>
            确认转派
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferSubtaskDialog;
