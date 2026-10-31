import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { EditorSettings, FileNode } from '../../types/ide';

interface MonacoEditorWrapperProps {
  activeFile: FileNode | null;
  settings: EditorSettings;
  onChangeContent: (fileId: string, newContent: string) => void;
  onSave: () => void;
  onCursorChange: (line: number, col: number) => void;
  editorRef: React.MutableRefObject<any>;
}

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  activeFile,
  settings,
  onChangeContent,
  onSave,
  onCursorChange,
  editorRef
}) => {
  const monacoRef = useRef<any>(null);

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

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] text-[#858585] select-none p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#252526] flex items-center justify-center mb-4 text-[#58a6ff]">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-white mb-1">열려 있는 파일이 없습니다</h3>
        <p className="text-xs text-[#858585] max-w-sm">
          좌측 탐색기에서 파일을 클릭하거나, 단축키 <kbd className="px-1.5 py-0.5 bg-[#2d2d2d] rounded text-white font-mono text-[10px]">Ctrl+P</kbd>로 빠른 파일 열기를 사용하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-[#1e1e1e]">
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
    </div>
  );
};
