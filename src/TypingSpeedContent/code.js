const code = {
  easy: [
    'function hello() { return "world"; }',
    'const sum = (a, b) => a + b;',
    'let count = 0; count++;',
    'if (x > 0) { console.log(x); }',
    'for (let i = 0; i < 10; i++) {}',
    'const arr = [1, 2, 3, 4, 5];',
    'return true; } else { return false;',
    'const name = "John"; let age = 30;',
    'while (condition) { doSomething(); }',
    'class User { constructor(name) { this.name = name; } }',
    'const obj = { id: 1, title: "todo" };',
    'try { risky(); } catch (e) { console.error(e); }',
    'Boolean(value) ? "yes" : "no";',
    'Math.max(...[3, 7, 2]);',
    'const greet = (n="world") => `Hello, ${n}!`;'
  ],
  medium: [
    'const fetchData = async () => { const res = await fetch(url); return res.json(); }',
    'const users = data.filter(u => u.age > 18).map(u => u.name);',
    'try { const result = await process(); } catch (error) { console.error(error); }',
    'const debounce = (fn, delay) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); }; }',
    'export default function Component({ children }) { return <div>{children}</div>; }',
    'const [state, setState] = useState(0); useEffect(() => { /* side effect */ }, [state]);',
    'interface User { id: number; name: string; email: string; }',
    'const promise = new Promise((resolve) => { setTimeout(resolve, 1000); });',
    'Array.from({ length: 10 }, (_, i) => i).reduce((acc, v) => acc + v, 0);',
    'const obj = { ...prev, [key]: value, nested: { ...prev.nested, data } };',
    'const byId = arr.reduce((m, x) => (m[x.id] = x, m), {});',
    'const uniq = a => [...new Set(a)];',
    'const toPairs = o => Object.entries(o);',
    'const parseJSON = s => { try { return JSON.parse(s); } catch { return null; } };',
    'const isEmpty = v => v == null || (Array.isArray(v) ? v.length === 0 : Object.keys(v).length === 0);'
  ],
  hard: [
    'const memoize = fn => { const cache = new Map(); return (...args) => { const k = JSON.stringify(args); if (cache.has(k)) return cache.get(k); const r = fn(...args); cache.set(k, r); return r; }; };',
    'class BinarySearchTree { constructor(){ this.root=null; } insert(v){ const n=new Node(v); if(!this.root){ this.root=n; return; } /* ... */ } }',
    'const deepClone = o => { if (o===null || typeof o !== "object") return o; const c = Array.isArray(o) ? [] : {}; for (const k in o) c[k] = deepClone(o[k]); return c; };',
    'function* fibonacci(){ let a=0,b=1; while(true){ yield a; [a,b]=[b,a+b]; } }',
    'const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);',
    'const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);',
    'const throttle = (fn, limit) => { let inT=false; return (...a) => { if (!inT){ fn(...a); inT=true; setTimeout(() => inT=false, limit); } }; };',
    'const asyncPool = async (poolLimit, array, iteratorFn) => { const ret=[]; const exec=[]; for (const item of array){ const p=Promise.resolve().then(() => iteratorFn(item)); ret.push(p); if (poolLimit <= array.length){ const e=p.then(() => exec.splice(exec.indexOf(e),1)); exec.push(e); if (exec.length >= poolLimit) await Promise.race(exec); } } return Promise.all(ret); };',
    'const curry = (fn, ...a) => a.length >= fn.length ? fn(...a) : (...b) => curry(fn, ...a, ...b);',
    'const withRetry = async (fn, n=3) => { let e; for (let i=0;i<n;i++){ try { return await fn(); } catch(err){ e=err; } } throw e; };',
    'const defer = f => Promise.resolve().then(f); // microtask',
    'const scheduler = () => { const q=[]; let r=false; const run=()=>{ r=false; q.splice(0).forEach(fn=>fn()); }; return fn => { q.push(fn); if(!r){ r=true; queueMicrotask(run); } }; };',
    'const range = function*(a,b,step=1){ for(let i=a;i<b;i+=step) yield i; };',
    'const timeout = ms => new Promise(res => setTimeout(res, ms));',
    'const safeGet = (o, path) => path.split(".").reduce((acc, k) => (acc && acc[k] != null) ? acc[k] : undefined, o);'
  ]
};

export default code;
