import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCheck,
  ChevronDown, Circle, Code2, ExternalLink, Filter, Flame,
  ListChecks, Menu, Moon, NotebookPen, Search, Sun, X,
} from 'lucide-react';

type Status = 'not-started' | 'in-progress' | 'solved' | 'review';
type Problem = { id: number; name: string; };
type Topic = { id: number; name: string; short: string; symbol: string; focus: string; patterns: string[]; problems: string[]; };
type Note = { learned: string; revisit: string; };

const topics: Topic[] = [
  { id: 1, name: 'Arrays', short: 'Arrays', symbol: '01', focus: 'Array traversal, frequency counting, prefix sums, in-place manipulation, subarrays.', patterns: ['Hash Map', 'Prefix Sum', "Kadane's Algorithm", 'In-place Array', 'Frequency'], problems: ['Two Sum', 'Contains Duplicate', 'Best Time to Buy and Sell Stock', 'Best Time to Buy and Sell Stock II', 'Maximum Subarray', 'Product of Array Except Self', 'Move Zeroes', 'Majority Element', 'Missing Number', 'Single Number', 'Plus One', 'Merge Sorted Array', 'Rotate Array', 'Sort Colors', 'Squares of a Sorted Array', 'Subarray Sum Equals K'] },
  { id: 2, name: 'Strings & Hashing', short: 'Strings', symbol: '02', focus: 'Character frequency, hash maps, string manipulation, palindromes.', patterns: ['Hash Map', 'Frequency Map', 'Sliding Window', 'Palindrome', 'Set'], problems: ['Valid Anagram', 'Group Anagrams', 'Valid Palindrome', 'Longest Common Prefix', 'Ransom Note', 'First Unique Character in a String', 'Isomorphic Strings', 'Roman to Integer', 'Reverse Words in a String', 'Find All Anagrams in a String', 'Longest Palindromic Substring', 'Valid Sudoku', 'Longest Consecutive Sequence'] },
  { id: 3, name: 'Two Pointers & Sliding Window', short: 'Two pointers', symbol: '03', focus: 'Reduce nested loops using two moving pointers or a dynamic window.', patterns: ['Two Pointers', 'Sliding Window', 'Left/Right Pointer', 'Frequency'], problems: ['Two Sum II – Input Array Is Sorted', 'Remove Duplicates from Sorted Array', 'Container With Most Water', '3Sum', 'Longest Substring Without Repeating Characters', 'Longest Repeating Character Replacement', 'Minimum Size Subarray Sum'] },
  { id: 4, name: 'Binary Search', short: 'Binary search', symbol: '04', focus: 'Search efficiently in sorted or partially sorted data.', patterns: ['Binary Search', 'Search Space', 'Sorted Array', 'Rotated Array'], problems: ['Binary Search', 'Search Insert Position', 'First Bad Version', 'Sqrt(x)', 'Search a 2D Matrix', 'Search in Rotated Sorted Array', 'Find Minimum in Rotated Sorted Array', 'Find First and Last Position of Element in Sorted Array'] },
  { id: 5, name: 'Linked List', short: 'Linked list', symbol: '05', focus: 'Pointer manipulation, fast/slow pointers, reversing and merging.', patterns: ['Fast & Slow', 'Reverse', 'Dummy Node', 'Two Pointers'], problems: ['Reverse Linked List', 'Merge Two Sorted Lists', 'Linked List Cycle', 'Middle of the Linked List', 'Remove Linked List Elements', 'Remove Nth Node From End of List', 'Palindrome Linked List', 'Intersection of Two Linked Lists', 'Add Two Numbers', 'Reorder List'] },
  { id: 6, name: 'Stack & Queue', short: 'Stack & queue', symbol: '06', focus: 'LIFO/FIFO thinking, monotonic stacks and expression evaluation.', patterns: ['Stack', 'Queue', 'Monotonic Stack', 'LIFO/FIFO'], problems: ['Valid Parentheses', 'Min Stack', 'Implement Queue using Stacks', 'Implement Stack using Queues', 'Backspace String Compare', 'Evaluate Reverse Polish Notation', 'Daily Temperatures', 'Decode String'] },
  { id: 7, name: 'Trees', short: 'Trees', symbol: '07', focus: 'Recursion, DFS, BFS, BST properties and tree traversal.', patterns: ['DFS', 'BFS', 'Recursion', 'BST', 'Tree Traversal'], problems: ['Maximum Depth of Binary Tree', 'Invert Binary Tree', 'Same Tree', 'Symmetric Tree', 'Subtree of Another Tree', 'Binary Tree Inorder Traversal', 'Binary Tree Level Order Traversal', 'Binary Tree Right Side View', 'Path Sum', 'Diameter of Binary Tree', 'Balanced Binary Tree', 'Convert Sorted Array to Binary Search Tree', 'Validate Binary Search Tree', 'Kth Smallest Element in a BST', 'Lowest Common Ancestor of a BST', 'Lowest Common Ancestor of a Binary Tree'] },
  { id: 8, name: 'Heap / Priority Queue', short: 'Heap', symbol: '08', focus: 'Order data by priority to solve top-k and dynamic ranking problems.', patterns: ['Min Heap', 'Max Heap', 'Top K', 'Priority Queue'], problems: ['Last Stone Weight', 'Kth Largest Element in a Stream', 'Kth Largest Element in an Array', 'Top K Frequent Elements', 'K Closest Points to Origin'] },
  { id: 9, name: 'Matrix', short: 'Matrix', symbol: '09', focus: 'Navigate two-dimensional arrays with deliberate traversal and in-place changes.', patterns: ['2D Array', 'Traversal', 'In-place Manipulation'], problems: ['Set Matrix Zeroes', 'Spiral Matrix', 'Rotate Image'] },
  { id: 10, name: 'Graphs — BFS/DFS', short: 'Graphs', symbol: '10', focus: 'Graph traversal, connected components, grids and shortest-path basics.', patterns: ['BFS', 'DFS', 'Visited Set', 'Grid Traversal', 'Connected Components'], problems: ['Flood Fill', 'Number of Islands', 'Max Area of Island', 'Number of Provinces', 'Rotting Oranges', 'Clone Graph'] },
  { id: 11, name: 'Recursion & Backtracking', short: 'Backtracking', symbol: '11', focus: 'Explore all possible combinations, choices and paths.', patterns: ['Recursion', 'Backtracking', 'Decision Tree', 'DFS'], problems: ['Subsets', 'Permutations', 'Combination Sum', 'Generate Parentheses', 'Letter Combinations of a Phone Number', 'Word Search'] },
  { id: 12, name: 'Intervals', short: 'Intervals', symbol: '12', focus: 'Order intervals and recognize when to merge, insert or greedily remove overlap.', patterns: ['Sorting', 'Interval Merging', 'Greedy'], problems: ['Merge Intervals', 'Insert Interval', 'Non-overlapping Intervals'] },
];

