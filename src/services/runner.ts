// Runner for web preview, JS sandbox, and Python Pyodide execution

declare global {
  interface Window {
    loadPyodide?: any;
    pyodideInstance?: any;
  }
}

export function generateWebBundle(files: Record<string, string>): string {
  // Find main index.html or fallback
  let html = files['/index.html'] || files['index.html'];

  if (!html) {
    // If no index.html, check if there's markdown or just JS/CSS
    const jsFiles = Object.keys(files).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
    const cssFiles = Object.keys(files).filter(f => f.endsWith('.css'));

    html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  ${cssFiles.map(c => `<style>${files[c]}</style>`).join('\n')}
</head>
<body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;padding:20px;">
  <div id="root"></div>
  ${jsFiles.map(j => `<script>${files[j]}</script>`).join('\n')}
</body>
</html>`;
  }

  // Console capture interceptor script to inject into iframe
  const consoleScript = `
<script>
(function() {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;

  function safeFormat(arg) {
    try {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    } catch (e) {
      return String(arg);
    }
  }

  function sendToParent(level, args) {
    try {
      const msg = Array.from(args).map(safeFormat).join(' ');
      window.parent.postMessage({ type: 'IDE_CONSOLE', level, message: msg }, '*');
    } catch (e) {}
  }

  console.log = function(...args) {
    originalLog.apply(console, args);
    sendToParent('log', args);
  };
  console.info = function(...args) {
    originalInfo.apply(console, args);
    sendToParent('info', args);
  };
  console.warn = function(...args) {
    originalWarn.apply(console, args);
    sendToParent('warn', args);
  };
  console.error = function(...args) {
    originalError.apply(console, args);
    sendToParent('error', args);
  };

  window.addEventListener('error', function(event) {
    sendToParent('error', [event.message + ' at ' + (event.filename || '') + ':' + (event.lineno || '')]);
  });
})();
</script>
`;

  // Inline linked CSS and JS scripts
  let bundled = html;

  // Replace <link rel="stylesheet" href="...">
  bundled = bundled.replace(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    const cleanHref = href.startsWith('/') ? href : `/${href}`;
    if (files[cleanHref]) {
      return `<style>/* ${cleanHref} */\n${files[cleanHref]}\n</style>`;
    }
    return match;
  });

  // Replace <script ... src="..."> with inline script if in files
  bundled = bundled.replace(/<script([^>]+)src=["']([^"']+)["']([^>]*)><\/script>/gi, (match, before, src, after) => {
    const cleanSrc = src.startsWith('/') ? src : `/${src}`;
    if (files[cleanSrc]) {
      return `<script${before}${after}>/* ${cleanSrc} */\n${files[cleanSrc]}\n</script>`;
    }
    return match;
  });

  // Inject console interceptor at start of <head> or <body>
  if (bundled.includes('<head>')) {
    bundled = bundled.replace('<head>', `<head>${consoleScript}`);
  } else if (bundled.includes('<body>')) {
    bundled = bundled.replace('<body>', `<body>${consoleScript}`);
  } else {
    bundled = consoleScript + bundled;
  }

  return bundled;
}

let pyodideLoadingPromise: Promise<any> | null = null;

export async function loadPyodideRuntime(onProgress?: (msg: string) => void): Promise<any> {
  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = new Promise((resolve, reject) => {
    onProgress?.('Pyodide WebAssembly 엔진 로딩 중...');

    if (window.loadPyodide) {
      window.loadPyodide()
        .then((pyodide: any) => {
          window.pyodideInstance = pyodide;
          resolve(pyodide);
        })
        .catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
    script.async = true;
    script.onload = async () => {
      try {
        onProgress?.('Python 3.11 환경 초기화 중...');
        const pyodide = await window.loadPyodide();
        window.pyodideInstance = pyodide;
        resolve(pyodide);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => {
      reject(new Error('Pyodide CDN 스크립트 로드에 실패했습니다. 네트워크 연결을 확인해주세요.'));
    };
    document.head.appendChild(script);
  });

  return pyodideLoadingPromise;
}

export async function runPythonCode(
  code: string,
  onOutput: (text: string, level: 'log' | 'error') => void
): Promise<void> {
  try {
    const pyodide = await loadPyodideRuntime((status) => {
      onOutput(`[System] ${status}`, 'log');
    });

    // Capture standard output
    pyodide.setStdout({
      batched: (text: string) => onOutput(text, 'log')
    });
    pyodide.setStderr({
      batched: (text: string) => onOutput(text, 'error')
    });

    await pyodide.runPythonAsync(code);
  } catch (err: any) {
    onOutput(err.message || String(err), 'error');
  }
}

export function runJavaScriptSandbox(
  code: string,
  onOutput: (text: string, level: 'log' | 'info' | 'warn' | 'error') => void
): void {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;

  const logs: Array<{ text: string; level: 'log' | 'info' | 'warn' | 'error' }> = [];

  const safeLog = (...args: any[]) => {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
    logs.push({ text: msg, level: 'log' });
  };
  const safeInfo = (...args: any[]) => {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
    logs.push({ text: msg, level: 'info' });
  };
  const safeWarn = (...args: any[]) => {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
    logs.push({ text: msg, level: 'warn' });
  };
  const safeError = (...args: any[]) => {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
    logs.push({ text: msg, level: 'error' });
  };

  try {
    // Isolated evaluation
    const fn = new Function('console', code);
    fn({ log: safeLog, info: safeInfo, warn: safeWarn, error: safeError });
    logs.forEach(l => onOutput(l.text, l.level));
  } catch (err: any) {
    onOutput(err.stack || err.message || String(err), 'error');
  }
}
