import React, { useState } from 'react';
import { RotateCw, Smartphone, Tablet, Monitor, ExternalLink, Eye } from 'lucide-react';

interface WebPreviewProps {
  bundledHtml: string;
  onRefresh: () => void;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ bundledHtml, onRefresh }) => {
  const [viewport, setViewport] = useState<'responsive' | 'tablet' | 'mobile'>('responsive');
  const [iframeKey, setIframeKey] = useState(0);

  const handleManualRefresh = () => {
    setIframeKey(k => k + 1);
    onRefresh();
  };

  const openInNewWindow = () => {
    const win = window.open();
    if (win) {
      win.document.open();
      win.document.write(bundledHtml);
      win.document.close();
    }
  };

  const getWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px] shadow-2xl border border-[#3c3c3c] rounded-lg my-4';
      case 'tablet':
        return 'w-[768px] shadow-2xl border border-[#3c3c3c] rounded-lg my-4';
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#181818] select-none text-[#cccccc] overflow-hidden">
      {/* Preview Header Bar */}
      <div className="h-9 bg-[#252526] border-b border-[#333333] flex items-center justify-between px-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span className="font-semibold text-[11px] uppercase tracking-wider text-[#bbbbbb]">
            웹 미리보기 (Live Preview)
          </span>
        </div>

        {/* Viewport Segmented Switcher */}
        <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded border border-[#333333]">
          <button
            type="button"
            title="반응형 전체 화면"
            onClick={() => setViewport('responsive')}
            className={`p-1 rounded transition-colors ${
              viewport === 'responsive' ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="태블릿 뷰 (768px)"
            onClick={() => setViewport('tablet')}
            className={`p-1 rounded transition-colors ${
              viewport === 'tablet' ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="모바일 뷰 (375px)"
            onClick={() => setViewport('mobile')}
            className={`p-1 rounded transition-colors ${
              viewport === 'mobile' ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 text-[#858585]">
          <button
            type="button"
            title="미리보기 새로고침"
            onClick={handleManualRefresh}
            className="p-1 hover:text-white rounded hover:bg-[#37373d] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="새 탭에서 열기"
            onClick={openInNewWindow}
            className="p-1 hover:text-white rounded hover:bg-[#37373d] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-auto bg-[#0f0f10] flex items-center justify-center relative">
        <div className={`h-full flex transition-all duration-200 ${getWidthClass()}`}>
          <iframe
            key={iframeKey}
            title="IDE Preview Output"
            srcDoc={bundledHtml}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
