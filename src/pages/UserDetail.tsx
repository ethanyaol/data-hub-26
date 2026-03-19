import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserDetailInfo {
    id: string;
    loginName: string;
    realName: string;
    tenant: string;
    status: "启用" | "停用";
    userType: string;
    phone: string;
    oaAccount: string;
    address: string;
    secAccount: string;
    updateTime: string;
    email: string;
    createTime: string;
    remark: string;
}

const UserDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [roleSearch, setRoleSearch] = useState("");

    const [userInfo, setUserInfo] = useState<UserDetailInfo | null>(null);
    const [assignedRoles, setAssignedRoles] = useState<{ name: string; app: string }[]>([]);

    useEffect(() => {
        // Mock user details based on ID
        if (id) {
            setTimeout(() => {
                setUserInfo({
                    id,
                    loginName: id === "1" ? "xyfan10" : `user_${id}`,
                    realName: id === "1" ? "左*********" : `模拟用户 ${id}`,
                    tenant: "AI机构",
                    status: "启用",
                    userType: id === "1" ? "4A用户" : "系统创建",
                    phone: "131****3055",
                    oaAccount: id === "1" ? "xyfan10" : "-",
                    address: "合肥市",
                    secAccount: id === "1" ? "xyfan10_4a" : "-",
                    updateTime: "2026-03-19 22:22:15",
                    email: "112****@qq.com",
                    createTime: "2024-01-28 15:51:35",
                    remark: "11212",
                });

                // Mock assigned roles based on the same business logic
                setAssignedRoles(
                    id === "1"
                        ? [
                            { name: "UAP管理员", app: "端侧数据采集平台" },
                            { name: "运营管理员", app: "端侧数据采集平台" },
                            { name: "租户管理员", app: "端侧数据采集平台" },
                            { name: "端侧任务管理员", app: "端侧数据采集平台" },
                            { name: "端侧质检员", app: "端侧数据采集平台" },
                        ]
                        : [
                            { name: "租户管理员", app: "端侧数据采集平台" }
                        ]
                );
                setLoading(false);
            }, 300);
        }
    }, [id]);

    const InfoItem = ({ label, value, isBadge = false }: { label: string; value: string | React.ReactNode; isBadge?: boolean }) => (
        <div className="flex text-sm leading-relaxed min-h-[32px]">
            <span className="text-muted-foreground w-28 shrink-0">{label}:</span>
            <div className="flex-1 font-medium text-foreground">
                {isBadge ? (
                    <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-1 py-0 h-5 text-xs font-normal rounded-[2px]">
                        {value}
                    </Badge>
                ) : (
                    value
                )}
            </div>
        </div>
    );

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">正在加载用户详情...</div>;
    if (!userInfo) return <div className="p-8 text-center">用户不存在</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button onClick={() => navigate("/dashboard/user-management")} className="text-primary hover:text-primary/80">
                    用户管理
                </button>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">用户详情</span>
            </div>
            <p className="text-sm text-muted-foreground -mt-3">
                用户管理模块可进行用户管理，在这里可进行用户状态的查看。
            </p>

            {/* Info Card */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-8">
                {/* User Info Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold border-l-4 border-primary pl-3">用户信息</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 pt-2 px-1">
                        <InfoItem label="登录名称" value={userInfo.loginName} />
                        <InfoItem label="用户姓名" value={userInfo.realName} />
                        <InfoItem label="所属租户" value={userInfo.tenant} />
                        <InfoItem label="用户状态" value={userInfo.status} isBadge />
                        <InfoItem label="用户类型" value={userInfo.userType} />
                        <InfoItem label="手机号码" value={userInfo.phone} />
                        <InfoItem label="OA账号" value={userInfo.oaAccount} />
                        <InfoItem label="地址" value={userInfo.address} />
                        <InfoItem label="磐智账号" value={userInfo.secAccount} />
                        <InfoItem label="修改时间" value={userInfo.updateTime} />
                        <InfoItem label="邮箱" value={userInfo.email} />
                        <InfoItem label="创建时间" value={userInfo.createTime} />
                        <InfoItem label="备注" value={userInfo.remark} />
                    </div>
                </section>

                {/* Roles Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold border-l-4 border-primary pl-3">已分配角色</h3>
                    <div className="flex items-center gap-2 text-sm py-1">
                        <span className="shrink-0 text-muted-foreground">查询条件:</span>
                        <div className="relative w-64">
                            <Input
                                placeholder="请输入角色名称、所属应用"
                                className="h-8 pl-8 pr-3 text-xs"
                                value={roleSearch}
                                onChange={(e) => setRoleSearch(e.target.value)}
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                        </div>
                    </div>

                    <div className="border border-border rounded overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-muted text-muted-foreground">
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-2.5 font-medium">角色名称</th>
                                    <th className="text-left px-4 py-2.5 font-medium">所属应用</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {assignedRoles
                                    .filter(r => r.name.includes(roleSearch) || r.app.includes(roleSearch))
                                    .map((r, i) => (
                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-2.5 font-normal text-foreground">{r.name}</td>
                                            <td className="px-4 py-2.5 text-muted-foreground">{r.app}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => navigate("/dashboard/user-management")}
                    className="px-6 py-2 border border-border rounded bg-background hover:bg-muted text-sm transition-colors"
                >
                    返回
                </button>
            </div>
        </div>
    );
};

export default UserDetail;
