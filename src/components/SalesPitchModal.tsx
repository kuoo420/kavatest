import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Check, 
  Copy, 
  Tag, 
  TrendingUp, 
  Lightbulb, 
  Layers, 
  Users, 
  Store as StoreIcon, 
  HelpCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { TransferCase, Product, Store } from '../types';

interface SalesPitchModalProps {
  caseItem: TransferCase;
  product?: Product;
  store?: Store;
  onClose: () => void;
}

export const SalesPitchModal: React.FC<SalesPitchModalProps> = ({
  caseItem,
  product,
  store,
  onClose,
}) => {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const pitch = caseItem.salesPitchDetail || {
    recommendedPairSku: 'KV-NC-001',
    recommendedPairName: '微光鎖骨鍊 (正價 NT$ 3,280)',
    styleLogic: '採用極簡極細幾何線條，與主推項鍊/戒指形成「一粗一細、一素一閃」的視覺縱深感，極大化佩戴層次。',
    targetPersona: '22~38 歲通勤白領、注重低調精緻細節、想提升穿搭質感的顧客。',
    iceBreakerScript: `「小姐您挑選的這款飾品戴起來非常襯膚色！如果您想讓整體穿搭更有法式層次感，我幫您搭這款 ${caseItem.productName} 試戴看看，今年專櫃很流行這種疊戴風格，您可以照鏡子看看整體氛圍！」`,
    priceOvercomeScript: `「這兩款都是全台統一專櫃正價，通體 S925 純銀厚鍍 18K 金，日常碰水洗手都不用擔心。分開戴或疊戴都很好看，買一組等於有 3 種不同戴法！」`,
    crossSellRateLift: '歷史門市測試：引導疊戴試戴者，連帶結帳轉換率提升達 42.8%',
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(key);
    setTimeout(() => {
      setCopiedScript(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E2E8F0] my-auto">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#111827] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#059669]/30 border border-[#10B981]/50 flex items-center justify-center text-[#34D399]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold font-serif-heading">
                  AI 前線疊戴顧問 & 正價搭售話術庫
                </h3>
                <span className="text-[10px] bg-[#10B981]/20 text-[#6EE7B7] border border-[#10B981]/40 px-2 py-0.2 rounded-full font-bold">
                  恪守全國正價
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                品項：<span className="font-bold text-white">{caseItem.productName}</span> ({caseItem.productSku})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* AI Matching Logic Card */}
          <div className="bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] rounded-xl p-4 border border-[#A7F3D0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#065F46]">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                <span>AI 美學搭配與搭售推薦組合</span>
              </div>
              <span className="text-[11px] font-bold text-[#047857] bg-white px-2 py-0.5 rounded-full border border-[#6EE7B7]">
                連帶率提升估計 +40%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-[#BBF7D0] shadow-2xs">
                <div className="text-[11px] text-[#6B7280]">當前需激活正價品項：</div>
                <div className="font-bold text-sm text-[#1F2937] mt-0.5">{caseItem.productName}</div>
                <div className="text-[11px] text-[#059669] font-semibold mt-1">
                  全台專櫃定價：NT$ {product?.price?.toLocaleString() || '1,980'}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#BBF7D0] shadow-2xs">
                <div className="text-[11px] text-[#6B7280]">AI 推薦搭售熱銷款：</div>
                <div className="font-bold text-sm text-[#1F2937] mt-0.5">{pitch.recommendedPairName || '微光鎖骨鍊'}</div>
                <div className="text-[11px] text-[#4F46E5] font-semibold mt-1 font-mono">
                  搭配 SKU：{pitch.recommendedPairSku || 'KV-NC-001'}
                </div>
              </div>
            </div>

            {/* Style Logic */}
            <div className="bg-white/80 p-3 rounded-lg border border-[#BBF7D0] text-xs text-[#065F46] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#059669]" />
                <span>美學與層次搭配依據（Style Logic）：</span>
              </div>
              <p className="text-[11px] text-[#047857] leading-relaxed">
                {pitch.styleLogic}
              </p>
            </div>
          </div>

          {/* Target Persona & Customer Hook */}
          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-[#1E293B]">
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>目標客群切入點與穿搭情境（Target Persona）：</span>
            </div>
            <p className="text-[#475569] leading-relaxed text-[11px] pl-5">
              {pitch.targetPersona}
            </p>
          </div>

          {/* Ready-to-use Scripts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-[#1E293B] flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#D97706]" />
                <span>門市人員實戰話術腳本（一鍵複製 / 直接照唸）</span>
              </h4>
              <span className="text-[11px] text-[#64748B]">全台統一正價話術</span>
            </div>

            {/* Script 1: Ice breaker */}
            <div className="bg-[#FFFDF5] rounded-xl p-3.5 border border-[#FDE68A] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#92400E] flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  情境一：試戴主動引導破冰句（拉高試戴率）
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(pitch.iceBreakerScript || '', 'script1')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] transition-all"
                >
                  {copiedScript === 'script1' ? (
                    <>
                      <Check className="w-3 h-3 text-[#16A34A]" />
                      <span className="text-[#16A34A]">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>複製話術</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#FDE68A] text-[#78350F] leading-relaxed text-xs">
                {pitch.iceBreakerScript}
              </div>
            </div>

            {/* Script 2: Value & Price objection overcome */}
            <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#334155] flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#64748B] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  情境二：抗拒化解與正價價值感強化句（不降價成交）
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(pitch.priceOvercomeScript || '', 'script2')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] transition-all"
                >
                  {copiedScript === 'script2' ? (
                    <>
                      <Check className="w-3 h-3 text-[#16A34A]" />
                      <span className="text-[#16A34A]">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>複製話術</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] text-[#334155] leading-relaxed text-xs">
                {pitch.priceOvercomeScript}
              </div>
            </div>
          </div>

          {/* AI Evidence Badge */}
          <div className="p-3 bg-[#EEF2FF] rounded-xl border border-[#C7D2FE] text-xs text-[#3730A3] flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">演算法數據背書：</span>
              <span className="text-[11px] text-[#4338CA] ml-1">
                {pitch.crossSellRateLift}。透過成套展示與情境話術，門市可在零折扣的前提下有效去化滯銷庫存。
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs text-[#64748B]">
            門市端可隨時在專櫃手機／iPad 上查閱
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg transition-colors shadow-xs"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
