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
        
        <div className="flex-1 overflow-y-auto min-h-0 px-8 py-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
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

            <div className="mt-10 pb-20 border-t border-slate-200">
              <div className="flex flex-col items-end pt-8">
                <div className="w-64 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-bold whitespace-nowrap">乙方签名：</span>
                  </div>
                  
                  <div className="h-32 w-full border-2 border-slate-200 bg-white rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm">
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-300 font-sans tracking-widest uppercase select-none pointer-events-none">
                      HANDWRITTEN SIGNATURE
                    </span>
                    <img 
                      src={UserSignature} 
                      alt="User Signature" 
                      className="relative z-10 max-h-28 w-auto grayscale contrast-150 brightness-90 rotate-[-1deg] drop-shadow-sm"
                      onError={(e) => {
                        console.error("Signature image failed to load");
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div className="text-right pr-1">
                    <p className="text-[11px] text-slate-400 font-sans italic">签署时间：{signDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
