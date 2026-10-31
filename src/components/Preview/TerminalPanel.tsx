import React, { useState, useRef, useEffect } from 'react';
import { ConsoleMessage, ActiveBottomTab } from '../../types/ide';
import { 
  Terminal, 
  Trash2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

interface TerminalPanelProps {
  logs: ConsoleMessage[];
  onClearLogs: () => void;
  onExecuteCommand: (code: string) => void;
  activeBottomTab: ActiveBottomTab;
  onChangeBottomTab: (tab: ActiveBottomTab) => void;
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  logs,
  onClearLogs,
  onExecuteCommand,
  activeBottomTab,
  onChangeBottomTab,
  onClose,
  isMaximized,
  onToggleMaximize
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warn' | 'log'>('all');
  const [replInput, setReplInput] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleReplSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replInput.trim()) return;
    onExecuteCommand(replInput.trim());
    setReplInput('');
  };

  const filteredLogs = logs.filter(l => {
    if (filterLevel === 'all') return true;
    return l.level === filterLevel;
  });

  const errorCount = logs.filter(l => l.level === 'error').length;
  const warnCount = logs.filter(l => l.level === 'warn').length;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] border-t border-[#333333] select-none text-[#cccccc]">
      {/* Bottom Dock Header Bar */}
      <div className="h-9 bg-[#252526] border-b border-[#333333] flex items-center justify-between px-3 text-xs shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChangeBottomTab('console')}
            className={`flex items-center gap-1.5 py-1 text-xs border-b-2 font-medium transition-colors ${
              activeBottomTab === 'console'
                ? 'border-[#007fd4] text-white'
                : 'border-transparent text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>콘솔 / 터미널 (Console)</span>
            {logs.length > 0 && (
              <span className="text-[10px] bg-[#3a3d41] px-1.5 py-0.2 rounded font-mono text-white">
                {logs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeBottomTab('problems')}
            className={`flex items-center gap-1.5 py-1 text-xs border-b-2 font-medium transition-colors ${
              activeBottomTab === 'problems'
                ? 'border-[#007fd4] text-white'
                : 'border-transparent text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>문제 (Problems)</span>
            {(errorCount > 0 || warnCount > 0) && (
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-mono">
                {errorCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Level Filter for console */}
          {activeBottomTab === 'console' && (
            <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded text-[11px] border border-[#333333]">
              {(['all', 'log', 'warn', 'error'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2 py-0.5 rounded uppercase font-mono text-[10px] transition-colors ${
                    filterLevel === lvl
                      ? 'bg-[#007fd4] text-white'
                      : 'text-[#858585] hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            title="콘솔 로그 지우기"
            onClick={onClearLogs}
            className="p-1 hover:text-white rounded hover:bg-[#37373d] text-[#858585] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            title={isMaximized ? '기본 크기로 복원' : '패널 최대화'}
            onClick={onToggleMaximize}
            className="p-1 hover:text-white rounded hover:bg-[#37373d] text-[#858585] transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            title="패널 닫기"
            onClick={onClose}
            className="p-1 hover:text-white rounded hover:bg-[#37373d] text-[#858585] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs select-text space-y-1">
        {activeBottomTab === 'console' ? (
          filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#858585]">
              로그가 없습니다. 상단 '실행' 버튼을 누르거나 콘솔에 명령어를 입력하세요.
            </div>
          ) : (
            filteredLogs.map(l => (
              <div
                key={l.id}
                className={`flex items-start gap-2 px-2 py-1 rounded transition-colors ${
                  l.level === 'error'
                    ? 'bg-rose-950/30 text-rose-300 border-l-2 border-rose-500'
                    : l.level === 'warn'
                    ? 'bg-amber-950/30 text-amber-300 border-l-2 border-amber-500'
                    : l.level === 'info'
                    ? 'text-sky-300'
                    : l.level === 'system'
                    ? 'text-[#58a6ff]'
                    : 'text-[#cccccc]'
                }`}
              >
                <span className="text-[10px] text-[#6e7681] shrink-0 font-mono select-none">
                  {l.timestamp}
                </span>

                <span className="shrink-0 mt-0.5">
                  {l.level === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                  {l.level === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  {l.level === 'info' && <Info className="w-3.5 h-3.5 text-sky-400" />}
                  {(l.level === 'log' || l.level === 'system') && <ChevronRight className="w-3 h-3 text-[#555555]" />}
                </span>

                <pre className="whitespace-pre-wrap break-all flex-1 font-mono text-xs">
                  {l.message}
                </pre>
              </div>
            ))
          )
        ) : (
          /* Problems Tab */
          <div className="p-2 space-y-2">
            {errorCount === 0 && warnCount === 0 ? (
              <div className="text-center py-6 text-xs text-[#858585]">
                발견된 오류나 경고가 없습니다. 코드가 정상입니다.
              </div>
            ) : (
              logs
                .filter(l => l.level === 'error' || l.level === 'warn')
                .map(p => (
                  <div key={p.id} className="flex items-center gap-2 p-2 bg-[#252526] rounded border border-[#333333]">
                    {p.level === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-xs text-[#e6edf3] font-mono">{p.message}</span>
                  </div>
                ))
            )}
          </div>
        )}
        <div ref={logEndRef} />
      </div>

      {/* Interactive REPL prompt */}
      {activeBottomTab === 'console' && (
        <form
          onSubmit={handleReplSubmit}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] border-t border-[#333333]"
        >
          <span className="text-[#007fd4] font-mono font-bold text-xs">{'>'}</span>
          <input
            type="text"
            value={replInput}
            onChange={e => setReplInput(e.target.value)}
            placeholder="자바스크립트 표현식 실행 (예: 2 + 2 또는 Math.random())..."
            className="flex-1 bg-transparent text-white text-xs font-mono outline-none placeholder-[#666666]"
          />
          <button
            type="submit"
            className="text-[11px] bg-[#3a3d41] hover:bg-[#474a4f] text-[#cccccc] px-2 py-0.5 rounded transition-colors"
          >
            실행 (Enter)
          </button>
        </form>
      )}
    </div>
  );
};
