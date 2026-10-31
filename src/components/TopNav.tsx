import React, { useRef } from 'react';
import { 
  Play, 
  Download, 
  Upload, 
  Keyboard, 
  Code2, 
  Columns, 
  PanelBottom, 
  Sidebar as SidebarIcon,
  Search,
  Sparkles
} from 'lucide-react';
import { ProjectTemplate } from '../types/ide';

interface TopNavProps {
  currentTemplate: ProjectTemplate;
  onRunCode: () => void;
  isRunning: boolean;
  onOpenQuickOpen: () => void;
  onOpenShortcuts: () => void;
  onExportZip: () => void;
  onImportZip: (file: File) => void;
  onOpenTemplates: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isBottomPanelOpen: boolean;
  onToggleBottomPanel: () => void;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTemplate,
  onRunCode,
  isRunning,
  onOpenQuickOpen,
  onOpenShortcuts,
  onExportZip,
  onImportZip,
  onOpenTemplates,
  isSidebarOpen,
  onToggleSidebar,
  isBottomPanelOpen,
  onToggleBottomPanel,
  isPreviewOpen,
  onTogglePreview
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportZip(file);
    }
  };

  return (
    <header className="h-11 bg-[#1e1e1e] border-b border-[#333333] flex items-center justify-between gap-8 px-4 text-xs select-none shrink-0 z-20">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-6 h-6 rounded bg-[#007fd4] flex items-center justify-center text-white shadow-sm">
          <Code2 className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">
          Monaco Web IDE
        </span>
        <span className="text-[11px] text-[#858585] border-l border-[#333333] pl-2 font-mono">
          {currentTemplate.title}
        </span>
      </div>

      {/* Zone 2: 4–5 clean single-line action buttons */}
      <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-[#cccccc]">
        <button
          type="button"
          onClick={onOpenQuickOpen}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#2d2d2d]"
        >
          <Search className="w-3.5 h-3.5 text-[#858585]" />
          <span>빠른 열기</span>
          <kbd className="text-[10px] bg-[#333333] px-1 py-0.5 rounded text-[#858585] font-mono">⌘P</kbd>
        </button>

        <button
          type="button"
          onClick={onOpenTemplates}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#2d2d2d]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>템플릿 전환</span>
        </button>

        <button
          type="button"
          onClick={onExportZip}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#2d2d2d]"
        >
          <Download className="w-3.5 h-3.5 text-[#858585]" />
          <span>ZIP 내보내기</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#2d2d2d]"
        >
          <Upload className="w-3.5 h-3.5 text-[#858585]" />
          <span>프로젝트 불러오기</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={onOpenShortcuts}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#2d2d2d]"
        >
          <Keyboard className="w-3.5 h-3.5 text-[#858585]" />
          <span>단축키</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action + layout toggles */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Layout Panels Toggles */}
        <div className="flex items-center gap-0.5 bg-[#252526] p-0.5 rounded border border-[#333333]">
          <button
            type="button"
            title="사이드바 토글 (Ctrl+B)"
            onClick={onToggleSidebar}
            className={`p-1 rounded transition-colors ${
              isSidebarOpen ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <SidebarIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="하단 터미널/콘솔 패널 토글"
            onClick={onToggleBottomPanel}
            className={`p-1 rounded transition-colors ${
              isBottomPanelOpen ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <PanelBottom className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="웹 미리보기 분할창 토글"
            onClick={onTogglePreview}
            className={`p-1 rounded transition-colors ${
              isPreviewOpen ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary CTA Run Button */}
        <button
          type="button"
          onClick={onRunCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-medium text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>실행 (Run)</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-black/20 px-1 py-0.2 rounded font-mono">
            ⌘S
          </kbd>
        </button>
      </div>
    </header>
  );
};
