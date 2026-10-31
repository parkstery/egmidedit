import React, { useState, useMemo } from 'react';
import { Search, Replace, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '../../types/ide';
import { FileIcon } from './FileIcons';

interface SearchPanelProps {
  files: Record<string, FileNode>;
  onSelectFile: (fileId: string) => void;
  onReplaceInFile: (fileId: string, search: string, replaceWith: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  files,
  onSelectFile,
  onReplaceInFile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [showReplace, setShowReplace] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: Array<{
      fileId: string;
      fileName: string;
      filePath: string;
      matches: Array<{ line: number; text: string; matchIndex: number }>;
    }> = [];

    const fileList = Object.values(files).filter(f => f.type === 'file' && f.content !== undefined);

    for (const file of fileList) {
      const content = file.content || '';
      const lines = content.split('\n');
      const fileMatches: Array<{ line: number; text: string; matchIndex: number }> = [];

      lines.forEach((lineText, idx) => {
        let isMatch = false;
        if (isCaseSensitive) {
          isMatch = lineText.includes(searchTerm);
        } else {
          isMatch = lineText.toLowerCase().includes(searchTerm.toLowerCase());
        }

        if (isMatch) {
          fileMatches.push({
            line: idx + 1,
            text: lineText.trim(),
            matchIndex: isCaseSensitive ? lineText.indexOf(searchTerm) : lineText.toLowerCase().indexOf(searchTerm.toLowerCase())
          });
        }
      });

      if (fileMatches.length > 0) {
        results.push({
          fileId: file.id,
          fileName: file.name,
          filePath: file.path,
          matches: fileMatches
        });
      }
    }

    return results;
  }, [files, searchTerm, isCaseSensitive]);

  const totalMatches = searchResults.reduce((acc, r) => acc + r.matches.length, 0);

  const handleReplaceAllInFile = (fileId: string) => {
    if (!searchTerm) return;
    onReplaceInFile(fileId, searchTerm, replaceTerm);
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] select-none text-[#cccccc]">
      <div className="p-3 border-b border-[#333333]">
        <div className="text-[11px] font-bold tracking-wider uppercase text-[#bbbbbb] mb-2 flex items-center justify-between">
          <span>전체 검색 (Search)</span>
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="text-[11px] text-[#58a6ff] hover:underline cursor-pointer"
          >
            {showReplace ? '바꾸기 숨기기' : '바꾸기 표시'}
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="단어 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#3c3c3c] text-white pl-7 pr-12 py-1 rounded text-xs outline-none border border-[#3c3c3c] focus:border-[#007fd4]"
          />
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#858585]" />
          <button
            onClick={() => setIsCaseSensitive(!isCaseSensitive)}
            title="대소문자 구분"
            className={`absolute right-2 top-1 px-1 text-[10px] font-mono rounded ${
              isCaseSensitive ? 'bg-[#007fd4] text-white' : 'text-[#858585] hover:text-white'
            }`}
          >
            Aa
          </button>
        </div>

        {/* Replace input */}
        {showReplace && (
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="대체할 단어..."
              value={replaceTerm}
              onChange={e => setReplaceTerm(e.target.value)}
              className="w-full bg-[#3c3c3c] text-white pl-7 pr-2 py-1 rounded text-xs outline-none border border-[#3c3c3c] focus:border-[#007fd4]"
            />
            <Replace className="w-3.5 h-3.5 absolute left-2 top-2 text-[#858585]" />
          </div>
        )}

        <div className="text-[11px] text-[#858585]">
          {searchTerm.trim() ? (
            <span>{searchResults.length}개 파일에서 {totalMatches}건 일치</span>
          ) : (
            <span>검색어를 입력하세요.</span>
          )}
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto p-2">
        {searchResults.map(result => (
          <div key={result.fileId} className="mb-3">
            <div className="flex items-center justify-between text-xs py-1 px-1 bg-[#2d2d2d] rounded text-[#cccccc]">
              <div
                onClick={() => onSelectFile(result.fileId)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-white truncate flex-1"
              >
                <FileIcon filename={result.fileName} />
                <span className="font-medium truncate">{result.fileName}</span>
                <span className="text-[10px] text-[#858585] truncate">{result.filePath}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] bg-[#3a3d41] px-1.5 py-0.5 rounded text-[#cccccc]">
                  {result.matches.length}
                </span>
                {showReplace && (
                  <button
                    onClick={() => handleReplaceAllInFile(result.fileId)}
                    title="이 파일에서 모두 바꾸기"
                    className="text-[10px] bg-[#007fd4] text-white px-1.5 py-0.5 rounded hover:bg-[#026ec1]"
                  >
                    바꾸기
                  </button>
                )}
              </div>
            </div>

            <div className="mt-1 pl-4 space-y-0.5">
              {result.matches.map((m, i) => (
                <div
                  key={i}
                  onClick={() => onSelectFile(result.fileId)}
                  className="text-[11px] font-mono text-[#858585] hover:bg-[#2a2d2e] hover:text-[#cccccc] px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-2 truncate"
                >
                  <span className="text-[#569cd6] shrink-0">{m.line}:</span>
                  <span className="truncate">{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