const phases = [
  { title: 'Core Patterns', range: '01—03', topics: ['Arrays', 'Strings & Hashing', 'Two Pointers & Sliding Window'], color: 'mint' },
  { title: 'Search & Pointers', range: '04—06', topics: ['Binary Search', 'Linked List', 'Stack & Queue'], color: 'orange' },
  { title: 'Advanced Data Structures', range: '07—09', topics: ['Trees', 'Heap / Priority Queue', 'Matrix'], color: 'blue' },
  { title: 'Problem Solving', range: '10—12', topics: ['Graphs — BFS/DFS', 'Recursion & Backtracking', 'Intervals'], color: 'plum' },
];
const milestones = [
  { name: 'Beginner', range: '1–30', color: 'mint' },
  { name: 'Building Patterns', range: '31–60', color: 'yellow' },
  { name: 'Interview Practice', range: '61–85', color: 'orange' },
  { name: '101 Complete', range: '86–101', color: 'red' },
];
const solvingSteps = [
  ['Understand', 'What exactly is being asked?'],
  ['Pattern', 'Which DSA pattern does this use?'],
  ['Approach', 'Can I explain the solution before coding?'],
  ['Code', 'Implement without copying'],
  ['Review', 'What did I learn / forget?'],
];
const allProblems: Problem[] = topics.flatMap((topic) => topic.problems.map((name) => ({ id: 0, name }))).map((p, index) => ({ ...p, id: index + 1 }));
const slugOverrides: Record<string, string> = {
  'Two Sum II – Input Array Is Sorted': 'two-sum-ii-input-array-is-sorted',
  'Sqrt(x)': 'sqrtx',
  '3Sum': '3sum',
  'Lowest Common Ancestor of a BST': 'lowest-common-ancestor-of-a-binary-search-tree',
};
const slugFor = (name: string) => slugOverrides[name] ?? name.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const STATUS_ORDER: Status[] = ['not-started', 'in-progress', 'solved', 'review'];
const STATUS_LABEL: Record<Status, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', solved: 'Solved', review: 'Review' };
const STORE_KEY = 'studyloom-dsa-v1';
const THEME_KEY = 'studyloom-theme';
const readStore = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return { statuses: (parsed.statuses || {}) as Record<number, Status>, notes: (parsed.notes || {}) as Record<number, Note> };
  } catch { return { statuses: {} as Record<number, Status>, notes: {} as Record<number, Note> }; }
};

