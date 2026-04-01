import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditTaskInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRemark: string;
  onSave: (remark: string) => void;
}

const EditTaskInfoDialog = ({
  open,
  onOpenChange,
  currentRemark,
  onSave,
}: EditTaskInfoDialogProps) => {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (open) {
      setRemark(currentRemark || "");
    }
  }, [currentRemark, open]);

  const handleSave = () => {
    onSave(remark.trim());
    onOpenChange(false);
    toast.success("备注保存成功");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>添加备注</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>任务备注</Label>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              maxLength={200}
              placeholder="请输入任务备注"
              rows={4}
            />
            <div className="text-xs text-muted-foreground text-right">
              {remark.length}/200
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

export default EditTaskInfoDialog;
