import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileNode, 
  OpenTab, 
  EditorSettings, 
  ConsoleMessage, 
  ActiveSidebarTab, 
  ActiveBottomTab, 
  ProjectTemplate 
} from './types/ide';
import { PROJECT_TEMPLATES } from './constants/templates';
import { 
  buildFileTreeFromDict, 
  exportProjectToZip, 
  importProjectFromZip,
  getLanguageFromFilename 
} from './services/fileSystem';
import { 
  generateWebBundle, 
  runPythonCode, 
  runJavaScriptSandbox 
} from './services/runner';
import { TopNav } from './components/TopNav';
import { ActivityBar } from './components/Sidebar/ActivityBar';
import { FileExplorer } from './components/Sidebar/FileExplorer';
import { SearchPanel } from './components/Sidebar/SearchPanel';
import { TemplatesPanel } from './components/Sidebar/TemplatesPanel';
import { SettingsPanel } from './components/Sidebar/SettingsPanel';
import { EditorTabs } from './components/Editor/EditorTabs';
import { Breadcrumbs } from './components/Editor/Breadcrumbs';
import { MonacoEditorWrapper } from './components/Editor/MonacoEditorWrapper';
import { StatusBar } from './components/Editor/StatusBar';
import { WebPreview } from './components/Preview/WebPreview';
import { TerminalPanel } from './components/Preview/TerminalPanel';
import { QuickOpenModal } from './components/Modals/QuickOpenModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  lineNumbers: 'on',
  theme: 'vs-dark',
  autoRunOnChange: true,
  bracketPairColorization: true,
  formatOnSave: true,
};

