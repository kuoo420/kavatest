import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Store as StoreIcon, 
  MapPin, 
  HelpCircle,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { TransferCase, Store } from '../types';

interface VMVerificationModalProps {
  caseItem: TransferCase;
  store?: Store;
  onClose: () => void;
  onConfirmVerification: (caseId: string, photoDataUrl: string) => void;
}

export const VMVerificationModal: React.FC<VMVerificationModalProps> = ({
  caseItem,
  store,
  onClose,
  onConfirmVerification,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(caseItem.vmPhotoProofUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default sample mock photos for convenient demo/testing on desktop/mobile
  const samplePresets = [
    {
      id: 'center_island',
      name: '中央中島鏡旁展盤 (推薦)',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'checkout_golden',
      name: '收銀台黃金視線陳列',
      url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'neck_model',
      name: '聚焦投射頸模特寫',
      url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setSelectedPreset(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    setPhotoUrl(preset.url);
    setSelectedPreset(preset.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmVerification(caseItem.id, photoUrl);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const nowTimestamp = new Date().toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E2E8F0] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1A1D20] to-[#2B313A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB]/30 border border-[#3B82F6]/50 flex items-center justify-center text-[#60A5FA]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif-heading flex items-center gap-1.5">
                <span>門市視覺陳列調整 · 拍照驗證稽核</span>
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                工單號：<span className="font-mono text-[#F1D892]">{caseItem.caseNumber}</span>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Target Info */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-[#1E293B] text-sm font-bold">{caseItem.productName}</span>
              <span className="font-mono text-[#64748B]">{caseItem.productSku}</span>
            </div>
            
            <div className="flex items-center justify-between text-[#64748B] pt-1 border-t border-[#EEF2F6]">
              <span className="flex items-center gap-1">
                <StoreIcon className="w-3.5 h-3.5 text-[#8C6D3B]" />
                執行門市：<strong className="text-[#1E293B]">{store?.name || caseItem.sourceStoreId}</strong>
              </span>
              <span className="flex items-center gap-1 text-[#2563EB] font-bold">
                <Clock className="w-3.5 h-3.5" />
                將啟動 7 天觀察鎖定期
              </span>
            </div>

            <div className="bg-[#EFF6FF] p-2 rounded-lg border border-[#DBEAFE] text-[11px] text-[#1E40AF] leading-relaxed">
              <strong>陳列指引要點：</strong> {caseItem.vmGuidance || '移至中央中島試戴鏡旁絲絨首飾盤，並搭配聚焦投射燈展示。'}
            </div>
          </div>

          {/* Photo Capture Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#2563EB]" />
                <span>上傳現場陳列照片佐證</span>
                <span className="text-[#DC2626]">*</span>
              </label>
              <span className="text-[11px] text-[#64748B]">支援 iPhone 直接調用相機</span>
            </div>

            {/* Hidden Input with capture attribute for mobile camera */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Photo Preview or Trigger */}
            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-[#2563EB] bg-black group">
                <img
                  src={photoUrl}
                  alt="陳列佐證照片"
                  className="w-full h-48 sm:h-56 object-cover opacity-90"
                />

                {/* Watermark Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 text-white text-[11px] flex flex-col sm:flex-row sm:items-end justify-between gap-1">
                  <div>
                    <div className="font-bold flex items-center gap-1 text-[#60A5FA]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>稽核驗證浮水印</span>
                    </div>
                    <div className="text-[10px] text-gray-200 mt-0.5">
                      門市：{store?.name || '專櫃門市'} · 時間：{nowTimestamp}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#FCD34D] font-mono font-semibold">
                    {caseItem.caseNumber}
                  </div>
                </div>

                {/* Retake Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-2.5 right-2.5 bg-black/70 hover:bg-black text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1 transition-all border border-white/20 active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>重新拍照</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF] rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#E0E7FF] group-hover:bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center mx-auto transition-transform group-hover:scale-105">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#1E293B]">
                    點擊開啟 iPhone 原生相機拍照
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    拍照拍下「調整後的專櫃陳列／中島盤」以利總部督導稽核
                  </p>
                </div>
              </div>
            )}

            {/* Quick Preset Samples for Desktop/Demo */}
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-[#64748B] mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>或點選測試範例陳列照片快速驗證：</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {samplePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-1.5 rounded-lg text-[10px] font-medium border text-left transition-all ${
                      selectedPreset === preset.id
                        ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF] font-bold'
                        : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="truncate">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Rules Notice */}
          <div className="p-3 bg-[#FFFDF5] rounded-xl border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
            <div className="font-bold flex items-center gap-1 text-[#B45309]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>閉環演算法訓練機制：</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#78350F]">
              確認拍照存證後，系統將自動鎖定該品項 <strong>7 天不發起跨店調撥</strong>。7 天後系統將比對「陳列調整前 vs. 調整後」的動銷提升指數，自動優化門市專屬的 AI 處方演算法。
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!photoUrl || isSubmitting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-sm flex items-center space-x-1.5 ${
                photoUrl && !isSubmitting
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95'
                  : 'bg-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? '驗證寫入中...' : '確認拍照存證並啟動 7 天觀察'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
