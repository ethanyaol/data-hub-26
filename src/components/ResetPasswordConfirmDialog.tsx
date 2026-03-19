import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ResetPasswordConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: { id: number; realName: string; loginName: string } | null;
}

export const ResetPasswordConfirmDialog = ({
    open,
    onOpenChange,
    user,
}: ResetPasswordConfirmDialogProps) => {
    if (!user) return null;

    const handleConfirm = () => {
        toast.success(`重置密码成功，新密码已重置为默认组合。`);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>重置密码确认</AlertDialogTitle>
                    <AlertDialogDescription>
                        您确定要重置用户 <strong>{user.realName}（{user.loginName}）</strong> 的登录密码吗？此操作可能会导致用户需要重新登录。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        确认重置
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
