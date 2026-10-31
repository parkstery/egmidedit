import React from 'react';
import { PROJECT_TEMPLATES } from '../../constants/templates';
import { ProjectTemplate } from '../../types/ide';
import { Sparkles, Code, Play } from 'lucide-react';

interface TemplatesPanelProps {
  currentTemplateId?: string;
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  currentTemplateId,
  onSelectTemplate
}) => {
  return (
    <div className="h-full flex flex-col bg-[#252526] select-none text-[#cccccc]">
      <div className="p-3 border-b border-[#333333]">
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#bbbbbb] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>프로젝트 템플릿 (Templates)</span>
        </span>
        <p className="text-[11px] text-[#858585] mt-1">
          원하는 언어 및 환경의 스타터 템플릿을 선택하여 즉시 개발을 시작하세요.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {PROJECT_TEMPLATES.map((tmpl) => {
          const isSelected = currentTemplateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => {
                if (confirm(`'${tmpl.title}' 템플릿을 로드하시겠습니까? 현재 변경사항은 덮어쓰여집니다.`)) {
                  onSelectTemplate(tmpl);
                }
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#1e1e1e] border-[#007fd4] shadow-sm'
                  : 'bg-[#2a2d2e] border-[#383b3d] hover:border-[#4d5154] hover:bg-[#2d3133]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#58a6ff]" />
                  {tmpl.title}
                </span>
                <span className="text-[10px] bg-[#3a3d41] text-[#9cdcfe] px-1.5 py-0.5 rounded font-mono">
                  {tmpl.tag}
                </span>
              </div>

              <p className="text-[11px] text-[#9da5b4] leading-relaxed mb-2.5">
                {tmpl.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#858585] border-t border-[#383b3d] pt-2">
                <span>{Object.keys(tmpl.files).length}개 파일 포함</span>
                <span className="flex items-center gap-1 text-[#58a6ff] hover:underline">
                  <Play className="w-3 h-3 fill-current" /> 로드하기
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
