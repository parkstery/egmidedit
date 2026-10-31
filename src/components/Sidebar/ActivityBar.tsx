import React from 'react';
import { Files, Search, Sparkles, Settings } from 'lucide-react';
import { ActiveSidebarTab } from '../../types/ide';

interface ActivityBarProps {
  activeTab: ActiveSidebarTab;
  isSidebarOpen: boolean;
  onSelectTab: (tab: ActiveSidebarTab) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  isSidebarOpen,
  onSelectTab
}) => {
  const tabs = [
    { id: 'explorer' as ActiveSidebarTab, icon: Files, title: '파일 탐색기 (Ctrl+Shift+E)' },
    { id: 'search' as ActiveSidebarTab, icon: Search, title: '전체 검색 (Ctrl+Shift+F)' },
    { id: 'templates' as ActiveSidebarTab, icon: Sparkles, title: '템플릿 둘러보기' },
    { id: 'settings' as ActiveSidebarTab, icon: Settings, title: '에디터 설정' },
  ];

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-2 shrink-0 border-r border-[#252526] select-none justify-between">
      <div className="flex flex-col items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isSidebarOpen && activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              title={tab.title}
              onClick={() => onSelectTab(tab.id)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-[#858585] hover:text-[#cccccc]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#ffffff] rounded-r" />
              )}
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
