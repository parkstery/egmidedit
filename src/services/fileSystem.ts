import JSZip from 'jszip';
import { FileNode } from '../types/ide';

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'sql':
      return 'sql';
    case 'xml':
    case 'svg':
      return 'xml';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'yaml':
    case 'yml':
      return 'yaml';
    default:
      return 'plaintext';
  }
}

export function buildFileTreeFromDict(files: Record<string, string>): Record<string, FileNode> {
  const nodes: Record<string, FileNode> = {};

  // Root folder
  nodes['root'] = {
    id: 'root',
    name: 'project',
    path: '/',
    type: 'folder',
    parentId: null,
    children: [],
    isExpanded: true,
  };

  for (const [fullPath, content] of Object.entries(files)) {
    const parts = fullPath.replace(/^\//, '').split('/');
    let currentParentId = 'root';
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
      const nodeId = isFile ? `file:${currentPath}` : `folder:${currentPath}`;

      if (!nodes[nodeId]) {
        if (isFile) {
          nodes[nodeId] = {
            id: nodeId,
            name: part,
            path: currentPath,
            type: 'file',
            content,
            language: getLanguageFromFilename(part),
            parentId: currentParentId,
          };
        } else {
          nodes[nodeId] = {
            id: nodeId,
            name: part,
            path: currentPath,
            type: 'folder',
            parentId: currentParentId,
            children: [],
            isExpanded: true,
          };
        }

        const parent = nodes[currentParentId];
        if (parent && parent.children && !parent.children.includes(nodeId)) {
          parent.children.push(nodeId);
        }
      }

      currentParentId = nodeId;
    }
  }

  return nodes;
}

export async function exportProjectToZip(files: Record<string, string>, projectName: string = 'monaco-project') {
  const zip = new JSZip();

  for (const [path, content] of Object.entries(files)) {
    const cleanPath = path.replace(/^\//, '');
    zip.file(cleanPath, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importProjectFromZip(file: File): Promise<Record<string, string>> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);
  const files: Record<string, string> = {};

  const entries = Object.keys(zipContent.files);
  for (const relativePath of entries) {
    const zipEntry = zipContent.files[relativePath];
    if (!zipEntry.dir && !relativePath.startsWith('__MACOSX') && !relativePath.endsWith('.DS_Store')) {
      const text = await zipEntry.async('string');
      files[`/${relativePath}`] = text;
    }
  }

  return files;
}
