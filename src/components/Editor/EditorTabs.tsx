import React, { useState } from 'react';
import { X, Play, Wand2 } from 'lucide-react';
import { FileNode, OpenTab } from '../../types/ide';
import { FileIcon } from '../Sidebar/FileIcons';

interface EditorTabsProps {
  openTabs: OpenTab[];
  activeFileId: string | null;
  files: Record<string, FileNode>;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string, e: React.MouseEvent) => void;
  onCloseAllTabs: () => void;
  onFormatDocument: () => void;
  onRunCode: () => void;
  onDropFileId?: (fileId: string) => void;
  onDropExternalFiles?: (files: FileList | File[]) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  openTabs,
  activeFileId,
  files,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onFormatDocument,
  onRunCode,
  onDropFileId,
  onDropExternalFiles
}) => {
  const [isTabDragOver, setIsTabDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isTabDragOver) setIsTabDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsTabDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTabDragOver(false);

    const fileId = e.dataTransfer.getData('application/x-monaco-file-id') || e.dataTransfer.getData('text/plain');
    if (fileId && fileId.startsWith('file:') && onDropFileId) {
      onDropFileId(fileId);
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onDropExternalFiles) {
      onDropExternalFiles(e.dataTransfer.files);
    }
  };

  if (openTabs.length === 0) {
    return (
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`h-9 bg-[#252526] border-b border-[#1e1e1e] flex items-center px-4 text-xs transition-colors ${
          isTabDragOver ? 'bg-[#094771] text-white' : 'text-[#858585]'
        }`}
      >
        {isTabDragOver ? '파일을 여기에 놓아 탭 열기' : '열린 탭이 없습니다. (탐색기에서 파일을 드래그하여 열 수 있습니다)'}
      </div>
    );
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-9 bg-[#252526] border-b border-[#1e1e1e] flex items-center justify-between select-none overflow-hidden relative ${
        isTabDragOver ? 'ring-1 ring-[#007fd4] bg-[#1e2a38]' : ''
      }`}
    >
      {/* Scrollable Tabs List */}
      <div className="flex items-center overflow-x-auto h-full scrollbar-none flex-1">
        {openTabs.map((tab) => {
          const file = files[tab.fileId];
          if (!file) return null;
          const isActive = activeFileId === tab.fileId;

          return (
            <div
              key={tab.fileId}
              onClick={() => onSelectTab(tab.fileId)}
              className={`group h-full flex items-center gap-2 px-3 text-xs border-r border-[#1e1e1e] cursor-pointer shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#1e1e1e] text-white border-t border-t-[#007fd4] font-medium'
                  : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#252526] hover:text-[#cccccc]'
              }`}
            >
              <FileIcon filename={file.name} />
              <span className="truncate max-w-[130px]">{file.name}</span>

              {/* Dirty indicator dot or Close button */}
              <div className="w-4 h-4 flex items-center justify-center">
                {tab.isDirty ? (
                  <span
                    onClick={(e) => onCloseTab(tab.fileId, e)}
                    className="w-2 h-2 rounded-full bg-white group-hover:hidden"
                  />
                ) : null}
                <button
                  type="button"
                  title="탭 닫기"
                  onClick={(e) => onCloseTab(tab.fileId, e)}
                  className={`p-0.5 rounded hover:bg-[#474747] text-[#858585] hover:text-white ${
                    tab.isDirty ? 'hidden group-hover:flex' : 'flex'
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Tools in Tab Bar */}
      <div className="flex items-center gap-1 px-2 shrink-0">
        <button
          type="button"
          title="문서 서식 자동 정렬 (Shift+Alt+F)"
          onClick={onFormatDocument}
          className="p-1 hover:text-white rounded hover:bg-[#37373d] text-[#858585] transition-colors"
        >
          <Wand2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="실행 (Ctrl+S / Cmd+S)"
          onClick={onRunCode}
          className="flex items-center gap-1 bg-[#238636] hover:bg-[#2ea043] text-white text-[11px] font-medium px-2 py-1 rounded transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>실행</span>
        </button>
      </div>
    </div>
  );
};
