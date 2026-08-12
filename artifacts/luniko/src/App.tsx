import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowUpRight, BookOpen, Check, ChevronDown, CircleHelp, Compass, Copy,
  ExternalLink, Heart, Info, KeyRound, LockKeyhole, Menu, MessageCircle,
  Moon, PencilLine, Plus, RotateCcw, Send, Settings2, ShieldCheck, Sparkles,
  Star, UserRound, Wallet, X, Zap, Home as HomeIcon,
} from 'lucide-react';
import {
  Link, Route, Switch, useLocation, useParams, Router as WouterRouter,
} from 'wouter';

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string }) => Promise<unknown> };
    solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey?: { toString: () => string } }> };
  }
}

const queryClient = new QueryClient();
const STORAGE = {
  account: 'luniko:account',
  session: 'luniko:session',
  prefs: 'luniko:preferences',
  cookies: 'luniko:local-storage-choice',
  sparks: 'luniko:saved-sparks',
};
type Account = { email: string; name: string; wallet?: { kind: string; address: string } };
type Session = { email: string; name: string };

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
}
function saveStorage<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* static demo */ }
}
function setMeta(title: string, description: string) {
  document.title = `${title} | LUNIKO`;
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'description'); document.head.appendChild(tag); }
  tag.setAttribute('content', description);
}

const navItems = [
  ['/demo', 'Try the companion'],
  ['/about', 'Studio'],
  ['/how-to', 'How it works'],
  ['/roadmap', 'Roadmap'],
] as const;

function Mark({ small = false, inverse = false }: { small?: boolean; inverse?: boolean }) {
  const ink = inverse ? '#F8EBD2' : '#292641';
  const signal = '#C9F22D';
  return (
    <span className={`inline-flex items-center gap-2 ${small ? 'scale-[.82] origin-left' : ''}`} aria-label="LUNIKO">
      <svg width="35" height="35" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <path d="M8.2 25.8C5.8 18.1 11.7 9.7 20.8 7.4C29.5 5.2 38.2 9.2 39.7 16.2" stroke={ink} strokeWidth="1.7" strokeLinecap="round" />
        <path d="M35.8 18.2C38.2 25.9 32.3 34.3 23.2 36.6C14.5 38.8 5.8 34.8 4.3 27.8" stroke={ink} strokeWidth="1.7" strokeLinecap="round" />
        <path d="M22 11.8L24.8 19.2L32.2 22L24.8 24.8L22 32.2L19.2 24.8L11.8 22L19.2 19.2L22 11.8Z" fill={signal} />
        <circle cx="35.2" cy="10.2" r="2.3" fill={ink} />
      </svg>
      <span className="display text-[1.65rem] font-bold tracking-[-.08em]">LUNIKO</span>
    </span>
  );
}

