import React from 'react';
import { GitBranch, CheckCheck, Wand2 } from 'lucide-react';
import { FileNode } from '../../types/ide';

interface StatusBarProps {
  activeFile: FileNode | null;
  cursorPosition: { line: number; col: number };
  tabSize: number;
  onFormatDocument: () => void;
  isRunning: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeFile,
  cursorPosition,
  tabSize,
  onFormatDocument,
  isRunning
}) => {
  return (
    <div className="h-6 bg-[#007fd4] text-white flex items-center justify-between px-3 text-[11px] select-none font-sans shrink-0">
      {/* Left side items */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 hover:bg-[#026ec1] px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        <div className="flex items-center gap-1 text-white/90">
          <CheckCheck className="w-3.5 h-3.5" />
          <span>{isRunning ? '코드 실행 중...' : '준비 완료'}</span>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onFormatDocument}
          title="문서 서식 자동 정렬"
          className="flex items-center gap-1 hover:bg-[#026ec1] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
        >
          <Wand2 className="w-3 h-3" />
          <span>Format</span>
        </button>

        <div className="hover:bg-[#026ec1] px-1.5 py-0.5 rounded cursor-pointer transition-colors font-mono">
          Ln {cursorPosition.line}, Col {cursorPosition.col}
        </div>

        <div className="hover:bg-[#026ec1] px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          Spaces: {tabSize}
        </div>

        <div className="hover:bg-[#026ec1] px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          UTF-8
        </div>

        <div className="hover:bg-[#026ec1] px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium">
          {activeFile?.language ? activeFile.language.toUpperCase() : 'PLAIN TEXT'}
        </div>
      </div>
    </div>
  );
};
