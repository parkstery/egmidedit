import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + S / Cmd + S', desc: '코드 저장 & 실시간 미리보기/실행' },
    { key: 'Ctrl + P / Cmd + P', desc: '빠른 파일 찾기 및 열기 (Quick Open)' },
    { key: 'Ctrl + B / Cmd + B', desc: '좌측 사이드바 표시/숨기기 토글' },
    { key: 'Shift + Alt + F', desc: '문서 서식 자동 정렬 (Format Document)' },
    { key: 'Ctrl + F / Cmd + F', desc: '현재 열린 파일 내 찾기' },
    { key: 'Ctrl + H / Cmd + H', desc: '현재 파일 내 단어 찾아 바꾸기' },
    { key: 'Alt + Up / Down', desc: '현재 줄 위/아래로 이동' },
    { key: 'Shift + Alt + Up / Down', desc: '현재 줄 위/아래로 복제' },
    { key: 'Ctrl + / / Cmd + /', desc: '한 줄 주석 토글' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#252526] border border-[#454545] rounded-lg shadow-2xl overflow-hidden flex flex-col text-[#cccccc]"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#333333]">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Keyboard className="w-4 h-4 text-[#58a6ff]" />
            <span>키보드 단축키 안내 (Keyboard Shortcuts)</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#858585] hover:text-white p-1 rounded hover:bg-[#333333]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-[70vh] overflow-y-auto text-xs">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#2a2d2e] border border-[#333333]"
            >
              <span className="text-[#e6edf3]">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded font-mono text-[11px] text-[#58a6ff] shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-4 py-2.5 bg-[#1e1e1e] border-t border-[#333333] text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#007fd4] hover:bg-[#026ec1] text-white text-xs font-medium rounded transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
