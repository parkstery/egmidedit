export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: FileType;
  content?: string;
  language?: string;
  parentId?: string | null;
  children?: string[]; // IDs of child nodes
  isExpanded?: boolean;
}

export interface OpenTab {
  fileId: string;
  isDirty?: boolean;
}

export type ThemeMode = 'vs-dark' | 'light' | 'hc-black';

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  minimap: boolean;
  lineNumbers: 'on' | 'off' | 'relative';
  theme: ThemeMode;
  autoRunOnChange: boolean;
  bracketPairColorization: boolean;
  formatOnSave: boolean;
}

export type ConsoleLogLevel = 'log' | 'info' | 'warn' | 'error' | 'system';

export interface ConsoleMessage {
  id: string;
  level: ConsoleLogLevel;
  message: string;
  timestamp: string;
  count?: number;
}

export type ActiveSidebarTab = 'explorer' | 'search' | 'templates' | 'settings';
export type ActiveBottomTab = 'console' | 'preview' | 'problems';

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  language: string;
  tag: string;
  files: Record<string, string>; // path -> content
  activeFile: string;
  runnerType: 'web' | 'python' | 'node';
}
