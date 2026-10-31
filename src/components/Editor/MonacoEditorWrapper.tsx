import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { EditorSettings, FileNode } from '../../types/ide';
import { FileText, UploadCloud } from 'lucide-react';

interface MonacoEditorWrapperProps {
  activeFile: FileNode | null;
  settings: EditorSettings;
  onChangeContent: (fileId: string, newContent: string) => void;
  onSave: () => void;
  onCursorChange: (line: number, col: number) => void;
  editorRef: React.MutableRefObject<any>;
  onDropFileId: (fileId: string) => void;
  onDropExternalFiles: (files: FileList | File[]) => void;
}

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  activeFile,
  settings,
  onChangeContent,
  onSave,
  onCursorChange,
  editorRef,
  onDropFileId,
  onDropExternalFiles
}) => {
  const monacoRef = useRef<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listen to cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });

    // Custom Keybinding: Ctrl/Cmd + S to trigger Save and Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    // Custom Keybinding: Shift + Alt + F to Format Document
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 1. Check if dropped from internal Explorer file drag
    const fileId = e.dataTransfer.getData('application/x-monaco-file-id') || e.dataTransfer.getData('text/plain');
    if (fileId && (fileId.startsWith('file:') || fileId.startsWith('folder:'))) {
      if (fileId.startsWith('file:')) {
        onDropFileId(fileId);
      }
      return;
    }

    // 2. Check if external files dropped from desktop/OS
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropExternalFiles(e.dataTransfer.files);
    }
  };

  if (!activeFile) {
    return (
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-[#858585] select-none p-6 text-center relative"
      >
        <div className="w-16 h-16 rounded-full bg-[#252526] flex items-center justify-center mb-4 text-[#58a6ff]">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-base font-medium text-white mb-1">열려 있는 파일이 없습니다</h3>
        <p className="text-xs text-[#858585] max-w-sm">
          좌측 탐색기에서 파일을 드래그하여 에디터에 놓거나, 단축키 <kbd className="px-1.5 py-0.5 bg-[#2d2d2d] rounded text-white font-mono text-[10px]">Ctrl+P</kbd>로 빠른 파일 열기를 사용하세요.
        </p>

        {isDragOver && (
          <div className="absolute inset-0 bg-[#094771]/80 backdrop-blur-xs border-2 border-dashed border-[#58a6ff] flex flex-col items-center justify-center p-4 z-30 pointer-events-none">
            <UploadCloud className="w-10 h-10 text-[#58a6ff] mb-2 animate-bounce" />
            <span className="text-sm font-bold text-white">에디터에서 열기</span>
            <span className="text-xs text-white/80 mt-1">파일을 여기에 놓으면 즉시 열립니다.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 w-full h-full relative overflow-hidden bg-[#1e1e1e]"
    >
      <Editor
        height="100%"
        width="100%"
        path={activeFile.path}
        language={activeFile.language || 'plaintext'}
        value={activeFile.content || ''}
        theme={settings.theme}
        onChange={(value) => {
          onChangeContent(activeFile.id, value || '');
        }}
        onMount={handleEditorDidMount}
        options={{
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers,
          bracketPairColorization: { enabled: settings.bracketPairColorization },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: "'JetBrains Mono', monospace",
          fontLigatures: true,
          renderWhitespace: 'selection',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          padding: { top: 12, bottom: 12 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
        loading={
          <div className="flex items-center justify-center h-full text-xs text-[#858585] bg-[#1e1e1e]">
            Monaco Editor 초기화 중...
          </div>
        }
      />

      {/* Drag Over Overlay for Editor */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 bg-[#094771]/70 backdrop-blur-xs border-2 border-dashed border-[#58a6ff] flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <UploadCloud className="w-12 h-12 text-[#58a6ff] mb-3 animate-bounce" />
          <span className="text-base font-bold text-white">에디터 창에서 열기</span>
          <span className="text-xs text-white/80 mt-1">
            탐색기 파일 또는 외부 파일을 여기에 놓으면 즉시 에디터에 열립니다.
          </span>
        </div>
      )}
    </div>
  );
};
