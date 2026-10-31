import React from 'react';
import { ChevronRight } from 'lucide-react';
import { FileNode } from '../../types/ide';
import { FileIcon } from '../Sidebar/FileIcons';

interface BreadcrumbsProps {
  activeFile: FileNode | null;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeFile }) => {
  if (!activeFile) {
    return (
      <div className="h-6 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-4 text-[11px] text-[#858585]">
        파일을 선택하세요
      </div>
    );
  }

  const parts = activeFile.path.replace(/^\//, '').split('/');

  return (
    <div className="h-6 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-4 text-[11px] text-[#858585] select-none gap-1.5 overflow-hidden">
      <span>workspace</span>
      <ChevronRight className="w-3 h-3 text-[#555555] shrink-0" />
      {parts.slice(0, -1).map((part, idx) => (
        <React.Fragment key={idx}>
          <span className="hover:text-[#cccccc] transition-colors">{part}</span>
          <ChevronRight className="w-3 h-3 text-[#555555] shrink-0" />
        </React.Fragment>
      ))}
      <span className="text-white flex items-center gap-1 font-medium truncate">
        <FileIcon filename={activeFile.name} className="w-3.5 h-3.5" />
        {activeFile.name}
      </span>
    </div>
  );
};