export default function App() {
  // Current active starter template
  const [currentTemplate, setCurrentTemplate] = useState<ProjectTemplate>(() => {
    const savedId = localStorage.getItem('monaco_ide_template_id');
    const found = PROJECT_TEMPLATES.find(t => t.id === savedId);
    return found || PROJECT_TEMPLATES[0];
  });

  // Files virtual file tree
  const [files, setFiles] = useState<Record<string, FileNode>>(() => {
    try {
      const saved = localStorage.getItem('monaco_ide_files');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return buildFileTreeFromDict(PROJECT_TEMPLATES[0].files);
  });

  // Open tabs
  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => {
    const initialActive = PROJECT_TEMPLATES[0].activeFile;
    const initialId = `file:${initialActive}`;
    return [{ fileId: initialId }];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    return `file:${PROJECT_TEMPLATES[0].activeFile}`;
  });

  // Editor settings
  const [settings, setSettings] = useState<EditorSettings>(() => {
    try {
      const saved = localStorage.getItem('monaco_ide_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<ActiveSidebarTab>('explorer');
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<ActiveBottomTab>('console');
  const [isBottomMaximized, setIsBottomMaximized] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  // Splitter resizes
  const [editorWidthPercent, setEditorWidthPercent] = useState(50);
  const [bottomHeightPx, setBottomHeightPx] = useState(200);

  // Execution & Logs
  const [logs, setLogs] = useState<ConsoleMessage[]>([
    {
      id: 'init-1',
      level: 'system',
      message: 'Monaco Web IDE 초기화 완료. 코드 편집 후 [실행] 버튼 또는 Ctrl+S를 누르세요.',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [bundledHtml, setBundledHtml] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

  // Modals
  const [isQuickOpenOpen, setIsQuickOpenOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const editorInstanceRef = useRef<any>(null);
  const autoRunTimeoutRef = useRef<any>(null);

  // Persist files & settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('monaco_ide_files', JSON.stringify(files));
    } catch (e) {}
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem('monaco_ide_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Convert files tree to flat path dictionary
  const getFilesDict = useCallback((): Record<string, string> => {
    const dict: Record<string, string> = {};
    for (const node of Object.values(files)) {
      if (node.type === 'file' && node.content !== undefined) {
        dict[node.path] = node.content;
      }
    }
    return dict;
  }, [files]);

  // Trigger Code Execution / Web Preview Bundle
  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    const filesDict = getFilesDict();
    const activeFile = activeFileId ? files[activeFileId] : null;

    const timeStr = new Date().toLocaleTimeString();

    // Check language or runner type
    if (activeFile?.language === 'python' || currentTemplate.runnerType === 'python') {
      // Run Python
      const pythonCode = activeFile?.content || filesDict['/main.py'] || '';
      setLogs(prev => [
        ...prev,
        {
          id: String(Date.now()),
          level: 'system',
          message: `🐍 Python 실행 시작: ${activeFile?.name || 'main.py'}`,
          timestamp: timeStr,
        }
      ]);

      await runPythonCode(pythonCode, (text, level) => {
        setLogs(prev => [
          ...prev,
          {
            id: String(Date.now() + Math.random()),
            level: level === 'error' ? 'error' : 'log',
            message: text,
            timestamp: new Date().toLocaleTimeString(),
          }
        ]);
      });
      setIsRunning(false);
      return;
    }

    if (currentTemplate.runnerType === 'node' && activeFile?.language === 'javascript') {
      // Algorithm / Node JS run
      setLogs(prev => [
        ...prev,
        {
          id: String(Date.now()),
          level: 'system',
          message: `⚡ JavaScript 실행 시작: ${activeFile.name}`,
          timestamp: timeStr,
        }
      ]);

      runJavaScriptSandbox(activeFile.content || '', (text, level) => {
        setLogs(prev => [
          ...prev,
          {
            id: String(Date.now() + Math.random()),
            level,
            message: text,
            timestamp: new Date().toLocaleTimeString(),
          }
        ]);
      });
      setIsRunning(false);
      return;
    }

    // Default: Web Preview Bundle
    try {
      const html = generateWebBundle(filesDict);
      setBundledHtml(html);
      setLogs(prev => [
        ...prev,
        {
          id: String(Date.now()),
          level: 'system',
          message: `🚀 웹 미리보기 빌드 완료 (${Object.keys(filesDict).length}개 모듈 번들링됨)`,
          timestamp: timeStr,
        }
      ]);
    } catch (err: any) {
      setLogs(prev => [
        ...prev,
        {
          id: String(Date.now()),
          level: 'error',
          message: `빌드 에러: ${err.message}`,
          timestamp: timeStr,
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [files, activeFileId, currentTemplate, getFilesDict]);

  // Initial Run on load
  useEffect(() => {
    handleRunCode();
  }, []);

  // Listen to postMessage console events from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'IDE_CONSOLE') {
        const { level, message } = event.data;
        setLogs(prev => [
          ...prev,
          {
            id: String(Date.now() + Math.random()),
            level: level || 'log',
            message: String(message),
            timestamp: new Date().toLocaleTimeString(),
          }
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Global Keyboard Shortcuts (Ctrl+S, Ctrl+P, Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleRunCode();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsQuickOpenOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode]);

  // Format Document
  const handleFormatDocument = () => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // File Content Change handler
  const handleChangeContent = (fileId: string, newContent: string) => {
    setFiles(prev => {
      const node = prev[fileId];
      if (!node) return prev;
      return {
        ...prev,
        [fileId]: { ...node, content: newContent }
      };
    });

    // Mark tab as dirty
    setOpenTabs(prev =>
      prev.map(t => (t.fileId === fileId ? { ...t, isDirty: true } : t))
    );

    // Auto run debounce if enabled
    if (settings.autoRunOnChange) {
      if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
      autoRunTimeoutRef.current = setTimeout(() => {
        handleRunCode();
      }, 900);
    }
  };

  // Open/Select File
  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
    if (!openTabs.some(t => t.fileId === fileId)) {
      setOpenTabs(prev => [...prev, { fileId }]);
    }
  };

  // Close Tab
  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter(t => t.fileId !== fileId);
    setOpenTabs(remaining);
    if (activeFileId === fileId) {
      setActiveFileId(remaining.length > 0 ? remaining[remaining.length - 1].fileId : null);
    }
  };

  // Close All Tabs
  const handleCloseAllTabs = () => {
    setOpenTabs([]);
    setActiveFileId(null);
  };

  // Create new file
  const handleCreateFile = (parentId: string, name: string) => {
    const parent = files[parentId];
    const parentPath = parent && parent.id !== 'root' ? parent.path : '';
    const newPath = `${parentPath}/${name}`;
    const newId = `file:${newPath}`;

    const newNode: FileNode = {
      id: newId,
      name,
      path: newPath,
      type: 'file',
      content: '',
      language: getLanguageFromFilename(name),
      parentId: parentId === 'root' ? 'root' : parentId,
    };

    setFiles(prev => {
      const parentNode = prev[parentId];
      return {
        ...prev,
        [newId]: newNode,
        [parentId]: {
          ...parentNode,
          children: parentNode.children ? [...parentNode.children, newId] : [newId]
        }
      };
    });

    // Open newly created file
    handleSelectFile(newId);
  };

  // Create new folder
  const handleCreateFolder = (parentId: string, name: string) => {
    const parent = files[parentId];
    const parentPath = parent && parent.id !== 'root' ? parent.path : '';
    const newPath = `${parentPath}/${name}`;
    const newId = `folder:${newPath}`;

    const newNode: FileNode = {
      id: newId,
      name,
      path: newPath,
      type: 'folder',
      parentId: parentId === 'root' ? 'root' : parentId,
      children: [],
      isExpanded: true,
    };

    setFiles(prev => {
      const parentNode = prev[parentId];
      return {
        ...prev,
        [newId]: newNode,
        [parentId]: {
          ...parentNode,
          children: parentNode.children ? [...parentNode.children, newId] : [newId]
        }
      };
    });
  };

  // Rename node
  const handleRenameNode = (nodeId: string, newName: string) => {
    setFiles(prev => {
      const node = prev[nodeId];
      if (!node) return prev;
      return {
        ...prev,
        [nodeId]: {
          ...node,
          name: newName,
          language: node.type === 'file' ? getLanguageFromFilename(newName) : undefined
        }
      };
    });
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    setFiles(prev => {
      const target = prev[nodeId];
      if (!target) return prev;
      const next = { ...prev };
      delete next[nodeId];

      if (target.parentId && next[target.parentId]) {
        next[target.parentId] = {
          ...next[target.parentId],
          children: next[target.parentId].children?.filter(id => id !== nodeId)
        };
      }
      return next;
    });

    setOpenTabs(prev => prev.filter(t => t.fileId !== nodeId));
    if (activeFileId === nodeId) {
      setActiveFileId(null);
    }
  };

  // Download single file
  const handleDownloadFile = (nodeId: string) => {
    const file = files[nodeId];
    if (!file || file.content === undefined) return;
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset to default files of current template
  const handleResetProject = () => {
    if (confirm('현재 프로젝트를 초기 템플릿 상태로 복원하시겠습니까?')) {
      const freshTree = buildFileTreeFromDict(currentTemplate.files);
      setFiles(freshTree);
      const initialId = `file:${currentTemplate.activeFile}`;
      setOpenTabs([{ fileId: initialId }]);
      setActiveFileId(initialId);
      setTimeout(handleRunCode, 100);
    }
  };

  // Select new template
  const handleSelectTemplate = (template: ProjectTemplate) => {
    setCurrentTemplate(template);
    localStorage.setItem('monaco_ide_template_id', template.id);
    const freshTree = buildFileTreeFromDict(template.files);
    setFiles(freshTree);
    const initialId = `file:${template.activeFile}`;
    setOpenTabs([{ fileId: initialId }]);
    setActiveFileId(initialId);
    setTimeout(handleRunCode, 100);
  };

  // Export workspace to ZIP
  const handleExportZip = async () => {
    const dict = getFilesDict();
    await exportProjectToZip(dict, `monaco-${currentTemplate.id}`);
    setLogs(prev => [
      ...prev,
      {
        id: String(Date.now()),
        level: 'system',
        message: '📦 프로젝트 ZIP 압축 파일이 성공적으로 다운로드되었습니다.',
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };

  // Import workspace from ZIP
  const handleImportZip = async (file: File) => {
    try {
      const importedFiles = await importProjectFromZip(file);
      if (Object.keys(importedFiles).length === 0) {
        alert('ZIP 파일 내 유효한 소스 코드를 찾을 수 없습니다.');
        return;
      }
      const newTree = buildFileTreeFromDict(importedFiles);
      setFiles(newTree);
      const firstFile = Object.values(newTree).find(f => f.type === 'file');
      if (firstFile) {
        setOpenTabs([{ fileId: firstFile.id }]);
        setActiveFileId(firstFile.id);
      }
      setLogs(prev => [
        ...prev,
        {
          id: String(Date.now()),
          level: 'system',
          message: `📂 ZIP 파일에서 ${Object.keys(importedFiles).length}개 파일이 성공적으로 로드되었습니다.`,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setTimeout(handleRunCode, 100);
    } catch (err: any) {
      alert(`ZIP 불러오기 실패: ${err.message}`);
    }
  };

  // Handle dropping external files onto Explorer or Editor
  const handleImportExternalFiles = async (droppedFiles: FileList | File[], targetParentId: string = 'root') => {
    const fileArray = Array.from(droppedFiles);
    if (fileArray.length === 0) return;

    let lastOpenedFileId: string | null = null;

    for (const file of fileArray) {
      if (file.name.endsWith('.zip')) {
        await handleImportZip(file);
        return;
      }

      try {
        const text = await file.text();
        const parent = files[targetParentId] || files['root'];
        const parentPath = parent && parent.id !== 'root' ? parent.path : '';
        const newPath = `${parentPath}/${file.name}`;
        const newId = `file:${newPath}`;

        const newNode: FileNode = {
          id: newId,
          name: file.name,
          path: newPath,
          type: 'file',
          content: text,
          language: getLanguageFromFilename(file.name),
          parentId: parent ? parent.id : 'root',
        };

        setFiles(prev => {
          const pNode = prev[newNode.parentId || 'root'];
          return {
            ...prev,
            [newId]: newNode,
            [newNode.parentId || 'root']: {
              ...pNode,
              children: pNode && pNode.children && !pNode.children.includes(newId) 
                ? [...pNode.children, newId] 
                : (pNode?.children || [newId])
            }
          };
        });

        lastOpenedFileId = newId;
      } catch (err: any) {
        console.error('Error reading dropped file:', err);
      }
    }

    if (lastOpenedFileId) {
      handleSelectFile(lastOpenedFileId);
      setLogs(prev => [
        ...prev,
        {
          id: String(Date.now()),
          level: 'system',
          message: `📥 파일 ${fileArray.length}개가 워크스페이스에 추가되고 에디터에서 열렸습니다.`,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setTimeout(handleRunCode, 150);
    }
  };

  // Replace text in file
  const handleReplaceInFile = (fileId: string, search: string, replaceWith: string) => {
    setFiles(prev => {
      const file = prev[fileId];
      if (!file || file.content === undefined) return prev;
      const updated = file.content.split(search).join(replaceWith);
      return {
        ...prev,
        [fileId]: { ...file, content: updated }
      };
    });
  };

  // Active file node
  const activeFileNode = activeFileId ? files[activeFileId] || null : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none">
      {/* Top Bar */}
      <TopNav
        currentTemplate={currentTemplate}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        onOpenQuickOpen={() => setIsQuickOpenOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onExportZip={handleExportZip}
        onImportZip={handleImportZip}
        onOpenTemplates={() => {
          setIsSidebarOpen(true);
          setActiveSidebarTab('templates');
        }}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(v => !v)}
        isBottomPanelOpen={isBottomPanelOpen}
        onToggleBottomPanel={() => setIsBottomPanelOpen(v => !v)}
        isPreviewOpen={isPreviewOpen}
        onTogglePreview={() => setIsPreviewOpen(v => !v)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Activity Bar (Far Left Strip) */}
        <ActivityBar
          activeTab={activeSidebarTab}
          isSidebarOpen={isSidebarOpen}
          onSelectTab={(tab) => {
            if (isSidebarOpen && activeSidebarTab === tab) {
              setIsSidebarOpen(false);
            } else {
              setIsSidebarOpen(true);
              setActiveSidebarTab(tab);
            }
          }}
        />

        {/* Sidebar Panel */}
        {isSidebarOpen && (
          <aside className="w-64 shrink-0 h-full border-r border-[#333333] flex flex-col overflow-hidden bg-[#252526]">
            {activeSidebarTab === 'explorer' && (
              <FileExplorer
                files={files}
                activeFileId={activeFileId}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onRenameNode={handleRenameNode}
                onDeleteNode={handleDeleteNode}
                onDownloadFile={handleDownloadFile}
                onResetProject={handleResetProject}
                onDropExternalFiles={handleImportExternalFiles}
              />
            )}
            {activeSidebarTab === 'search' && (
              <SearchPanel
                files={files}
                onSelectFile={handleSelectFile}
                onReplaceInFile={handleReplaceInFile}
              />
            )}
            {activeSidebarTab === 'templates' && (
              <TemplatesPanel
                currentTemplateId={currentTemplate.id}
                onSelectTemplate={handleSelectTemplate}
              />
            )}
            {activeSidebarTab === 'settings' && (
              <SettingsPanel
                settings={settings}
                onUpdateSettings={(newOpts) => setSettings(prev => ({ ...prev, ...newOpts }))}
              />
            )}
          </aside>
        )}

        {/* Central Workspace: Editor + Terminal and Web Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Monaco Editor + Bottom Terminal */}
          <div
            style={{ width: isPreviewOpen ? `${editorWidthPercent}%` : '100%' }}
            className="h-full flex flex-col overflow-hidden border-r border-[#333333] relative"
          >
            {/* Editor Top Tabs */}
            <EditorTabs
              openTabs={openTabs}
              activeFileId={activeFileId}
              files={files}
              onSelectTab={handleSelectFile}
              onCloseTab={handleCloseTab}
              onCloseAllTabs={handleCloseAllTabs}
              onFormatDocument={handleFormatDocument}
              onRunCode={handleRunCode}
              onDropFileId={handleSelectFile}
              onDropExternalFiles={handleImportExternalFiles}
            />

            {/* Breadcrumbs */}
            <Breadcrumbs activeFile={activeFileNode} />

            {/* Monaco Editor Canvas */}
            <div className="flex-1 min-h-0 relative">
              <MonacoEditorWrapper
                activeFile={activeFileNode}
                settings={settings}
                onChangeContent={handleChangeContent}
                onSave={handleRunCode}
                onCursorChange={(line, col) => setCursorPosition({ line, col })}
                editorRef={editorInstanceRef}
                onDropFileId={handleSelectFile}
                onDropExternalFiles={handleImportExternalFiles}
              />
            </div>

            {/* Bottom Terminal Dock */}
            {isBottomPanelOpen && (
              <div
                style={{ height: isBottomMaximized ? '85%' : `${bottomHeightPx}px` }}
                className="shrink-0 transition-all duration-150 relative"
              >
                <TerminalPanel
                  logs={logs}
                  onClearLogs={() => setLogs([])}
                  onExecuteCommand={(cmd) => {
                    setLogs(prev => [
                      ...prev,
                      {
                        id: String(Date.now()),
                        level: 'log',
                        message: `> ${cmd}`,
                        timestamp: new Date().toLocaleTimeString(),
                      }
                    ]);
                    runJavaScriptSandbox(cmd, (text, level) => {
                      setLogs(prev => [
                        ...prev,
                        {
                          id: String(Date.now() + Math.random()),
                          level,
                          message: text,
                          timestamp: new Date().toLocaleTimeString(),
                        }
                      ]);
                    });
                  }}
                  activeBottomTab={activeBottomTab}
                  onChangeBottomTab={setActiveBottomTab}
                  onClose={() => setIsBottomPanelOpen(false)}
                  isMaximized={isBottomMaximized}
                  onToggleMaximize={() => setIsBottomMaximized(v => !v)}
                />
              </div>
            )}

            {/* Status Bar */}
            <StatusBar
              activeFile={activeFileNode}
              cursorPosition={cursorPosition}
              tabSize={settings.tabSize}
              onFormatDocument={handleFormatDocument}
              isRunning={isRunning}
            />
          </div>

          {/* Right Column: Web Preview (if open) */}
          {isPreviewOpen && (
            <div
              style={{ width: `${100 - editorWidthPercent}%` }}
              className="h-full flex flex-col overflow-hidden bg-[#181818]"
            >
              <WebPreview
                bundledHtml={bundledHtml}
                onRefresh={handleRunCode}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Open Modal (Cmd+P) */}
      <QuickOpenModal
        isOpen={isQuickOpenOpen}
        onClose={() => setIsQuickOpenOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