const queryClient = new QueryClient();

function Home() {
  const [stored] = useState(readStore);
  const [statuses, setStatuses] = useState<Record<number, Status>>(stored.statuses);
  const [notes, setNotes] = useState<Record<number, Note>>(stored.notes);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light');
  const [activeTopic, setActiveTopic] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [notesOpen, setNotesOpen] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const resourcesRef = useRef<HTMLElement | null>(null);
  const [mobileTopics, setMobileTopics] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ statuses, notes }));
  }, [statuses, notes]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  useEffect(() => {
    if (!showResources) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => resourcesRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    }));
  }, [showResources]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setNotesOpen(null); setMobileTopics(false); setShowResources(false); setShowGuide(false); }
      if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault(); document.getElementById('problem-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const getStatus = (id: number): Status => statuses[id] || 'not-started';
  const solvedCount = allProblems.reduce((count, p) => count + (getStatus(p.id) === 'solved' ? 1 : 0), 0);
  const inProgressCount = allProblems.filter((p) => getStatus(p.id) === 'in-progress').length;
  const reviewCount = allProblems.filter((p) => getStatus(p.id) === 'review').length;
  const percent = Math.round(solvedCount / 101 * 100);
  const currentMilestone = solvedCount === 0 ? milestones[0] : milestones.find((m) => {
    const [lo, hi] = m.range.split('–').map(Number);
    return solvedCount >= lo && solvedCount <= hi;
  }) ?? milestones[milestones.length - 1];
  const nextMilestone = milestones.find((m) => solvedCount < Number(m.range.split('–')[0]));
  const topicProgress = (topic: Topic) => {
    const ids = allProblems.filter((p) => topic.problems.includes(p.name));
    return { solved: ids.filter((p) => getStatus(p.id) === 'solved').length, total: ids.length, active: ids.filter((p) => getStatus(p.id) !== 'not-started').length };
  };
  const displayedTopics = useMemo(() => activeTopic ? topics.filter((t) => t.id === activeTopic) : topics, [activeTopic]);
  const visibleByTopic = useMemo(() => {
    const search = query.trim().toLowerCase();
    return displayedTopics.map((topic) => ({
      topic,
      problems: allProblems.filter((problem) =>
        topic.problems.includes(problem.name) &&
        (!search || problem.name.toLowerCase().includes(search) || topic.name.toLowerCase().includes(search) || topic.patterns.some((pattern) => pattern.toLowerCase().includes(search))) &&
        (statusFilter === 'all' || getStatus(problem.id) === statusFilter)
      ),
    })).filter((group) => group.problems.length > 0 || (!search && statusFilter === 'all'));
  }, [displayedTopics, query, statusFilter, statuses]);
  const visibleCount = visibleByTopic.reduce((sum, group) => sum + group.problems.length, 0);

  const changeStatus = (id: number, status: Status) => setStatuses((current) => ({ ...current, [id]: status }));
  const cycleStatus = (id: number) => {
    const current = getStatus(id);
    const next = current === 'not-started' ? 'in-progress' : current === 'in-progress' ? 'solved' : current === 'solved' ? 'review' : 'solved';
    changeStatus(id, next);
  };
  const updateNote = (id: number, field: keyof Note, value: string) =>
    setNotes((current) => ({ ...current, [id]: { ...(current[id] ?? { learned: '', revisit: '' }), [field]: value } }));
  const clearFilters = () => { setQuery(''); setStatusFilter('all'); setActiveTopic(null); };

  return (
    <div className="app-shell grain">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1480px] items-center justify-between px-4 sm:px-7">
          <a href="#" className="flex items-center gap-3 text-foreground no-underline" aria-label="Studyloom home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background"><Code2 size={19} strokeWidth={2.6} /></span>
            <span className="font-handwriting text-[27px] font-semibold leading-none tracking-[-.02em]">studyloom<span className="text-primary">.</span></span>
            <span className="hidden border-l border-border pl-3 text-[11px] font-semibold tracking-wide text-muted-foreground sm:block">101 DSA ROADMAP</span>
          </a>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowResources((open) => !open)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${showResources ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} aria-label="Toggle DSA resources" aria-expanded={showResources} data-testid="button-resources">
              <ExternalLink size={16} /><span className="hidden sm:inline">Resources</span>
            </button>
            <button onClick={() => setShowGuide((open) => !open)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${showGuide ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} aria-label="Toggle solve guide" aria-expanded={showGuide} data-testid="button-study-guide">
              <BookOpen size={16} /><span className="hidden sm:inline">Solve guide</span>
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} data-testid="button-theme">
              {theme === 'light' ? <Moon className="theme-switch-icon" size={17} /> : <Sun className="theme-switch-icon" size={17} />}
            </button>
            <button onClick={() => setMobileTopics((open) => !open)} className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card md:hidden" aria-label="Toggle topics" aria-expanded={mobileTopics} data-testid="button-mobile-topics">
              {mobileTopics ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-6 px-4 pb-16 pt-5 sm:px-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:pt-8">
        <aside className={`${mobileTopics ? 'block mobile-topics-enter' : 'hidden'} md:block lg:sticky lg:top-[92px] lg:max-h-[calc(100dvh-112px)] lg:self-start`}>
          <div className="rounded-[22px] border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-muted-foreground">Your roadmap</p>
              <span className="font-mono text-[10px] text-muted-foreground">12 TOPICS</span>
            </div>
            <nav aria-label="Roadmap topics" className="scrollbar-thin max-h-[min(58vh,610px)] space-y-1 overflow-y-auto">
              <button onClick={() => { setActiveTopic(null); setMobileTopics(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${activeTopic === null ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} aria-current={activeTopic === null ? 'page' : undefined} data-testid="nav-topic-all">
                <ListChecks size={16} /><span className="flex-1 text-[13px] font-extrabold">All problems</span><span className="font-mono text-[10px]">{solvedCount}/101</span>
              </button>
              {topics.map((topic) => {
                const progress = topicProgress(topic);
                return <button key={topic.id} onClick={() => { setActiveTopic(topic.id); setMobileTopics(false); }} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-[9px] text-left transition ${activeTopic === topic.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} aria-current={activeTopic === topic.id ? 'page' : undefined} data-testid={`nav-topic-${topic.id}`}>
                  <span className="font-mono text-[10px] opacity-65">{topic.symbol}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-bold">{topic.short}</span>
                  <span className={`font-mono text-[10px] ${progress.solved === progress.total ? 'text-primary' : 'opacity-65'}`}>{progress.solved}/{progress.total}</span>
                </button>;
              })}
            </nav>
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground">Roadmap completion</span><span className="font-mono text-primary">{percent}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">{solvedCount} of 101 solved</p>
            </div>
          </div>
          <div className="mt-4 hidden rounded-[22px] bg-[#22332e] p-5 text-[#f1f3e9] lg:block">
            <div className="mb-4 flex items-center justify-between"><Flame size={18} className="text-[#facb82]" /><span className="font-mono text-[10px] tracking-widest text-white/50">THE PRACTICE LOOP</span></div>
            <p className="font-display text-lg font-bold leading-tight">Learn the pattern.<br />Then make it yours.</p>
            <p className="mt-3 text-[11px] leading-relaxed text-white/65">Learn pattern <ArrowRight className="mx-1 inline" size={12} /> solve easy <ArrowRight className="mx-1 inline" size={12} /> solve medium <ArrowRight className="mx-1 inline" size={12} /> review <ArrowRight className="mx-1 inline" size={12} /> repeat</p>
          </div>
        </aside>

        <main className="min-w-0">
          <section className="page-enter relative overflow-hidden rounded-[28px] bg-[#d9eee1] px-5 py-7 text-[#203b33] sm:px-8 sm:py-9 dark:bg-[#243d35] dark:text-[#eaf4ec]">
            <div className="hero-orbit hero-orbit-primary pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border-[32px] border-[#b7dfca]/65 dark:border-[#315347]/70" />
            <div className="hero-orbit hero-orbit-secondary pointer-events-none absolute -bottom-24 right-[20%] h-36 w-36 rounded-full border-[20px] border-[#f1b994]/50 dark:border-[#8d593f]/40" />
            <div className="relative z-[1] grid gap-8 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
              <div>
                <div className="mb-4 flex items-center gap-2"><span className="rounded-full bg-white/65 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-[#397662] dark:bg-white/10 dark:text-[#a5ddbf]">YOUR INTERVIEW PRACTICE, IN ORDER</span><span className="h-px w-8 bg-[#82bba2]" /></div>
                <h1 className="font-handwriting max-w-[650px] text-[42px] font-semibold leading-[.98] tracking-[-.025em] sm:text-[58px]">One problem at a time.<br /><span className="text-[#3d8a6d] dark:text-[#8ad4ae]">A hundred closer.</span></h1>
                <p className="mt-4 max-w-[510px] text-sm leading-6 text-[#4d6a60] dark:text-[#c1d6c9]">A structured path through 101 essential problems. Build pattern recognition, keep your notes, and let the progress add up.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-xs font-extrabold dark:bg-white/10"><span className="h-2 w-2 rounded-full bg-[#39966d]" />{solvedCount} solved</span>
                  <span className="flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-xs font-extrabold dark:bg-white/10"><span className="h-2 w-2 rounded-full bg-[#e6a54c]" />{inProgressCount} in progress</span>
                  <span className="flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-xs font-extrabold dark:bg-white/10"><span className="h-2 w-2 rounded-full bg-[#df815f]" />{reviewCount} to review</span>
                </div>
              </div>
              <div className="relative mx-auto grid h-[178px] w-[178px] place-items-center rounded-full border border-[#8cbaa5]/60 bg-[#eff8ef]/50 dark:border-[#608a76]/70 dark:bg-[#1d342c]/60">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 178 178" aria-label={`${percent}% complete`}>
                  <circle cx="89" cy="89" r="77" fill="none" stroke="currentColor" strokeOpacity=".1" strokeWidth="8" />
                  <circle cx="89" cy="89" r="77" fill="none" stroke="#4a9b77" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${percent / 100 * 484} 484`} className="transition-all duration-700" />
                </svg>
                <div className="text-center"><div className="font-display text-[42px] font-bold leading-none tracking-[-.06em]">{percent}<span className="text-[20px]">%</span></div><div className="mt-2 font-mono text-[9px] font-bold tracking-[.15em] opacity-65">OF THE WAY</div></div>
                <span className="absolute -right-1 top-7 grid h-9 w-9 place-items-center rounded-xl bg-[#f3b27f] text-[#653e28] shadow-sm"><ArrowUpRight size={17} /></span>
              </div>
            </div>
          </section>

          {showResources && <section ref={resourcesRef} className="page-enter resource-panel mt-5 rounded-[22px] border border-primary/20 bg-primary/5 p-5 sm:p-6" aria-label="Additional DSA resources">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-primary">KEEP LEARNING</p><h2 className="mt-1 font-display text-xl font-bold tracking-tight">Your DSA resources</h2></div>
              <button onClick={() => setShowResources(false)} aria-label="Close DSA resources" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X size={17} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="https://tinyurl.com/4hkd75jd" target="_blank" rel="noreferrer" className="resource-card group flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5" data-testid="link-guided-learning">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e4f2e8] text-[#397662] dark:bg-[#294439] dark:text-[#a5ddbf]"><BookOpen size={17} /></span>
                <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-extrabold text-foreground">Guided learning mode <ExternalLink size={13} className="shrink-0 text-muted-foreground transition group-hover:text-primary" /></span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Open the guided DSA learning space and choose a problem to begin.</span></span>
              </a>
              <a href="https://dsa-tracker-visualizer--SahilSawal.replit.app" target="_blank" rel="noreferrer" className="resource-card group flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5" data-testid="link-replit-roadmap">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff0d8] text-[#a66509] dark:bg-[#49351c] dark:text-[#f2bf7b]"><Code2 size={17} /></span>
                <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-extrabold text-foreground">DSA Roadmap Tracker on Replit <ExternalLink size={13} className="shrink-0 text-muted-foreground transition group-hover:text-primary" /></span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Open the linked roadmap project on Replit.</span></span>
              </a>
            </div>
          </section>}

          {showGuide && <section className="page-enter mt-5 rounded-[22px] border border-primary/20 bg-primary/5 p-5 sm:p-6" aria-label="How to solve each problem">
            <div className="mb-4 flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-primary">THE FIVE-STEP METHOD</p><h2 className="mt-1 font-display text-xl font-bold tracking-tight">How to solve each problem</h2></div><button onClick={() => setShowGuide(false)} aria-label="Close solve guide" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X size={17} /></button></div>
            <div className="grid gap-2 sm:grid-cols-5">{solvingSteps.map(([step, ask], i) => <div key={step} className="rounded-xl border border-border bg-card p-3"><div className="mb-2 flex items-center gap-2"><span className="font-mono text-[10px] text-primary">0{i + 1}</span><span className="text-xs font-extrabold">{step}</span></div><p className="text-[11px] leading-relaxed text-muted-foreground">{ask}</p></div>)}</div>
            <p className="mt-4 text-xs font-semibold text-muted-foreground">Don't just count solved problems. The goal is to recognize the pattern behind the problem.</p>
          </section>}

          <section className="page-enter stagger-1 mt-5 grid gap-3 sm:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1.15fr]" aria-label="Journey milestones and learning phases">
            <div className="rounded-[22px] border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-muted-foreground">THE 101-PROBLEM JOURNEY</p><h2 className="mt-1 font-display text-lg font-bold">Next milestone</h2></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0d8] text-[#b06a26] dark:bg-[#49351c] dark:text-[#f2bf7b]"><Flame size={17} /></span></div>
              <div className="mt-4 rounded-xl bg-muted/70 p-4">
                <div className="flex items-center justify-between"><span className="text-sm font-extrabold">{nextMilestone ? nextMilestone.name : 'Journey complete'}</span><span className="font-mono text-[11px] text-muted-foreground">{nextMilestone ? `${nextMilestone.range} solved` : '101 / 101'}</span></div>
                <div className="mt-3 progress-track"><div className="progress-fill" style={{ width: `${nextMilestone ? Math.min(100, solvedCount / Number(nextMilestone.range.split('–')[0]) * 100) : 100}%` }} /></div>
                <p className="mt-2 text-[11px] text-muted-foreground">{solvedCount === 0 ? 'Every expert starts by showing up.' : `${Math.max(0, (nextMilestone ? Number(nextMilestone.range.split('–')[0]) : 101) - solvedCount)} more to reach your next marker.`}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">{milestones.map((m) => {
                const [lo, hi] = m.range.split('–').map(Number);
                const achieved = solvedCount >= lo;
                const current = m === currentMilestone && solvedCount > 0;
                return <div key={m.name} className={`flex items-center gap-2 rounded-lg px-2 py-2 ${achieved ? 'text-primary' : 'text-muted-foreground'}`}><span className={`h-2 w-2 shrink-0 rounded-full ${achieved ? 'bg-primary' : 'bg-border'}`} /><div className="min-w-0"><p className="truncate text-[11px] font-extrabold">{m.name}{current ? ' · current' : ''}</p><p className="font-mono text-[9px] opacity-70">{lo}–{hi} problems</p></div></div>;
              })}</div>
            </div>
            <div className="rounded-[22px] border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-muted-foreground">RECOMMENDED LEARNING ORDER</p><h2 className="mt-1 font-display text-lg font-bold">Four focused phases</h2></div><ArrowDownRight className="text-primary" size={19} /></div>
              <div className="mt-4 grid grid-cols-2 gap-2">{phases.map((phase, index) => <div key={phase.title} className={`phase-${phase.color} rounded-xl p-3`}>
                <div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold tracking-wider opacity-65">PHASE 0{index + 1}</span><span className="font-mono text-[9px] opacity-65">{phase.range}</span></div>
                <h3 className="mt-1 text-[12px] font-extrabold">{phase.title}</h3>
                <p className="mt-1.5 text-[10px] leading-[1.6] opacity-75">{phase.topics.join(' → ')}</p>
              </div>)}</div>
            </div>
          </section>

          <section className="page-enter stagger-2 mt-7" aria-label="Problem roadmap">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div><p className="font-mono text-[10px] font-bold tracking-[.16em] text-primary">THE PRACTICE DECK</p><h2 className="mt-1 font-display text-[26px] font-bold tracking-[-.04em]">{activeTopic ? topics[activeTopic - 1]?.name : 'All 101 problems'}<span className="ml-2 text-sm font-semibold tracking-normal text-muted-foreground">{activeTopic ? topicProgress(topics[activeTopic - 1]).total : 'in sequence'}</span></h2></div>
              <div className="text-right"><p className="font-mono text-[10px] text-muted-foreground">CURRENT MILESTONE</p><p className="mt-1 text-xs font-extrabold text-primary">{solvedCount === 0 ? 'Ready when you are' : currentMilestone.name}</p></div>
            </div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="problem-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a problem, topic, or pattern…" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-16 text-sm outline-none placeholder:text-muted-foreground/75 focus:border-primary/60 focus:ring-2 focus:ring-primary/15" aria-label="Search problems by title, topic, or pattern" data-testid="input-problem-search" />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">/</kbd>
              </label>
              <label className="relative flex items-center gap-2 rounded-xl border border-border bg-card px-3">
                <Filter size={15} className="text-muted-foreground" />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | Status)} className="h-10 min-w-[132px] appearance-none bg-transparent pr-5 text-xs font-bold outline-none" aria-label="Filter by status" data-testid="select-status-filter">
                  <option value="all">All statuses</option>{STATUS_ORDER.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
                </select><ChevronDown size={13} className="pointer-events-none absolute right-3 text-muted-foreground" />
              </label>
              {(query || statusFilter !== 'all' || activeTopic !== null) && <button onClick={clearFilters} className="h-11 rounded-xl px-3 text-xs font-extrabold text-primary hover:bg-primary/10" data-testid="button-clear-filters">Clear</button>}
            </div>

            {visibleCount === 0 ? <div className="rounded-[22px] border border-dashed border-border bg-card/60 px-5 py-12 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground"><Search size={20} /></span>
              <h3 className="mt-4 font-display text-lg font-bold">No problems found</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Nothing in this roadmap matches those filters. Try another search or status.</p>
              <button onClick={clearFilters} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground" data-testid="button-reset-search">Reset filters</button>
            </div> : <div className="space-y-4">
              {visibleByTopic.map(({ topic, problems }) => {
                const progress = topicProgress(topic);
                return <article key={topic.id} className="overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_4px_18px_rgba(50,58,45,.035)]" data-testid={`section-topic-${topic.id}`}>
                  <div className="border-b border-border/80 bg-muted/35 px-4 py-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><span className="font-mono text-[10px] font-bold text-primary">{topic.symbol}</span><h3 className="font-display text-[18px] font-bold tracking-[-.025em]">{topic.name}</h3></div>
                        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-muted-foreground">{topic.focus}</p>
                      </div>
                      <div className="shrink-0 text-right"><span className="font-mono text-[11px] font-bold">{progress.solved}<span className="text-muted-foreground">/{progress.total}</span></span><div className="mt-2 w-16 progress-track"><div className="progress-fill" style={{ width: `${progress.solved / progress.total * 100}%` }} /></div></div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">{topic.patterns.map((pattern) => <span key={pattern} className="pattern-chip rounded-md border px-2 py-1 font-mono font-medium">{pattern}</span>)}</div>
                  </div>
                  <div className="divide-y divide-border/70">
                    {problems.map((problem) => {
                      const status = getStatus(problem.id);
                      const note = notes[problem.id] || { learned: '', revisit: '' };
                      const opened = notesOpen === problem.id;
                      return <div key={problem.id} className="problem-row" data-testid={`problem-row-${problem.id}`}>
                        <div className="flex min-h-[59px] items-center gap-2.5 px-3 py-2.5 sm:gap-3.5 sm:px-5">
                          <span className="w-7 shrink-0 text-right font-mono text-[10px] text-muted-foreground">{String(problem.id).padStart(2, '0')}</span>
                          <button onClick={() => cycleStatus(problem.id)} aria-label={`${problem.name}: ${STATUS_LABEL[status]}. Click to change status.`} title="Click to advance status" className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border transition ${status === 'solved' ? 'check-pop border-primary bg-primary text-primary-foreground' : status === 'in-progress' ? 'border-[#d49531] bg-[#fff0ce] text-[#a66509] dark:bg-[#493517] dark:text-[#ffd17a]' : status === 'review' ? 'border-[#dc8b6c] bg-[#ffdfd1] text-[#a84e28] dark:bg-[#4b2a20] dark:text-[#ffad89]' : 'border-border text-transparent hover:border-primary hover:text-primary'}`} data-testid={`button-status-${problem.id}`}>
                            {status === 'solved' ? <Check size={13} strokeWidth={3} /> : status === 'in-progress' ? <ArrowRight size={12} /> : status === 'review' ? <NotebookPen size={11} /> : <Circle size={10} />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-[13px] font-bold sm:text-sm ${status === 'solved' ? 'text-muted-foreground' : 'text-foreground'}`}>{problem.name}</p>
                            {note.learned || note.revisit ? <p className="mt-0.5 truncate text-[10px] text-primary">{note.learned || note.revisit}</p> : null}
                          </div>
                          <span className={`status-pill hidden sm:inline-flex status-${status}`}>{STATUS_LABEL[status]}</span>
                          <button onClick={() => setNotesOpen(opened ? null : problem.id)} aria-expanded={opened} aria-label={`${opened ? 'Close' : 'Add'} review note for ${problem.name}`} className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition ${opened || note.learned || note.revisit ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} data-testid={`button-note-${problem.id}`}><NotebookPen size={15} /></button>
                          <a href={`https://leetcode.com/problems/${slugFor(problem.name)}/`} target="_blank" rel="noreferrer" aria-label={`Open ${problem.name} on LeetCode in a new tab`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-primary" data-testid={`link-leetcode-${problem.id}`}><ExternalLink size={15} /></a>
                          <label className="sr-only" htmlFor={`status-${problem.id}`}>Set status for {problem.name}</label>
                          <select id={`status-${problem.id}`} value={status} onChange={(event) => changeStatus(problem.id, event.target.value as Status)} className="sr-only" data-testid={`select-status-${problem.id}`} aria-label={`Set status for ${problem.name}`}>
                            {STATUS_ORDER.map((option) => <option key={option} value={option}>{STATUS_LABEL[option]}</option>)}
                          </select>
                        </div>
                        {opened && <div className="grid gap-3 border-t border-border/60 bg-muted/25 px-4 py-4 sm:grid-cols-2 sm:px-12">
                          <label className="block"><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.11em] text-muted-foreground">What I learned</span><textarea value={note.learned} onChange={(event) => updateNote(problem.id, 'learned', event.target.value)} placeholder="The pattern, key insight, or aha moment…" rows={2} className="w-full resize-y rounded-xl border border-border bg-card px-3 py-2 text-xs leading-relaxed outline-none placeholder:text-muted-foreground/65 focus:border-primary/60 focus:ring-2 focus:ring-primary/10" data-testid={`textarea-learned-${problem.id}`} /></label>
                          <label className="block"><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.11em] text-muted-foreground">What to revisit</span><textarea value={note.revisit} onChange={(event) => updateNote(problem.id, 'revisit', event.target.value)} placeholder="A gap to close next time…" rows={2} className="w-full resize-y rounded-xl border border-border bg-card px-3 py-2 text-xs leading-relaxed outline-none placeholder:text-muted-foreground/65 focus:border-primary/60 focus:ring-2 focus:ring-primary/10" data-testid={`textarea-revisit-${problem.id}`} /></label>
                          <p className="text-[10px] text-muted-foreground sm:col-span-2">Saved on this device automatically.</p>
                        </div>}
                      </div>;
                    })}
                  </div>
                </article>;
              })}
            </div>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/55 px-4 py-3">
              <p className="text-[11px] font-semibold text-muted-foreground"><span className="font-mono text-foreground">{visibleCount}</span> {visibleCount === 1 ? 'problem' : 'problems'} shown <span className="mx-1 opacity-40">/</span> 101 total</p>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground"><CheckCheck size={13} className="text-primary" /> Click the status circle to cycle progress</p>
            </div>
          </section>

          <footer className="mt-10 border-t border-border pt-5 text-center">
            <p className="font-display text-sm font-bold">Steady reps. Stronger instincts.</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Your roadmap and notes live right here on this device.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;