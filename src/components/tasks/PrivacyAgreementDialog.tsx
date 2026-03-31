import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserSignature from "@/assets/user_signature.png";

interface PrivacyAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recorderName: string;
  signDate: string;
}

const PrivacyAgreementDialog = ({
  open,
  onOpenChange,
  recorderName,
  signDate,
}: PrivacyAgreementDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-4 shrink-0 border-b">
          <DialogTitle className="text-2xl font-bold text-center">个人信息保护与隐私协议书</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-8 py-6 bg-slate-50/50">
          <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700 font-serif">
            <div className="space-y-1 not-italic font-sans">
              <p><strong>甲方（发起方）：</strong> DataHub 智能采集平台</p>
              <p><strong>乙方（采集者）：</strong> {recorderName}</p>
              <p><strong>签署日期：</strong> {signDate}</p>
            </div>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 font-sans">第一条 协议目的</h3>
              <p>
                本协议旨在明确甲方在提供语音采集服务过程中，对于乙方个人信息的收集、使用、存储及保护的相关规范。乙方在参与甲方发起的采集任务前，已充分阅读并理解本协议条款。
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 font-sans">第二条 信息收集范围</h3>
              <p>
                甲方收集的乙方个人信息包括但不限于：姓名、性别、年龄、联系方式、成长地点、母语语种以及在本任务中录制的原始音频文件。
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 font-sans">第三条 信息使用目的</h3>
              <p>
                乙方授权甲方将上述信息用于以下用途：
                <br />1. 进行语音识别技术的算法模型训练与调优；
                <br />2. 在去标识化处理后，用于相关学术研究或行业数据集建设；
                <br />3. 任务报酬结算及必要的身份核验。
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 font-sans">第四条 隐私保护承诺</h3>
              <p>
                甲方承诺采取符合行业标准的安全防护措施保护乙方的个人信息。未经乙方事先书面同意，甲方不会将乙方的个人敏感信息向任何无关第三方提供、出售、租赁、分享或交易。
              </p>
            </section>

            <div className="pt-12 border-t border-slate-200">
              <div className="flex justify-between items-end">
                <div className="space-y-4">
                  <p className="font-sans font-semibold">甲方盖章：</p>
                  <div className="w-32 h-32 flex items-center justify-center border-2 border-red-500 rounded-full text-red-500 font-bold rotate-12 opacity-80 select-none pointer-events-none">
                    <span className="text-center text-xs leading-tight">
                      DataHub<br/>业务专用章
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="font-sans font-semibold">乙方签名：</p>
                  <div className="relative w-48 h-24 border-2 border-dashed border-slate-300 bg-white/80 rounded-lg flex items-center justify-center overflow-hidden">
                    {/* Placeholder text (Subtle watermark) */}
                    <span className="absolute text-[10px] text-slate-300 font-sans tracking-widest uppercase select-none">
                      手写签字区 / Signature Area
                    </span>
                    <img 
                      src={UserSignature} 
                      alt="User Signature" 
                      className="relative z-10 h-20 w-auto mix-blend-multiply grayscale contrast-125 transition-transform hover:scale-110 duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 shrink-0 border-t bg-white flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            关闭预览
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyAgreementDialog;
