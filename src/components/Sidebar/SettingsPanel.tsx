import React from 'react';
import { EditorSettings } from '../../types/ide';
import { Sliders } from 'lucide-react';

interface SettingsPanelProps {
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings
}) => {
  return (
    <div className="h-full flex flex-col bg-[#252526] select-none text-[#cccccc]">
      <div className="p-3 border-b border-[#333333]">
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#bbbbbb] flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span>에디터 환경설정 (Settings)</span>
        </span>
        <p className="text-[11px] text-[#858585] mt-1">
          Monaco Editor 및 IDE 런타임 환경을 맞춤 설정합니다.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* Editor Theme */}
        <div>
          <label className="block text-[11px] font-semibold text-[#dddddd] mb-1">
            에디터 테마 (Theme)
          </label>
          <select
            value={settings.theme}
            onChange={(e) => onUpdateSettings({ theme: e.target.value as any })}
            className="w-full bg-[#3c3c3c] text-white px-2 py-1.5 rounded outline-none border border-[#3c3c3c] focus:border-[#007fd4]"
          >
            <option value="vs-dark">Dark (Visual Studio Dark)</option>
            <option value="light">Light (Visual Studio Light)</option>
            <option value="hc-black">High Contrast (HC Black)</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-semibold text-[#dddddd]">
              글꼴 크기 (Font Size)
            </label>
            <span className="font-mono text-[#858585]">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="11"
            max="24"
            value={settings.fontSize}
            onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
            className="w-full accent-[#007fd4] cursor-pointer"
          />
        </div>

        {/* Tab Size */}
        <div>
          <label className="block text-[11px] font-semibold text-[#dddddd] mb-1">
            들여쓰기 탭 크기 (Tab Size)
          </label>
          <div className="flex gap-2">
            {[2, 4].map(size => (
              <button
                key={size}
                type="button"
                onClick={() => onUpdateSettings({ tabSize: size })}
                className={`flex-1 py-1.5 rounded font-mono text-xs border ${
                  settings.tabSize === size
                    ? 'bg-[#007fd4] border-[#007fd4] text-white'
                    : 'bg-[#2d2d2d] border-[#383b3d] text-[#cccccc] hover:bg-[#383b3d]'
                }`}
              >
                {size} 공백 (Spaces)
              </button>
            ))}
          </div>
        </div>

        {/* Word Wrap */}
        <div>
          <label className="block text-[11px] font-semibold text-[#dddddd] mb-1">
            줄 바꿈 (Word Wrap)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onUpdateSettings({ wordWrap: 'on' })}
              className={`flex-1 py-1.5 rounded text-xs border ${
                settings.wordWrap === 'on'
                  ? 'bg-[#007fd4] border-[#007fd4] text-white'
                  : 'bg-[#2d2d2d] border-[#383b3d] text-[#cccccc] hover:bg-[#383b3d]'
              }`}
            >
              자동 줄바꿈 (On)
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ wordWrap: 'off' })}
              className={`flex-1 py-1.5 rounded text-xs border ${
                settings.wordWrap === 'off'
                  ? 'bg-[#007fd4] border-[#007fd4] text-white'
                  : 'bg-[#2d2d2d] border-[#383b3d] text-[#cccccc] hover:bg-[#383b3d]'
              }`}
            >
              해제 (Off)
            </button>
          </div>
        </div>

        {/* Toggles List */}
        <div className="pt-2 border-t border-[#333333] space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[#cccccc]">미니맵 표시 (Minimap)</span>
            <input
              type="checkbox"
              checked={settings.minimap}
              onChange={(e) => onUpdateSettings({ minimap: e.target.checked })}
              className="accent-[#007fd4] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[#cccccc]">괄호 쌍 색상화 (Bracket Colorization)</span>
            <input
              type="checkbox"
              checked={settings.bracketPairColorization}
              onChange={(e) => onUpdateSettings({ bracketPairColorization: e.target.checked })}
              className="accent-[#007fd4] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[#cccccc]">코드 수정 시 실시간 자동 실행</span>
            <input
              type="checkbox"
              checked={settings.autoRunOnChange}
              onChange={(e) => onUpdateSettings({ autoRunOnChange: e.target.checked })}
              className="accent-[#007fd4] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[#cccccc]">저장 시 자동 서식 정렬 (Format on Save)</span>
            <input
              type="checkbox"
              checked={settings.formatOnSave}
              onChange={(e) => onUpdateSettings({ formatOnSave: e.target.checked })}
              className="accent-[#007fd4] w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
