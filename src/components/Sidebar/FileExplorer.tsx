import React, { useState } from 'react';
import { 
  FilePlus, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Edit3, 
  Download,
  RotateCw
} from 'lucide-react';
import { FileNode } from '../../types/ide';
import { FileIcon } from './FileIcons';

interface FileExplorerProps {
  files: Record<string, FileNode>;
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (parentId: string, name: string) => void;
  onCreateFolder: (parentId: string, name: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDownloadFile: (nodeId: string) => void;
  onResetProject: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onDownloadFile,
  onResetProject
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [creatingType, setCreatingType] = useState<{ parentId: string; type: 'file' | 'folder' } | null>(null);
  const [newInputName, setNewInputName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleStartCreate = (parentId: string, type: 'file' | 'folder', e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCreatingType({ parentId, type });
    setNewInputName('');
    // Ensure parent folder is open
    setCollapsedFolders(prev => ({ ...prev, [parentId]: false }));
  };

  const handleFinishCreate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!creatingType || !newInputName.trim()) {
      setCreatingType(null);
      return;
    }
    const cleanName = newInputName.trim();
    if (creatingType.type === 'file') {
      onCreateFile(creatingType.parentId, cleanName);
    } else {
      onCreateFolder(creatingType.parentId, cleanName);
    }
    setCreatingType(null);
    setNewInputName('');
  };

  const handleStartRename = (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(node.id);
    setRenameValue(node.name);
  };

  const handleFinishRename = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (renamingId && renameValue.trim()) {
      onRenameNode(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const renderNode = (nodeId: string, depth: number = 0) => {
    const node = files[nodeId];
    if (!node) return null;

    const isFolder = node.type === 'folder';
    const isCollapsed = isFolder ? !!collapsedFolders[node.id] : false;
    const isActive = activeFileId === node.id;

    return (
      <div key={node.id} className="select-none text-xs">
        {/* Node Row */}
        <div
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.id);
            } else {
              onSelectFile(node.id);
            }
          }}
          style={{ paddingLeft: `${Math.max(10, depth * 14 + 10)}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 cursor-pointer transition-colors duration-100 ${
            isActive
              ? 'bg-[#094771] text-white font-medium'
              : 'text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isFolder && (
              <span className="text-[#858585] group-hover:text-white">
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            )}
            <FileIcon filename={node.name} type={node.type} isOpen={!isCollapsed} />
            
            {renamingId === node.id ? (
              <form onSubmit={handleFinishRename} onClick={e => e.stopPropagation()} className="flex-1 mr-2">
                <input
                  type="text"
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={handleFinishRename}
                  onKeyDown={e => e.key === 'Escape' && setRenamingId(null)}
                  className="w-full bg-[#3c3c3c] text-white px-1 py-0.5 rounded outline-none border border-[#007fd4] text-xs"
                />
              </form>
            ) : (
              <span className="truncate text-[12px]">{node.name}</span>
            )}
          </div>

          {/* Action buttons on hover */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[#858585]">
            {isFolder && (
              <>
                <button
                  type="button"
                  title="새 파일"
                  onClick={(e) => handleStartCreate(node.id, 'file', e)}
                  className="hover:text-white p-0.5 rounded hover:bg-[#37373d]"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="새 폴더"
                  onClick={(e) => handleStartCreate(node.id, 'folder', e)}
                  className="hover:text-white p-0.5 rounded hover:bg-[#37373d]"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {!isFolder && (
              <button
                type="button"
                title="단일 파일 다운로드"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadFile(node.id);
                }}
                className="hover:text-white p-0.5 rounded hover:bg-[#37373d]"
              >
                <Download className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              title="이름 바꾸기"
              onClick={(e) => handleStartRename(node, e)}
              className="hover:text-white p-0.5 rounded hover:bg-[#37373d]"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              type="button"
              title="삭제"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`'${node.name}' 항목을 삭제하시겠습니까?`)) {
                  onDeleteNode(node.id);
                }
              }}
              className="hover:text-rose-400 p-0.5 rounded hover:bg-[#37373d]"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Input box when creating inside this folder */}
        {isFolder && creatingType && creatingType.parentId === node.id && (
          <form
            onSubmit={handleFinishCreate}
            style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
            className="flex items-center gap-1.5 py-1 pr-2 bg-[#2a2d2e]"
          >
            <FileIcon filename={newInputName || 'file'} type={creatingType.type} isOpen={false} />
            <input
              type="text"
              autoFocus
              placeholder={creatingType.type === 'file' ? '예: index.ts' : '예: components'}
              value={newInputName}
              onChange={e => setNewInputName(e.target.value)}
              onBlur={() => handleFinishCreate()}
              onKeyDown={e => e.key === 'Escape' && setCreatingType(null)}
              className="flex-1 bg-[#3c3c3c] text-white px-1.5 py-0.5 rounded outline-none border border-[#007fd4] text-xs font-mono"
            />
          </form>
        )}

        {/* Children if expanded */}
        {isFolder && !isCollapsed && node.children && node.children.length > 0 && (
          <div>
            {node.children.map(childId => renderNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootChildren = files['root']?.children || [];

  return (
    <div className="h-full flex flex-col bg-[#252526] select-none text-[#cccccc]">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333333]">
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#bbbbbb]">
          파일 탐색기 (Explorer)
        </span>
        <div className="flex items-center gap-1 text-[#858585]">
          <button
            type="button"
            title="루트에 새 파일 생성"
            onClick={(e) => handleStartCreate('root', 'file', e)}
            className="p-1 hover:text-white rounded hover:bg-[#37373d] transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="루트에 새 폴더 생성"
            onClick={(e) => handleStartCreate('root', 'folder', e)}
            className="p-1 hover:text-white rounded hover:bg-[#37373d] transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="기본 상태로 새로고침"
            onClick={onResetProject}
            className="p-1 hover:text-white rounded hover:bg-[#37373d] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Root level create input */}
      {creatingType && creatingType.parentId === 'root' && (
        <form
          onSubmit={handleFinishCreate}
          className="flex items-center gap-1.5 py-1 px-3 bg-[#2a2d2e] border-b border-[#333333]"
        >
          <FileIcon filename={newInputName || 'file'} type={creatingType.type} isOpen={false} />
          <input
            type="text"
            autoFocus
            placeholder={creatingType.type === 'file' ? '예: app.js' : '예: assets'}
            value={newInputName}
            onChange={e => setNewInputName(e.target.value)}
            onBlur={() => handleFinishCreate()}
            onKeyDown={e => e.key === 'Escape' && setCreatingType(null)}
            className="flex-1 bg-[#3c3c3c] text-white px-1.5 py-0.5 rounded outline-none border border-[#007fd4] text-xs font-mono"
          />
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-1">
        {rootChildren.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-[#858585]">
            <p>열려있는 파일이 없습니다.</p>
            <button
              onClick={() => handleStartCreate('root', 'file')}
              className="mt-2 text-[#58a6ff] hover:underline"
            >
              새 파일 생성하기
            </button>
          </div>
        ) : (
          rootChildren.map(childId => renderNode(childId, 0))
        )}
      </div>

      {/* Bottom workspace info */}
      <div className="px-3 py-2 border-t border-[#333333] text-[11px] text-[#858585] flex items-center justify-between">
        <span>워크스페이스: 프로젝트</span>
        <span>{Object.values(files).filter(f => f.type === 'file').length}개 파일</span>
      </div>
    </div>
  );
};
