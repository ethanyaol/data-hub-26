import { Construction } from "lucide-react";

const ComingSoon = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4 animate-fade-in">
            <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Construction className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
                功能待完善
            </h2>
            <p className="text-muted-foreground max-w-md">
                程序员小哥正在努力开发中，该模块即将上线，敬请期待！
            </p>
        </div>
    );
};

export default ComingSoon;
