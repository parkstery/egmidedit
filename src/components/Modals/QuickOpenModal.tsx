import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { FileNode } from '../../types/ide';
import { FileIcon } from '../Sidebar/FileIcons';

interface QuickOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, FileNode>;
  onSelectFile: (fileId: string) => void;
}

export const QuickOpenModal: React.FC<QuickOpenModalProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fileList = Object.values(files).filter(f => f.type === 'file');

  const filtered = fileList.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.path.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelectFile(filtered[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onSelectFile, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-[#252526] border border-[#454545] rounded-lg shadow-2xl overflow-hidden flex flex-col text-[#cccccc]"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#1e1e1e] border-b border-[#333333]">
          <Search className="w-4 h-4 text-[#858585] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="파일 이름으로 검색하여 열기... (방향키로 이동, Enter로 선택)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-xs outline-none placeholder-[#6e7681]"
          />
          <button
            onClick={onClose}
            className="text-[#858585] hover:text-white p-1 rounded hover:bg-[#333333]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1 text-xs">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-[#858585]">일치하는 파일이 없습니다.</div>
          ) : (
            filtered.map((file, idx) => (
              <div
                key={file.id}
                onClick={() => {
                  onSelectFile(file.id);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                  selectedIndex === idx
                    ? 'bg-[#094771] text-white'
                    : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileIcon filename={file.name} />
                  <span className="font-medium text-xs text-white">{file.name}</span>
                  <span className="text-[11px] text-[#858585] truncate">{file.path}</span>
                </div>
                <span className="text-[10px] text-[#858585] font-mono shrink-0">
                  {file.language}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-3 py-1.5 bg-[#1e1e1e] border-t border-[#333333] text-[10px] text-[#858585] flex items-center justify-between">
          <span><kbd className="px-1 py-0.5 bg-[#333333] rounded text-white font-mono">↑</kbd> <kbd className="px-1 py-0.5 bg-[#333333] rounded text-white font-mono">↓</kbd> 선택 이동</span>
          <span><kbd className="px-1 py-0.5 bg-[#333333] rounded text-white font-mono">Enter</kbd> 열기</span>
          <span><kbd className="px-1 py-0.5 bg-[#333333] rounded text-white font-mono">Esc</kbd> 닫기</span>
        </div>
      </div>
    </div>
  );
};