function Button({ children, href, variant = 'dark', onClick, type = 'button', className = '', disabled = false }: {
  children: ReactNode; href?: string; variant?: 'dark' | 'signal' | 'quiet' | 'outline'; onClick?: () => void; type?: 'button' | 'submit'; className?: string; disabled?: boolean;
}) {
  const styles = {
    dark: 'bg-[#292641] text-[#f8ebd2] hover:bg-[#403960]',
    signal: 'bg-[#c9f22d] text-[#292641] hover:bg-[#d8fa54]',
    quiet: 'bg-transparent text-[#292641] hover:bg-[#e6dccb]',
    outline: 'border border-[#7e7893] text-[#292641] hover:border-[#292641] hover:bg-[#eee2d1]',
  }[variant];
  const content = <span className={`button-lift inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-semibold ${styles} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}>{children}</span>;
  return href ? <Link href={href} data-testid={`link-${href.replace('/', '') || 'home'}`}>{content}</Link> : <button type={type} onClick={onClick} disabled={disabled} data-testid={`button-${typeof children === 'string' ? children.toLowerCase().replaceAll(' ', '-') : 'action'}`}>{content}</button>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const signedIn = Boolean(readStorage<Session | null>(STORAGE.session, null));
  return (
    <header className="relative z-20 border-b border-[#c9c1c9] bg-[#f6ecd9]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" data-testid="link-logo"><Mark small /></Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navItems.map(([href, label]) => <Link key={href} href={href} className={`text-sm ${location === href ? 'font-bold' : 'text-[#615b70] hover:text-[#292641]'}`} data-testid={`link-nav-${href.slice(1)}`}>{label}</Link>)}
          <Link href={signedIn ? '/dashboard' : '/login'} className="text-sm font-semibold" data-testid="link-account">{signedIn ? 'My space' : 'Enter space'} <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </nav>
        <button className="p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} data-testid="button-menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <nav className="border-t border-[#c9c1c9] px-5 pb-5 pt-3 lg:hidden" aria-label="Mobile navigation">
        {navItems.map(([href, label]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="block border-b border-[#d5ccd0] py-3 text-sm" data-testid={`link-mobile-${href.slice(1)}`}>{label}</Link>)}
        <Link onClick={() => setOpen(false)} href={signedIn ? '/dashboard' : '/login'} className="block py-3 text-sm font-semibold" data-testid="link-mobile-account">{signedIn ? 'My space' : 'Enter space'}</Link>
      </nav>}
    </header>
  );
}

function Footer() {
  return <footer className="border-t border-[#655f78] bg-[#292641] text-[#f8ebd2]">
    <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
      <div><Mark inverse /><p className="mt-5 max-w-xs text-sm leading-6 text-[#c5bad0]">A small, safe place for big questions and the people who help us ask them.</p></div>
      <div><p className="mono text-[#c9f22d]">Explore</p><div className="mt-4 grid gap-3 text-sm text-[#c5bad0]"><Link href="/demo" data-testid="link-footer-demo">Try the companion</Link><Link href="/about" data-testid="link-footer-about">Our studio</Link><Link href="/roadmap" data-testid="link-footer-roadmap">Roadmap</Link></div></div>
      <div><p className="mono text-[#c9f22d]">For grown-ups</p><div className="mt-4 grid gap-3 text-sm text-[#c5bad0]"><Link href="/how-to" data-testid="link-footer-how-to">How it works</Link><Link href="/cookies" data-testid="link-footer-cookies">Privacy and storage</Link><Link href="/login" data-testid="link-footer-login">Sign in</Link></div></div>
    </div>
    <div className="mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-[#4d4864] px-5 py-5 text-xs text-[#968da9] md:flex-row md:justify-between md:px-8"><span>© 2026 LUNIKO studio</span><span>Made for curious minds and their trusted adults.</span></div>
  </footer>;
}

function PageFrame({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  const [location] = useLocation();
  useEffect(() => {
    const meta: Record<string, [string, string]> = {
      '/': ['A calm creative companion', 'LUNIKO is a safe, thoughtful space for young learners and trusted adults to explore ideas together.'],
      '/demo': ['Try the companion', 'Explore a guided LUNIKO conversation with curious, safe prompts.'],
      '/about': ['The studio behind LUNIKO', 'Read the principles and studio note behind LUNIKO.'],
      '/how-to': ['How LUNIKO works', 'A concise guide for learners, parents, and educators.'],
      '/cookies': ['Privacy and local storage', 'Understand exactly what this static LUNIKO demo stores in your browser.'],
      '/roadmap': ['The LUNIKO roadmap', 'See the planned LUNIKO product path from August through December 2026.'],
      '/brand': ['The LUNIKO brand', 'Explore the LUNIKO mark, palette, type voice, and usage notes.'],
      '/login': ['Enter your space', 'Sign in to your local LUNIKO demo space.'],
      '/dashboard': ['Your LUNIKO space', 'Review recent sessions, saved sparks, preferences, and wallet status.'],
    };
    setMeta(...(meta[location] || ['Page not found', 'This LUNIKO page does not exist.']));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
  return <div className={`grain min-h-[100dvh] ${dark ? 'bg-[#292641] text-[#f8ebd2]' : 'bg-[#f6ecd9] text-[#292641]'}`}><Header />{children}<Footer /></div>;
}

function OrbitField() {
  return <div className="pointer-events-none absolute right-[-6rem] top-12 h-[27rem] w-[27rem] opacity-80 md:right-[-2rem] md:top-[-2rem] md:h-[34rem] md:w-[34rem]">
    <div className="absolute inset-0 rounded-full border border-[#bcb4c5]" />
    <div className="absolute inset-[13%] rounded-full border border-[#bcb4c5]" />
    <div className="absolute inset-[26%] rounded-full border border-[#bcb4c5]" />
    <div className="orbit-spin absolute inset-[7%] rounded-full border border-dashed border-[#8d879f]"><span className="absolute left-[11%] top-[7%] h-3 w-3 rounded-full bg-[#c9f22d]" /></div>
    <div className="absolute left-[42%] top-[40%] h-28 w-28 rounded-full bg-[#c9f22d] opacity-20 blur-2xl" />
  </div>;
}

function Home() {
  return <PageFrame>
    <main>
      <section className="relative overflow-hidden border-b border-[#c9c1c9]">
        <OrbitField />
        <div className="relative mx-auto grid max-w-[1240px] gap-16 px-5 pb-20 pt-16 md:grid-cols-[1.1fr_.9fr] md:px-8 md:pb-32 md:pt-24">
          <div className="reveal max-w-2xl">
            <p className="mono mb-8 flex items-center gap-3 text-[#665f76]"><span className="h-2 w-2 bg-[#c9f22d]" /> A creative companion for growing minds</p>
            <h1 className="display text-[4.6rem] leading-[.87] md:text-[8.2rem]">Wonder has<br /><span className="text-[#777091]">room here.</span></h1>
            <p className="mt-9 max-w-md text-lg leading-7 text-[#615b70]">LUNIKO helps young learners follow a question, find a new angle, and make something of it with a trusted adult close by.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3"><Button href="/demo" variant="signal">Try a guided spark <ArrowUpRight className="h-4 w-4" /></Button><Button href="/about" variant="quiet">Meet the studio</Button></div>
          </div>
          <div className="reveal reveal-2 relative flex min-h-[23rem] items-end md:items-center">
            <div className="relative z-10 w-full border border-[#615b70] bg-[#e6deee] p-5 shadow-[12px_12px_0_#292641] md:ml-auto md:max-w-[23rem]">
              <div className="flex items-center justify-between border-b border-[#afa7bb] pb-4"><span className="mono text-[#6d667c]">LUNIKO / 01</span><span className="h-2 w-2 bg-[#c9f22d]" /></div>
              <p className="mt-7 text-sm text-[#6d667c]">A question worth keeping</p>
              <p className="display mt-2 text-3xl leading-tight">“Why do some ideas stick?”</p>
              <div className="mt-8 flex items-end justify-between"><span className="text-xs text-[#6d667c]">Let’s look closer.</span><span className="grid h-10 w-10 place-items-center rounded-full bg-[#292641] text-[#c9f22d]"><ArrowUpRight className="h-4 w-4" /></span></div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-[.8fr_1.2fr]"><p className="mono text-[#777091]">A different kind of tool</p><div><h2 className="display max-w-3xl text-4xl leading-tight md:text-6xl">Not a shortcut to the answer. A place to practice finding your own.</h2><p className="mt-7 max-w-xl text-base leading-7 text-[#615b70]">We designed LUNIKO around the pause before the answer. It offers prompts, possibilities, and gentle guardrails so a young person can stay in the driver’s seat.</p></div></div>
        <div className="mt-16 grid border-y border-[#c9c1c9] md:grid-cols-3">
          {[['01', 'Follow the thread', 'Start with a half-formed thought. LUNIKO helps turn it around until the interesting part shows up.'], ['02', 'Make it yours', 'Sketch, write, compare, test. Each session ends with a small next move, not a pile of information.'], ['03', 'Keep adults close', 'Trusted adults can see the shape of a session without taking over the conversation.']].map(([num, title, text]) => <article className="border-b border-[#c9c1c9] py-7 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0" key={num}><p className="mono text-[#777091]">{num}</p><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#615b70]">{text}</p></article>)}
        </div>
      </section>
      <section className="bg-[#292641] text-[#f8ebd2]"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 md:grid-cols-[1fr_.9fr] md:px-8 md:py-28"><div><p className="mono text-[#c9f22d]">A quiet signal</p><h2 className="display mt-6 text-5xl leading-[.95] md:text-7xl">Curiosity is<br />a practice.</h2></div><div className="md:pt-14"><p className="max-w-md text-lg leading-7 text-[#c5bad0]">The best moments are often tiny: a connection made, a question redrawn, a new idea shared at the dinner table.</p><Button href="/how-to" variant="signal" className="mt-8">See how it works <ArrowUpRight className="h-4 w-4" /></Button></div></div></section>
      <section className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mono text-[#777091]">Take a look inside</p><h2 className="display mt-5 text-4xl md:text-6xl">Start with a spark.</h2></div><Button href="/demo" variant="outline">Open the demo <ArrowUpRight className="h-4 w-4" /></Button></div><div className="mt-12 grid gap-4 md:grid-cols-[1.3fr_.7fr]"><Link href="/demo" className="card-lift group min-h-[18rem] border border-[#81798e] bg-[#e6deee] p-6 md:p-8" data-testid="card-demo-preview"><div className="flex justify-between"><Sparkles className="h-5 w-5" /><span className="mono">Interactive</span></div><div className="mt-20 flex items-end justify-between"><div><h3 className="display text-3xl">A pocket-sized “what if?”</h3><p className="mt-2 max-w-sm text-sm text-[#615b70]">Three curious prompts. A few unexpected turns. No account needed.</p></div><ArrowUpRight className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div></Link><div className="grid gap-4"><Link href="/roadmap" className="card-lift border border-[#81798e] bg-[#d9e4a2] p-6" data-testid="card-roadmap"><span className="mono">Looking ahead</span><h3 className="display mt-10 text-2xl">A studio with a long view.</h3><span className="mt-5 inline-flex text-sm font-semibold">Read the roadmap <ArrowUpRight className="ml-2 h-4 w-4" /></span></Link><Link href="/login" className="card-lift border border-[#81798e] bg-[#f0c8ad] p-6" data-testid="card-space"><span className="mono">Make a space</span><h3 className="display mt-10 text-2xl">Keep your best sparks nearby.</h3><span className="mt-5 inline-flex text-sm font-semibold">Enter LUNIKO <ArrowUpRight className="ml-2 h-4 w-4" /></span></Link></div></div></section>
    </main>
  </PageFrame>;
}

const responseMap: Record<string, string> = {
  'Why is the sky blue?': 'Light from the sun contains many colors. Air scatters the shorter blue waves more than the longer red ones, so blue arrives from every direction. Try this next: shine a small torch through a glass of water and watch the beam.',
  'Help me invent a creature': 'Let’s give it one impossible detail. It has transparent ears that collect stories from far away. What does it eat, and what does it do when it hears a story it loves?',
  'I feel stuck on an idea': 'That is a useful place to be. Instead of pushing for a finished idea, name three things you already know. Then change one of them. A small change can open a surprising door.',
  'What could I make today?': 'Make a tiny field guide to something near you: five leaves, three sounds, or the patterns in a room. Draw each one and add one question you still have.',
};

function Demo() {
  const [messages, setMessages] = useState([{ from: 'luniko', text: 'Bring me a half-formed thought. We’ll give it one small turn.' }]);
  const [input, setInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'empty'>('idle');
  const saveLatestSpark = () => {
    const lastQuestion = [...messages].reverse().find((message) => message.from === 'you');
    if (!lastQuestion) {
      setSaveStatus('empty');
      window.setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }
    const sparks = readStorage<string[]>(STORAGE.sparks, []);
    if (!sparks.includes(lastQuestion.text)) saveStorage(STORAGE.sparks, [...sparks, lastQuestion.text]);
    setSaveStatus('saved');
    window.setTimeout(() => setSaveStatus('idle'), 3000);
  };
  const send = (prompt = input) => {
    const clean = prompt.trim();
    if (!clean) return;
    setMessages((current) => [...current, { from: 'you', text: clean }, { from: 'luniko', text: responseMap[clean] || 'Let’s keep that one small enough to touch. Name one detail, change one assumption, and see what new shape appears.' }]);
    setInput('');
    setSaveStatus('idle');
  };
  return <PageFrame><main className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-20"><div className="grid gap-14 md:grid-cols-[.65fr_1.35fr]"><div className="reveal"><p className="mono text-[#777091]">Open studio / guided demo</p><h1 className="display mt-6 text-5xl leading-[.93] md:text-7xl">Follow a<br /><span className="text-[#777091]">spark.</span></h1><p className="mt-7 max-w-sm text-base leading-7 text-[#615b70]">This little conversation is available to everyone. Pick a door, then see where it leads.</p><div className="mt-10 grid gap-2">{Object.keys(responseMap).map((prompt) => <button key={prompt} onClick={() => send(prompt)} className="group flex items-center justify-between border-b border-[#c9c1c9] py-3 text-left text-sm hover:text-[#777091]" data-testid={`button-prompt-${prompt.slice(0, 8).replaceAll(' ', '-').toLowerCase()}`}><span>{prompt}</span><ArrowUpRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button>)}</div></div><div className="reveal reveal-2"><div className="overflow-hidden border border-[#615b70] bg-[#eee2d1] shadow-[10px_10px_0_#292641]"><div className="flex items-center justify-between border-b border-[#bcb2b5] bg-[#e6deee] px-5 py-4"><div className="flex items-center gap-3"><Mark small /><span className="mono text-[#777091]">safe mode / on</span></div><button onClick={() => { setMessages([{ from: 'luniko', text: 'Bring me a half-formed thought. We’ll give it one small turn.' }]); setSaveStatus('idle'); }} aria-label="Reset conversation" className="text-[#615b70] hover:text-[#292641]" data-testid="button-reset-demo"><RotateCcw className="h-4 w-4" /></button></div><div className="min-h-[25rem] space-y-5 p-5 md:min-h-[29rem] md:p-8">{messages.map((message, index) => <div key={`${message.from}-${index}`} className={`flex ${message.from === 'you' ? 'justify-end' : 'justify-start'}`} data-testid={`message-${message.from}-${index}`}><div className={`max-w-[85%] border px-4 py-3 text-sm leading-6 ${message.from === 'you' ? 'border-[#292641] bg-[#292641] text-[#f8ebd2]' : 'border-[#bbb0bf] bg-[#f6ecd9]'}`}>{message.text}</div></div>)}{saveStatus === 'saved' && <div className="flex items-center gap-2 text-xs text-[#687b28]" data-testid="status-saved"><Check className="h-3.5 w-3.5" /> Spark saved to your local space</div>}{saveStatus === 'empty' && <div className="flex items-center gap-2 text-xs text-[#a3453e]" data-testid="status-save-empty"><Info className="h-3.5 w-3.5" /> Ask a question before saving a spark</div>}</div><form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex gap-2 border-t border-[#bcb2b5] bg-[#e6deee] p-4"><label htmlFor="demo-input" className="sr-only">Ask LUNIKO</label><input id="demo-input" value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" data-testid="input-demo-question" /><button type="button" onClick={saveLatestSpark} className="grid h-10 w-10 shrink-0 place-items-center border border-[#81798e] hover:bg-[#f6ecd9]" aria-label="Save spark" data-testid="button-save-spark"><Star className="h-4 w-4" /></button><button type="submit" className="grid h-10 w-10 shrink-0 place-items-center bg-[#c9f22d] hover:bg-[#d8fa54]" aria-label="Send question" data-testid="button-send-question"><Send className="h-4 w-4" /></button></form></div><p className="mt-5 flex items-center gap-2 text-xs text-[#777091]"><ShieldCheck className="h-4 w-4" /> This demo is curated for gentle, age-aware exploration.</p></div></div></main></PageFrame>;
}

function About() {
  return <PageFrame><main><section className="mx-auto max-w-[1240px] px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24"><p className="mono text-[#777091]">The studio behind LUNIKO</p><h1 className="display mt-6 max-w-4xl text-6xl leading-[.9] md:text-[8rem]">Small tools.<br /><span className="text-[#777091]">Wide wonder.</span></h1><p className="mt-10 max-w-xl text-xl leading-8 text-[#615b70]">LUNIKO began with a simple observation: young people do not need louder answers. They need better invitations to think.</p></section><section className="bg-[#e6deee]"><div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-20 md:grid-cols-[.7fr_1.3fr] md:px-8 md:py-28"><p className="mono text-[#777091]">Our principles</p><div className="space-y-0">{[['Stay curious', 'We protect the useful pause between “I don’t know” and “I know”.'], ['Keep agency visible', 'A companion can suggest a path. The learner chooses whether to take it.'], ['Make safety ordinary', 'Clear boundaries should feel like good product design, never a locked door.'], ['Design for the handoff', 'The best session leaves room for a conversation away from the screen.']].map(([title, text], index) => <article className="grid gap-4 border-t border-[#b8aec0] py-6 md:grid-cols-[2.4rem_1fr] md:gap-7" key={title}><span className="mono text-[#777091]">0{index + 1}</span><div><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-2 max-w-lg leading-7 text-[#615b70]">{text}</p></div></article>)}</div></div></section><section className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28"><div className="grid gap-10 md:grid-cols-[1fr_1fr]"><div><p className="mono text-[#777091]">A studio note</p><h2 className="display mt-5 text-5xl leading-none md:text-6xl">Built in the open, held with care.</h2></div><div className="space-y-5 text-[#615b70] leading-7"><p>LUNIKO is an independent product studio experiment. We are interested in the texture of learning: the side questions, the funny diagrams, the moment a familiar thing becomes strange again.</p><p>Our first prototype is intentionally small. It gives learners, parents, and educators a shared vocabulary for exploring ideas together.</p><Button href="/brand" variant="outline">See the LUNIKO language <ArrowUpRight className="h-4 w-4" /></Button></div></div></section></main></PageFrame>;
}

function HowTo() {
  const groups: [string, string, string[]][] = [['For learners', 'Bring a question, a hunch, or even a blank page.', ['Pick a starting spark that feels interesting, not impressive.', 'Ask LUNIKO to compare, remix, explain, or challenge an idea.', 'Save one next move you can try away from the screen.']], ['For trusted adults', 'Stay nearby without needing to have every answer.', ['Ask what the learner noticed before asking what they learned.', 'Use the saved spark as a starting point for a shared activity.', 'Talk about the process, not just whether the answer is right.']], ['For educators', 'Make room for a question to take an unexpected route.', ['Use a prompt as a warm-up for discussion or making.', 'Invite learners to show the path they took, not only the result.', 'Keep your classroom rules and local safeguarding practice in charge.']]];
  return <PageFrame><main className="mx-auto max-w-[1240px] px-5 py-16 md:px-8 md:py-24"><div className="max-w-3xl"><p className="mono text-[#777091]">A short field guide</p><h1 className="display mt-6 text-6xl leading-[.9] md:text-[7.5rem]">Use it<br /><span className="text-[#777091]">together.</span></h1><p className="mt-9 max-w-lg text-lg leading-7 text-[#615b70]">LUNIKO works best as a third voice in a real conversation. Here are three ways to make the most of it.</p></div><div className="mt-20 grid gap-0 border-t border-[#c9c1c9] md:grid-cols-3">{groups.map(([title, intro, items], index) => <article className="border-b border-[#c9c1c9] py-8 md:border-r md:px-8 md:py-10 md:first:pl-0 md:last:border-r-0" key={title}><p className="mono text-[#777091]">0{index + 1}</p><h2 className="mt-8 text-2xl font-semibold">{title}</h2><p className="mt-3 min-h-14 text-sm leading-6 text-[#615b70]">{intro}</p><ol className="mt-8 space-y-5">{(items as string[]).map((item, itemIndex) => <li className="flex gap-3 text-sm leading-6" key={item}><span className="grid h-5 w-5 shrink-0 place-items-center border border-[#81798e] text-xs">{itemIndex + 1}</span><span>{item}</span></li>)}</ol></article>)}</div><div className="mt-16 flex gap-4 border border-[#81798e] bg-[#d9e4a2] p-6 md:p-8"><ShieldCheck className="mt-1 h-5 w-5 shrink-0" /><div><h2 className="font-semibold">A note about safety</h2><p className="mt-2 max-w-2xl text-sm leading-6">LUNIKO is a creative companion, not a replacement for a trusted adult, teacher, or professional support. If something feels urgent or unsafe, close the tool and speak to a trusted adult right away.</p></div></div></main></PageFrame>;
}

function Cookies() {
  const [choice, setChoice] = useState<'minimal' | 'full'>(readStorage<'minimal' | 'full'>(STORAGE.cookies, 'minimal'));
  const choose = (value: 'minimal' | 'full') => { setChoice(value); saveStorage(STORAGE.cookies, value); };
  return <PageFrame><main className="mx-auto max-w-[1000px] px-5 py-16 md:px-8 md:py-24"><p className="mono text-[#777091]">Privacy, plainly</p><h1 className="display mt-6 text-6xl leading-[.9] md:text-8xl">Your browser.<br /><span className="text-[#777091]">Your say.</span></h1><p className="mt-9 max-w-xl text-lg leading-7 text-[#615b70]">This first LUNIKO demo is a static prototype. It does not send account data to a server.</p><section className="mt-16 border-y border-[#c9c1c9]"><article className="grid gap-5 border-b border-[#c9c1c9] py-8 md:grid-cols-[12rem_1fr]"><p className="mono text-[#777091]">What we store</p><div><h2 className="text-xl font-semibold">Only what makes the demo work</h2><p className="mt-3 leading-7 text-[#615b70]">Your demo email, display name, active session, preferences, saved sparks, and your local storage choice stay in this browser under keys prefixed with <code className="bg-[#e6deee] px-1.5 py-1 text-sm">luniko:</code>. We do not use tracking pixels or advertising cookies.</p></div></article><article className="grid gap-5 py-8 md:grid-cols-[12rem_1fr]"><p className="mono text-[#777091]">Your controls</p><div><h2 className="text-xl font-semibold">Choose the smallest footprint</h2><p className="mt-3 leading-7 text-[#615b70]">Minimal keeps the prototype essentials. Full remembers optional preferences for a smoother return. You can clear everything at any time from this page.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => choose('minimal')} className={`border px-4 py-2 text-sm ${choice === 'minimal' ? 'border-[#292641] bg-[#292641] text-[#f8ebd2]' : 'border-[#81798e]'}`} data-testid="button-cookie-minimal">{choice === 'minimal' && <Check className="mr-2 inline h-4 w-4" />}Minimal storage</button><button onClick={() => choose('full')} className={`border px-4 py-2 text-sm ${choice === 'full' ? 'border-[#292641] bg-[#292641] text-[#f8ebd2]' : 'border-[#81798e]'}`} data-testid="button-cookie-full">{choice === 'full' && <Check className="mr-2 inline h-4 w-4" />}Full preferences</button><button onClick={() => { Object.keys(STORAGE).forEach((key) => localStorage.removeItem(key)); setChoice('minimal'); }} className="border border-[#81798e] px-4 py-2 text-sm hover:bg-[#e6deee]" data-testid="button-clear-storage">Clear local data</button></div><p className="mt-4 text-xs text-[#777091]" data-testid="status-cookie-choice">Current choice: {choice === 'minimal' ? 'minimal storage' : 'full preferences'}.</p></div></article></section></main></PageFrame>;
}

function Roadmap() {
  const months = [['AUG 2026', 'The first room', 'A focused guided demo, local spaces, and the first set of creative sparks for young learners.'], ['SEP 2026', 'Trusted circles', 'A clearer handoff for adults, with shared session notes and age-aware conversation settings.'], ['OCT 2026', 'Make mode', 'Turn an idea into a sketch, story, experiment, or tiny plan with lightweight creative tools.'], ['NOV 2026', 'Classroom cues', 'Educator patterns for starting discussion, reflecting on process, and keeping context close.'], ['DEC 2026', 'A wider night sky', 'A careful review of what we learned, with new pathways shaped by families and classrooms.']];
  return <PageFrame dark><main><section className="mx-auto max-w-[1240px] px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24"><p className="mono text-[#c9f22d]">The long view / 2026</p><h1 className="display mt-6 max-w-4xl text-6xl leading-[.88] md:text-[8.5rem]">A little<br />further out.</h1><p className="mt-10 max-w-xl text-lg leading-7 text-[#c5bad0]">LUNIKO is growing deliberately. Each step should make the shared moment more useful, more legible, and still a little surprising.</p></section><section className="border-t border-[#4d4864]"><div className="mx-auto max-w-[1240px] px-5 py-10 md:px-8 md:py-16">{months.map(([month, title, text], index) => <article className="grid gap-5 border-b border-[#4d4864] py-8 md:grid-cols-[10rem_1fr_1.2fr] md:items-start md:py-10" key={month}><p className="mono text-[#c9f22d]">{month}</p><h2 className="display text-3xl">{title}</h2><p className="max-w-md text-sm leading-6 text-[#c5bad0]">{text}</p><span className={`hidden h-2 w-2 md:block ${index === 0 ? 'bg-[#c9f22d]' : 'border border-[#827995]'}`} /></article>)}</div></section><section className="mx-auto max-w-[1240px] px-5 py-16 md:px-8 md:py-24"><div className="border border-[#827995] bg-[#403960] p-6 md:p-10"><p className="mono text-[#c9f22d]">Roadmaps are invitations</p><h2 className="display mt-5 max-w-2xl text-4xl leading-tight md:text-5xl">The dates are directional. The care is not.</h2><p className="mt-5 max-w-xl leading-7 text-[#c5bad0]">We will change course when learners, trusted adults, and educators show us a better one.</p></div></section></main></PageFrame>;
}

function Brand() {
  return <PageFrame><main><section className="mx-auto max-w-[1240px] px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24"><p className="mono text-[#777091]">The LUNIKO language</p><div className="mt-12 flex flex-col items-start justify-between gap-14 md:flex-row md:items-center"><div><Mark /><h1 className="display mt-8 text-6xl leading-[.86] md:text-[8rem]">A soft signal<br /><span className="text-[#777091]">in the dark.</span></h1></div><div className="relative grid h-52 w-52 place-items-center border border-[#81798e] bg-[#e6deee] md:h-72 md:w-72"><Mark /><div className="absolute inset-5 rounded-full border border-dashed border-[#81798e]" /><span className="absolute right-3 top-3 h-3 w-3 bg-[#c9f22d]" /></div></div></section><section className="bg-[#292641] text-[#f8ebd2]"><div className="mx-auto max-w-[1240px] px-5 py-16 md:px-8 md:py-24"><div className="grid gap-10 md:grid-cols-3"><div><p className="mono text-[#c9f22d]">Palette</p><div className="mt-7 grid grid-cols-2"><span className="h-20 bg-[#292641]" /><span className="h-20 bg-[#e6deee]" /><span className="h-20 bg-[#f0c8ad]" /><span className="h-20 bg-[#c9f22d]" /></div><div className="mt-3 grid grid-cols-2 text-xs text-[#c5bad0]"><span>Night-sky ink</span><span>Mineral lilac</span><span>Apricot light</span><span>Electric signal</span></div></div><div><p className="mono text-[#c9f22d]">Type voice</p><h2 className="display mt-6 text-4xl">Thoughtful,<br />never precious.</h2><p className="mt-5 text-sm leading-6 text-[#c5bad0]">Short sentences. Specific invitations. A little room around every idea.</p></div><div><p className="mono text-[#c9f22d]">Usage notes</p><ul className="mt-6 space-y-4 text-sm leading-6 text-[#c5bad0]"><li>Use the orbit to suggest connection, not decoration.</li><li>Let chartreuse be a signal, never a wash.</li><li>Give questions generous space to breathe.</li></ul></div></div></div></section></main></PageFrame>;
}

function WalletButton({ kind, onConnected }: { kind: 'MetaMask' | 'Phantom'; onConnected: (wallet: { kind: string; address: string }) => void }) {
  const [status, setStatus] = useState<'idle' | 'missing' | 'loading'>('idle');
  const connect = async () => {
    setStatus('loading');
    try {
      if (kind === 'MetaMask') {
        if (!window.ethereum) { setStatus('missing'); return; }
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts?.[0]) onConnected({ kind, address: accounts[0] });
        else setStatus('missing');
      } else {
        if (!window.solana?.isPhantom) { setStatus('missing'); return; }
        const result = await window.solana.connect();
        const address = result.publicKey?.toString();
        if (address) onConnected({ kind, address });
        else setStatus('missing');
      }
    } catch { setStatus('missing'); }
  };
  return <div><button onClick={connect} disabled={status === 'loading'} className="flex w-full items-center justify-between border border-[#81798e] px-4 py-3 text-left text-sm hover:border-[#292641] disabled:opacity-60" data-testid={`button-connect-${kind.toLowerCase()}`}><span className="flex items-center gap-3"><Wallet className="h-4 w-4" />{status === 'loading' ? 'Checking provider...' : `Connect ${kind}`}</span><ArrowUpRight className="h-4 w-4" /></button>{status === 'missing' && <p className="mt-2 text-xs leading-5 text-[#a3453e]" data-testid={`status-wallet-${kind.toLowerCase()}`}>{kind} is not available in this browser. You can use email demo sign in instead.</p>}</div>;
}

function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'signin' | 'create' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [account, setAccount] = useState<Account | null>(readStorage<Account | null>(STORAGE.account, null));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !email.includes('@')) { setMessage('Add a valid email so we know where to keep your local space.'); return; }
    if (mode === 'forgot') { setMessage('If this were a connected account, recovery instructions would arrive by email. For this demo, your local space stays in this browser.'); return; }
    const next = { email: email.trim().toLowerCase(), name: name.trim() || email.split('@')[0] } satisfies Account;
    saveStorage(STORAGE.account, next); saveStorage(STORAGE.session, { email: next.email, name: next.name }); setAccount(next); setMessage('Your local space is ready.'); setTimeout(() => setLocation('/dashboard'), 500);
  };
  const connected = (wallet: { kind: string; address: string }) => {
    const next = { email: '', name: wallet.kind, wallet };
    saveStorage(STORAGE.account, next); saveStorage(STORAGE.session, { email: '', name: wallet.kind }); setAccount(next); setMessage(`${wallet.kind} connected: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`); setTimeout(() => setLocation('/dashboard'), 700);
  };
  return <PageFrame><main className="mx-auto grid max-w-[1240px] gap-14 px-5 py-14 md:grid-cols-[.85fr_1.15fr] md:px-8 md:py-24"><div className="md:pt-10"><p className="mono text-[#777091]">Your small corner of LUNIKO</p><h1 className="display mt-6 text-6xl leading-[.88] md:text-8xl">{mode === 'forgot' ? <>Find your<br /><span className="text-[#777091]">way back.</span></> : <>Come on<br /><span className="text-[#777091]">in.</span></>}</h1><p className="mt-8 max-w-sm leading-7 text-[#615b70]">A local demo space for saving sparks, keeping track of ideas, and returning to the good questions.</p></div><div className="border border-[#81798e] bg-[#eee2d1] p-5 shadow-[10px_10px_0_#292641] md:p-8"><div className="flex flex-wrap gap-5 border-b border-[#c9c1c9] pb-4">{[['signin', 'Sign in'], ['create', 'Create account'], ['forgot', 'Forgot password']].map(([key, label]) => <button key={key} onClick={() => { setMode(key as typeof mode); setMessage(''); }} className={`pb-2 text-sm ${mode === key ? 'border-b-2 border-[#292641] font-semibold' : 'text-[#777091]'}`} data-testid={`button-auth-${key}`}>{label}</button>)}</div>{mode === 'forgot' ? <form onSubmit={submit} className="mt-8"><label className="mono text-[#777091]" htmlFor="recovery-email">Email address</label><input id="recovery-email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-3 w-full border-b border-[#81798e] bg-transparent py-3 outline-none focus:border-[#292641]" data-testid="input-recovery-email" /><Button type="submit" variant="dark" className="mt-8 w-full">Send recovery note <Send className="h-4 w-4" /></Button></form> : <form onSubmit={submit} className="mt-8">{mode === 'create' && <><label className="mono text-[#777091]" htmlFor="account-name">Your name</label><input id="account-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-3 mb-6 w-full border-b border-[#81798e] bg-transparent py-3 outline-none focus:border-[#292641]" data-testid="input-name" /></>}<label className="mono text-[#777091]" htmlFor="account-email">Email address</label><input id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-3 w-full border-b border-[#81798e] bg-transparent py-3 outline-none focus:border-[#292641]" data-testid="input-email" /><Button type="submit" variant="signal" className="mt-8 w-full">{mode === 'create' ? 'Create local space' : 'Enter local space'} <ArrowUpRight className="h-4 w-4" /></Button></form>}{message && <p className="mt-4 border-l-2 border-[#c9f22d] pl-3 text-sm leading-6" data-testid="status-auth-message">{message}</p>}<div className="my-8 flex items-center gap-3 text-xs text-[#777091]"><span className="h-px flex-1 bg-[#c9c1c9]" />or use a wallet<span className="h-px flex-1 bg-[#c9c1c9]" /></div><div className="grid gap-2"><WalletButton kind="MetaMask" onConnected={connected} /><WalletButton kind="Phantom" onConnected={connected} /></div><div className="mt-7 flex gap-3 border-t border-[#c9c1c9] pt-5 text-xs leading-5 text-[#777091]"><LockKeyhole className="h-4 w-4 shrink-0" />Demo accounts are stored locally in this static prototype. No email is sent and no server account is created.</div>{account?.wallet && <p className="mt-4 text-xs text-[#687b28]" data-testid="status-existing-wallet">Wallet found in this browser.</p>}</div></main></PageFrame>;
}

function Dashboard() {
  const [, setLocation] = useLocation();
  const [session, setSession] = useState<Session | null>(readStorage<Session | null>(STORAGE.session, null));
  const account = readStorage<Account | null>(STORAGE.account, null);
  const [prefs, setPrefs] = useState(() => readStorage(STORAGE.prefs, { gentle: true, reminders: false }));
  const [saved, setSaved] = useState<string[]>(() => readStorage(STORAGE.sparks, ['Why is the sky blue?', 'A field guide to ordinary things']));
  useEffect(() => { if (!session) setLocation('/login'); }, [session, setLocation]);
  useEffect(() => { saveStorage(STORAGE.sparks, saved); }, [saved]);
  if (!session) return <PageFrame><main className="mx-auto max-w-2xl px-5 py-24 text-center"><div className="mx-auto h-8 w-8 animate-pulse bg-[#c9f22d]" /></main></PageFrame>;
  const updatePref = (key: 'gentle' | 'reminders') => { const next = { ...prefs, [key]: !prefs[key] }; setPrefs(next); saveStorage(STORAGE.prefs, next); };
  const clearSparks = () => { setSaved([]); saveStorage(STORAGE.sparks, []); };
  const signOut = () => { localStorage.removeItem(STORAGE.session); setSession(null); setLocation('/'); };
  return <PageFrame><main className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-20"><div className="flex flex-col justify-between gap-8 border-b border-[#c9c1c9] pb-10 md:flex-row md:items-end"><div><p className="mono text-[#777091]">Your LUNIKO space</p><h1 className="display mt-5 text-5xl md:text-7xl">Welcome, {session.name}.</h1><p className="mt-4 text-[#615b70]">A few things worth picking up again.</p></div><button onClick={signOut} className="inline-flex items-center gap-2 self-start text-sm text-[#615b70] hover:text-[#292641]" data-testid="button-sign-out"><ExternalLink className="h-4 w-4 rotate-180" /> Sign out</button></div><div className="mt-10 grid gap-5 md:grid-cols-[1.2fr_.8fr]"><section className="border border-[#81798e] bg-[#e6deee] p-6 md:p-8"><div className="flex items-center justify-between"><p className="mono text-[#777091]">Recent sessions</p><MessageCircle className="h-4 w-4" /></div><div className="mt-8 space-y-0">{[['Today', 'The question behind a question', '7 min'], ['Yesterday', 'Inventing a creature with transparent ears', '12 min'], ['Last week', 'A tiny field guide', '9 min']].map(([date, title, duration], index) => <Link href="/demo" key={title} className="group flex items-center justify-between border-t border-[#b9afc0] py-5" data-testid={`row-session-${index}`}><div><p className="text-xs text-[#777091]">{date}</p><p className="mt-1 font-semibold">{title}</p></div><span className="flex items-center gap-3 text-xs text-[#777091]">{duration}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></Link>)}</div><Button href="/demo" variant="dark" className="mt-4 w-full"><Plus className="h-4 w-4" /> Start a new spark</Button></section><section className="border border-[#81798e] bg-[#f0c8ad] p-6 md:p-8"><div className="flex items-center justify-between"><p className="mono">Saved sparks</p><Star className="h-4 w-4" /></div><div className="mt-8 space-y-4">{saved.length ? saved.map((item, index) => <button onClick={() => setLocation('/demo')} className="group flex w-full items-center justify-between border-b border-[#c29982] pb-4 text-left text-sm" key={item} data-testid={`button-saved-spark-${index}`}><span>{item}</span><ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button>) : <p className="text-sm text-[#615b70]" data-testid="empty-saved-sparks">No saved sparks yet. The good ones will find their way here.</p>}</div><button onClick={() => setSaved([])} className="mt-7 text-xs font-semibold underline underline-offset-4" data-testid="button-clear-sparks">Clear saved sparks</button></section></div><div className="mt-5 grid gap-5 md:grid-cols-3"><section className="border border-[#81798e] p-6"><p className="mono text-[#777091]">Profile</p><div className="mt-6 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center bg-[#292641] text-[#c9f22d]"><UserRound className="h-5 w-5" /></span><div><p className="font-semibold" data-testid="text-profile-name">{session.name}</p><p className="text-xs text-[#777091]">{session.email || 'Wallet space'}</p></div></div><Link href="/cookies" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold" data-testid="link-dashboard-privacy">Storage controls <ArrowUpRight className="h-4 w-4" /></Link></section><section className="border border-[#81798e] p-6"><p className="mono text-[#777091]">Preferences</p><div className="mt-5 space-y-4 text-sm"><label className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Moon className="h-4 w-4" /> Gentle prompts</span><input type="checkbox" checked={prefs.gentle} onChange={() => updatePref('gentle')} className="h-5 w-5 accent-[#292641]" data-testid="checkbox-gentle-prompts" /></label><label className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> Return reminders</span><input type="checkbox" checked={prefs.reminders} onChange={() => updatePref('reminders')} className="h-5 w-5 accent-[#292641]" data-testid="checkbox-return-reminders" /></label></div></section><section className="border border-[#81798e] p-6"><p className="mono text-[#777091]">Wallet status</p>{account?.wallet ? <div className="mt-6"><div className="flex items-center gap-2 text-sm font-semibold text-[#687b28]"><Check className="h-4 w-4" /> {account.wallet.kind} connected</div><p className="mt-3 break-all font-mono text-xs text-[#777091]">{account.wallet.address}</p></div> : <div className="mt-6"><p className="text-sm leading-6 text-[#615b70]">No wallet connected. Email demo auth is available whenever you need it.</p><Link href="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" data-testid="link-connect-wallet">Manage connection <ArrowUpRight className="h-4 w-4" /></Link></div>}</section></div></main></PageFrame>;
}

function NotFound() {
  return <PageFrame><main className="mx-auto max-w-[900px] px-5 py-24 md:px-8 md:py-36"><p className="mono text-[#777091]">404 / off the map</p><h1 className="display mt-6 text-7xl leading-[.85] md:text-[10rem]">Not here.<br /><span className="text-[#777091]">Yet.</span></h1><p className="mt-9 max-w-md leading-7 text-[#615b70]">This path did not lead to a LUNIKO room. Let’s find a better question.</p><Button href="/" variant="dark" className="mt-8">Back to the beginning <HomeIcon className="h-4 w-4" /></Button></main></PageFrame>;
}

function AppRouter() {
  return <Switch><Route path="/" component={Home} /><Route path="/demo" component={Demo} /><Route path="/about" component={About} /><Route path="/how-to" component={HowTo} /><Route path="/cookies" component={Cookies} /><Route path="/roadmap" component={Roadmap} /><Route path="/brand" component={Brand} /><Route path="/login" component={Login} /><Route path="/dashboard" component={Dashboard} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><AppRouter /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;