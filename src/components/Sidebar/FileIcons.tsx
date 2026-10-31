import React from 'react';
import { 
  FileCode2, 
  FileJson, 
  FileText, 
  FileType2, 
  Code2, 
  Folder, 
  FolderOpen,
  Terminal,
  File
} from 'lucide-react';

interface FileIconProps {
  filename: string;
  type?: 'file' | 'folder';
  isOpen?: boolean;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ filename, type = 'file', isOpen = false, className = 'w-4 h-4' }) => {
  if (type === 'folder') {
    return isOpen ? (
      <FolderOpen className={`${className} text-amber-400 shrink-0`} />
    ) : (
      <Folder className={`${className} text-amber-400 shrink-0`} />
    );
  }

  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'html':
    case 'htm':
      return <FileCode2 className={`${className} text-orange-500 shrink-0`} />;
    case 'css':
    case 'scss':
      return <FileType2 className={`${className} text-sky-400 shrink-0`} />;
    case 'js':
    case 'mjs':
      return <Code2 className={`${className} text-yellow-400 shrink-0`} />;
    case 'jsx':
      return <Code2 className={`${className} text-cyan-400 shrink-0`} />;
    case 'ts':
    case 'tsx':
      return <Code2 className={`${className} text-blue-400 shrink-0`} />;
    case 'py':
      return <Terminal className={`${className} text-emerald-400 shrink-0`} />;
    case 'json':
      return <FileJson className={`${className} text-amber-300 shrink-0`} />;
    case 'md':
    case 'markdown':
    case 'txt':
      return <FileText className={`${className} text-slate-300 shrink-0`} />;
    default:
      return <File className={`${className} text-slate-400 shrink-0`} />;
  }
};
