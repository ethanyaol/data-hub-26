import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface UserRecord {
    id: number;
    loginName: string;
    realName: string;
    email: string;
    tenant: string;
    status: "启用" | "停用";
    company?: string;
    address?: string;
}

interface UserDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserRecord | null;
}

export const UserDetailsDialog = ({ open, onOpenChange, user }: UserDetailsDialogProps) => {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>用户详情</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4 px-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">登录名称</span>
                        <span className="font-medium text-foreground">{user.loginName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">用户姓名</span>
                        <span className="font-medium text-foreground">{user.realName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">电子邮箱</span>
                        <span className="font-medium text-foreground">{user.email || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">所属租户</span>
                        <span className="font-medium text-foreground">{user.tenant}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">用户状态</span>
                        <span className="font-medium text-foreground">{user.status}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">所属公司</span>
                        <span className="font-medium text-foreground">{user.company || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <span className="text-sm text-muted-foreground">联系地址</span>
                        <span className="font-medium text-foreground">{user.address || "-"}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
