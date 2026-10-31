import { ProjectTemplate } from '../types/ide';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'vanilla-web',
    title: 'Interactive Web App (HTML/CSS/JS)',
    description: '캔버스 파티클 효과와 반응형 UI 컨트롤이 포함된 모던 웹 애플리케이션',
    language: 'JavaScript',
    tag: 'Web',
    runnerType: 'web',
    activeFile: '/script.js',
    files: {
      '/index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Interactive Particle Studio</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="overlay">
    <header>
      <h1>✨ Particle Physics Playground</h1>
      <p>마우스를 움직이거나 클릭하여 중력파 파티클을 발생시켜보세요.</p>
    </header>

    <div class="stats-panel">
      <div class="stat-item">
        <span class="label">Particle Count</span>
        <span class="val" id="particle-count">0</span>
      </div>
      <div class="stat-item">
        <span class="label">FPS</span>
        <span class="val" id="fps-display">60</span>
      </div>
    </div>

    <div class="controls-panel">
      <button id="btn-burst" class="primary-btn">폭발 효과 (Burst)</button>
      <button id="btn-clear" class="secondary-btn">화면 비우기</button>
      <label class="toggle-label">
        <input type="checkbox" id="check-gravity" checked />
        중력장 활성화
      </label>
    </div>
  </div>

  <canvas id="canvas"></canvas>
  <script src="script.js"></script>
</body>
</html>`,
      '/styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #0d1117;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #f0f6fc;
}

#canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 420px;
  pointer-events: auto;
}

header h1 {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #58a6ff;
  margin-bottom: 4px;
}

header p {
  font-size: 0.85rem;
  color: #8b949e;
  line-height: 1.4;
}

.stats-panel {
  display: flex;
  gap: 12px;
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(48, 54, 61, 0.8);
  border-radius: 8px;
  padding: 10px 14px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item .label {
  font-size: 0.72rem;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-item .val {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: monospace;
  color: #3fb950;
}

.controls-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(48, 54, 61, 0.8);
  border-radius: 8px;
  padding: 12px 14px;
}

button {
  cursor: pointer;
  border: none;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.primary-btn {
  background: #238636;
  color: #ffffff;
}

.primary-btn:hover {
  background: #2ea043;
}

.secondary-btn {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.secondary-btn:hover {
  background: #30363d;
}

.toggle-label {
  font-size: 0.82rem;
  color: #c9d1d9;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin-left: 4px;
}`,
      '/script.js': `// Particle Physics Simulator
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countDisplay = document.getElementById('particle-count');
const fpsDisplay = document.getElementById('fps-display');
const gravityToggle = document.getElementById('check-gravity');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const particles = [];
const colors = ['#58a6ff', '#3fb950', '#d29922', '#f778ba', '#a371f7'];

class Particle {
  constructor(x, y, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.vx = vx || (Math.random() - 0.5) * 6;
    this.vy = vy || (Math.random() - 0.5) * 6;
    this.radius = Math.random() * 3 + 2;
    this.color = color || colors[Math.floor(Math.random() * colors.length)];
    this.life = 1;
    this.decay = Math.random() * 0.008 + 0.003;
  }

  update() {
    if (gravityToggle.checked) {
      this.vy += 0.06;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;

    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > width) {
      this.vx *= -0.7;
      this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    }
    if (this.y + this.radius > height) {
      this.vy *= -0.65;
      this.vx *= 0.95;
      this.y = height - this.radius;
    }
  }

  draw(context) {
    context.save();
    context.globalAlpha = Math.max(0, this.life);
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

function spawnParticles(x, y, count = 25) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 7 + 1;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    particles.push(new Particle(x, y, vx, vy));
  }
  console.log(\`생성됨: \${count}개 파티클 (총 \${particles.length}개)\`);
}

// User interactions
window.addEventListener('mousemove', (e) => {
  if (Math.random() < 0.4) {
    particles.push(new Particle(e.clientX, e.clientY));
  }
});

window.addEventListener('click', (e) => {
  spawnParticles(e.clientX, e.clientY, 40);
});

document.getElementById('btn-burst').addEventListener('click', () => {
  spawnParticles(width / 2, height / 2, 100);
});

document.getElementById('btn-clear').addEventListener('click', () => {
  particles.length = 0;
  console.info('캔버스 초기화 완료');
});

// FPS Counter
let lastTime = performance.now();
let frameCount = 0;

function animate(currentTime) {
  requestAnimationFrame(animate);

  frameCount++;
  if (currentTime - lastTime >= 500) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    fpsDisplay.textContent = fps;
    frameCount = 0;
    lastTime = currentTime;
  }

  ctx.fillStyle = 'rgba(13, 17, 23, 0.25)';
  ctx.fillRect(0, 0, width, height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw(ctx);
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  countDisplay.textContent = particles.length;
}

// Initial explosion
spawnParticles(width / 2, height / 2, 60);
animate(performance.now());
console.log('✨ Particle Playground가 성공적으로 로드되었습니다!');
`,
      '/README.md': `# Interactive Particle Physics Playground

Monaco Web IDE에서 바로 수정하고 실시간으로 실행할 수 있는 웹 캔버스 시뮬레이터입니다.

### 주요 기능
- **실시간 반응형 렌더링**: 코드 변경 시 즉시 우측 미리보기에 반영
- **입자 물리 시뮬레이션**: 중력, 반발력, 페이드아웃 라이프사이클 계산
- **개발자 콘솔 연동**: 브라우저 로그가 IDE 하단 콘솔 탭에 실시간 전달
`
    }
  },
  {
    id: 'react-todo',
    title: 'React & Tailwind App',
    description: 'React 컴포넌트 상태 관리와 애니메이션이 적용된 모던 생산성 대시보드',
    language: 'JavaScript',
    tag: 'React',
    runnerType: 'web',
    activeFile: '/App.jsx',
    files: {
      '/index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Workspace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="root"></div>
  <script type="text/babel" data-presets="react" src="App.jsx"></script>
</body>
</html>`,
      '/App.jsx': `function App() {
  const [tasks, setTasks] = React.useState([
    { id: 1, title: 'Monaco Editor 기능 탐색하기', completed: true, tag: 'Study' },
    { id: 2, title: '프로젝트 내보내기 (.ZIP) 테스트', completed: false, tag: 'Feature' },
    { id: 3, title: '다크 모드와 단축키(Ctrl+S) 활용해보기', completed: false, tag: 'Productivity' },
  ]);
  const [newTitle, setNewTitle] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('all');

  const addTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTitle.trim(),
      completed: false,
      tag: 'Task'
    };
    setTasks([newTask, ...tasks]);
    setNewTitle('');
    console.log('새 태스크 추가:', newTask.title);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'active') return !t.completed;
    if (activeFilter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>🚀 Project Kanban</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">React + Tailwind 실시간 인라인 렌더링</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {completedCount} / {tasks.length}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">진행률</div>
        </div>
      </div>

      {/* Task Input */}
      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="새로운 작업 항목을 입력하세요..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
        >
          추가
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-slate-900 rounded-lg w-fit border border-slate-800">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors \${
              activeFilter === f
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }\`}
          >
            {f === 'all' ? '전체' : f === 'active' ? '진행중' : '완료됨'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-500 bg-slate-900/40 rounded-lg border border-dashed border-slate-800">
            표시할 항목이 없습니다.
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTask(t.id)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span
                  className={\`text-sm font-medium transition-all \${
                    t.completed
                      ? 'line-through text-slate-500'
                      : 'text-slate-200'
                  }\`}
                >
                  {t.title}
                </span>
              </div>
              <button
                onClick={() => deleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 text-xs text-rose-400 hover:text-rose-300 transition-opacity p-1"
                title="삭제"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
console.log('React 18 Component가 성공적으로 렌더링되었습니다.');
`,
      '/README.md': `# React & Tailwind CSS Workspace

Babel Standalone과 CDN 환경을 통해 빌드 단계 없이 즉시 렌더링되는 React 샌드박스입니다.
`
    }
  },
  {
    id: 'python-sandbox',
    title: 'Python Runner (Pyodide)',
    description: '브라우저 내 WebAssembly 기반 Python 인터프리터로 즉시 실행되는 파이썬 환경',
    language: 'Python',
    tag: 'Python',
    runnerType: 'python',
    activeFile: '/main.py',
    files: {
      '/main.py': `# 브라우저 내 Python 3.11+ 인터프리터 (Pyodide WebAssembly)
import math
import time

def fibonacci_generator(n):
    """피보나치 수열 생성기"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

def prime_factors(n):
    """소인수분해 알고리즘"""
    factors = []
    d = 2
    while d * d <= n:
        while (n % d) == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors

def main():
    print("=" * 45)
    print("🐍 Python 3.11+ Browser Runtime Powered by Pyodide")
    print("=" * 45)

    # 1. 수열 계산
    fib_list = list(fibonacci_generator(15))
    print(f"📊 피보나치 수열 (15항): {fib_list}")

    # 2. 소인수분해
    test_number = 3600
    factors = prime_factors(test_number)
    print(f"🔍 {test_number}의 소인수분해 결과: {factors}")

    # 3. 삼각함수 및 수학 계산
    angles = [0, 30, 45, 60, 90]
    print("\n📐 삼각함수 테이블:")
    for deg in angles:
        rad = math.radians(deg)
        print(f"   sin({deg:2d}°) = {math.sin(rad):.4f} | cos({deg:2d}°) = {math.cos(rad):.4f}")

    print("\n✅ 모든 계산이 성공적으로 완료되었습니다!")

if __name__ == "__main__":
    main()
`,
      '/data_stats.py': `# 데이터 분석 및 통계 보조 모듈
import statistics

data = [42, 65, 78, 92, 45, 88, 73, 95, 61, 84, 90]

print("📈 샘플 데이터셋 통계:")
print(f"  - 평균 (Mean): {statistics.mean(data):.2f}")
print(f"  - 중앙값 (Median): {statistics.median(data)}")
print(f"  - 표준편차 (StDev): {statistics.stdev(data):.2f}")
print(f"  - 최대/최소: Max={max(data)}, Min={min(data)}")
`,
      '/README.md': `# Python Pyodide Sandbox

WebAssembly로 컴파일된 공식 Pyodide 런타임을 통해 브라우저에서 직접 순수 Python 코드를 실행합니다.
`
    }
  },
  {
    id: 'algo-benchmark',
    title: 'Algorithms & Data Structures',
    description: '알고리즘 벤치마크 및 정렬 알고리즘 속도 비교 시뮬레이션',
    language: 'JavaScript',
    tag: 'Algorithms',
    runnerType: 'node',
    activeFile: '/benchmark.js',
    files: {
      '/benchmark.js': `// 정렬 알고리즘 벤치마크 및 성능 비교
function generateRandomArray(size) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 10000));
  }
  return arr;
}

// 1. 퀵 소트 (Quick Sort)
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

// 2. 병합 정렬 (Merge Sort)
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  let result = [];
  let l = 0, r = 0;
  while (l < left.length && r < right.length) {
    if (left[l] < right[r]) result.push(left[l++]);
    else result.push(right[r++]);
  }
  return result.concat(left.slice(l)).concat(right.slice(r));
}

// 3. 자바스크립트 기본 Array.prototype.sort
function nativeSort(arr) {
  return [...arr].sort((a, b) => a - b);
}

function runBenchmark() {
  const SIZES = [1000, 5000, 20000];
  console.log("⚡ 알고리즘 벤치마크 실행 시작...");
  console.log("-------------------------------------------------");

  SIZES.forEach(size => {
    console.log(\`\\n📌 데이터 크기 N = \${size.toLocaleString()}개 원소\`);
    const data = generateRandomArray(size);

    // Quick Sort
    const t0 = performance.now();
    const sortedQuick = quickSort(data);
    const timeQuick = (performance.now() - t0).toFixed(2);
    console.log(\`  - Quick Sort:  \${timeQuick} ms\`);

    // Merge Sort
    const t1 = performance.now();
    const sortedMerge = mergeSort(data);
    const timeMerge = (performance.now() - t1).toFixed(2);
    console.log(\`  - Merge Sort:  \${timeMerge} ms\`);

    // Native V8 TimSort
    const t2 = performance.now();
    const sortedNative = nativeSort(data);
    const timeNative = (performance.now() - t2).toFixed(2);
    console.log(\`  - Native Sort: \${timeNative} ms\`);
  });

  console.log("\\n🎯 벤치마크 완료! 상단 '실행' 버튼을 눌러 다시 테스트할 수 있습니다.");
}

runBenchmark();
`,
      '/tree.js': `// 이진 탐색 트리 (Binary Search Tree)
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(val) {
    const newNode = new TreeNode(val);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    let curr = this.root;
    while (true) {
      if (val < curr.val) {
        if (!curr.left) {
          curr.left = newNode;
          break;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = newNode;
          break;
        }
        curr = curr.right;
      }
    }
  }

  inOrder(node = this.root, result = []) {
    if (!node) return result;
    this.inOrder(node.left, result);
    result.push(node.val);
    this.inOrder(node.right, result);
    return result;
  }
}

const bst = new BinarySearchTree();
[50, 30, 70, 20, 40, 60, 80].forEach(n => bst.insert(n));
console.log("BST 중위 순회 결과 (정렬된 순서):", bst.inOrder());
`
    }
  },
  {
    id: 'markdown-notes',
    title: 'Markdown Docs & Cheatsheet',
    description: '실시간 HTML 렌더링과 함께 제공되는 마크다운 기술 문서 작성 환경',
    language: 'Markdown',
    tag: 'Docs',
    runnerType: 'web',
    activeFile: '/notes.md',
    files: {
      '/index.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Markdown Viewer</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown-dark.css">
  <style>
    body {
      background-color: #0d1117;
      color: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 30px;
      margin: 0;
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 860px;
      margin: 0 auto;
      padding: 24px;
      background: transparent !important;
    }
  </style>
</head>
<body>
  <div id="content" class="markdown-body"></div>
  <script>
    fetch('notes.md')
      .then(res => res.text())
      .then(text => {
        document.getElementById('content').innerHTML = marked.parse(text);
      })
      .catch(() => {
        // Fallback if direct fetch is blocked in data uri
        const raw = \`# Monaco Web IDE 가이드\\n\\n우측 상단 파일 트리에서 \`notes.md\`를 확인하세요.\`;
        document.getElementById('content').innerHTML = marked.parse(raw);
      });
  </script>
</body>
</html>`,
      '/notes.md': `# 🚀 Monaco Web IDE 완벽 활용 가이드

Monaco Editor 기반의 최신 브라우저 IDE에 오신 것을 환영합니다!

## 핵심 기능 요약

### 1. Monaco Editor 강력한 코딩 기능
- **다양한 프로그래밍 언어 지원**: JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown 등
- **코드 자동완성 & 문법 강조 (IntelliSense)**
- **미니맵(Minimap), 줄 번호, 괄호 쌍 강조**

### 2. 단축키 안내
| 단축키 | 동작 |
| :--- | :--- |
| **Ctrl + S** (또는 Cmd + S) | 코드 저장 & 즉시 실행 |
| **Ctrl + P** (또는 Cmd + P) | 빠른 파일 검색 (Quick Open) |
| **Ctrl + B** (또는 Cmd + B) | 사이드바 토글 |
| **Shift + Alt + F** | 문서 서식 자동 정렬 (Format Document) |

### 3. 프로젝트 관리
- **ZIP 파일 내보내기**: 작업한 프로젝트 전체를 ZIP 압축 파일로 다운로드
- **템플릿 전환**: Vanilla Web, React, Python, Algorithm 등 다양한 프로젝트 템플릿 즉시 로드
- **로컬 스토리지 자동 저장**: 브라우저를 닫아도 작업 내역이 안전하게 보존됩니다.

---
*Happy Coding with Monaco Web IDE!*
`
    }
  }
];
