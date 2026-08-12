import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleDot,
  Compass,
  Mail,
  Menu,
  MoveRight,
  Orbit,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  Link,
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

const navItems = [
  { label: 'Try the companion', href: '/demo' },
  { label: 'Studio', href: '/about' },
  { label: 'How it works', href: '/how-to' },
  { label: 'Roadmap', href: '/roadmap' },
];

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`${visible ? 'reveal' : ''} ${className}`}>{children}</div>;
}

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Luniko home">
      <span className="logo-mark" aria-hidden="true" />
      <span>LUNIKO</span>
    </Link>
  );
}

function Header({ dark = false }: { dark?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={`topbar ${dark ? 'demo-header' : ''}`}>
      <div className="container nav">
        <Logo />
        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <Link href="/login" className="nav-cta">Enter space <ArrowUpRight size={14} /></Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)}>Enter space <ArrowUpRight size={14} /></Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Logo />
            <p className="footer-note">A little more room for the questions that matter.</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/demo">Try the companion</Link>
            <Link href="/about">Studio</Link>
            <Link href="/how-to">How it works</Link>
            <Link href="/roadmap">Roadmap</Link>
            <Link href="/login">Enter space</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>Made for wonder, with care</span>
          <span>© 2025 Luniko Studio</span>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow reveal">A creative companion for growing minds</p>
              <h1 className="reveal reveal-delay-1">Wonder<br /><em>has room</em><br />here.</h1>
              <p className="hero-copy reveal reveal-delay-2">
                Luniko helps young learners follow a question, find a new angle, and make something of it — with a trusted adult close by.
              </p>
              <div className="hero-actions reveal reveal-delay-3">
                <Link href="/demo" className="button-lime">Start with a spark <ArrowRight size={16} /></Link>
                <a href="#principles" className="text-link">Take a look <ChevronDown size={14} /></a>
              </div>
            </div>
            <div className="hero-art reveal reveal-delay-2" aria-label="A question card orbiting in space">
              <div className="orbit" aria-hidden="true" />
              <div className="orbit two" aria-hidden="true" />
              <div className="spark-card">
                <div className="card-top"><span>Today&apos;s spark</span><Sparkles size={18} /></div>
                <h3>What if the quietest thing in the room had a story?</h3>
                <div className="spark-line" />
                <div className="spark-line" />
                <div className="spark-line" style={{ width: '63%' }} />
              </div>
              <span className="side-note">Follow the question · 01</span>
            </div>
          </div>
          <div className="scroll-cue">Scroll gently</div>
        </section>

        <section className="section ink-section" id="principles">
          <div className="container">
            <Reveal>
              <div className="philosophy">
                <div>
                  <p className="eyebrow">A different kind of tool</p>
                </div>
                <div>
                  <h2>Not a shortcut<br />to the <em>answer.</em></h2>
                  <div className="philosophy-copy">
                    <p>A place to practice finding your own. Luniko is designed for the lovely, unruly middle between “I don’t know” and “I figured it out.”</p>
                    <p className="muted">No hurry. No score. Just a question with enough space around it to become yours.</p>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="principles">
                <article className="principle">
                  <span className="principle-number">01 / NOTICE</span>
                  <h3>Start with a spark.</h3>
                  <p>A small prompt opens the door. The learner decides where to go next.</p>
                </article>
                <article className="principle">
                  <span className="principle-number">02 / WANDER</span>
                  <h3>Curiosity is a practice.</h3>
                  <p>Try a lens, make a connection, sit with the odd bit. There is no wrong turn.</p>
                </article>
                <article className="principle">
                  <span className="principle-number">03 / MAKE</span>
                  <h3>Leave a trace.</h3>
                  <p>A note, a sketch, a theory, a question to bring to the table later.</p>
                </article>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section curiosity" id="curiosity">
          <div className="container curiosity-grid">
            <Reveal>
              <p className="eyebrow">For the curious, not the certain</p>
              <h2 className="section-title">There is more<br />than one way<br /><em className="serif">in.</em></h2>
              <div className="question-stack" aria-label="Example questions">
                <span className="question-pill">Why do shadows stretch?</span>
                <span className="question-pill">Where does a story begin?</span>
                <span className="question-pill">Can a map be a feeling?</span>
              </div>
            </Reveal>
            <Reveal className="reveal-delay-2">
              <div className="note-visual">
                <div className="orbit-dot" aria-hidden="true" />
                <span className="eyebrow">A note to keep</span>
                <h3>“I think the moon is just practicing being a sun.”</h3>
                <p>Not every thought needs to become a finished thing. Some are happy as evidence that you were looking closely.</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section compact ink-section">
          <div className="container demo-invite">
            <Reveal>
              <p className="eyebrow">A small beginning</p>
              <h2 className="section-title">What will you<br /><em>notice</em> today?</h2>
            </Reveal>
            <Reveal className="reveal-delay-2">
              <div>
                <p className="demo-invite-copy">Step into a tiny version of the companion. Pick a spark, follow an angle, and see where your thinking takes you.</p>
                <div className="invite-actions">
                  <Link href="/demo" className="button-lime">Try a spark <Play size={14} fill="currentColor" /></Link>
                  <Link href="/how-to" className="button-outline">How it works <ArrowRight size={14} /></Link>
                </div>
              </div>
            </Reveal>
            <div className="demo-seal" aria-hidden="true"><Orbit size={22} /><span>Made for open-ended thinking</span></div>
          </div>
        </section>

        <section className="section roadmap-preview" id="roadmap-preview">
          <div className="container">
            <Reveal>
              <div className="roadmap-header">
                <div>
                  <p className="eyebrow">A living little studio</p>
                  <h2 className="section-title">Built slowly.<br /><em className="serif">Built together.</em></h2>
                </div>
                <Link href="/roadmap" className="roadmap-link">See the roadmap <ArrowUpRight size={14} /></Link>
              </div>
            </Reveal>
            <Reveal>
              <div className="roadmap-list">
                <article className="roadmap-item"><span className="status">Now / Listening</span><h3>Daily sparks</h3><p>Small invitations, tuned with families and classrooms.</p></article>
                <article className="roadmap-item"><span className="status">Next / Making</span><h3>Shared tables</h3><p>A calmer way to bring a thought into conversation.</p></article>
                <article className="roadmap-item"><span className="status">Soon / Exploring</span><h3>Many lenses</h3><p>New ways to look at a question without narrowing it.</p></article>
                <article className="roadmap-item"><span className="status">Later / Wondering</span><h3>Your own space</h3><p>A personal constellation of questions and traces.</p></article>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const prompts = [
  { title: 'What makes a place feel like home?', kind: 'LOOK CLOSER', lens: 'Notice what is usually overlooked' },
  { title: 'Where does a story begin?', kind: 'TURN IT AROUND', lens: 'Start somewhere unexpected' },
  { title: 'Can a map be a feeling?', kind: 'MAKE A CONNECTION', lens: 'Join two unlike things' },
];

const promptStages = [
  ['Choose a spark that tugs at you.', 'There is no best choice here.'],
  ['Stay with it for a moment.', 'What part feels most interesting, strange, or alive?'],
  ['Try a different angle.', 'Imagine the question belongs to someone very different from you.'],
  ['Leave a little trace.', 'A sentence, a sketch, a sound, a new question — all count.'],
];

function Demo() {
  const [selected, setSelected] = useState(0);
  const [stage, setStage] = useState(0);
  const selectedPrompt = prompts[selected];
  const isFinished = stage === promptStages.length - 1;

  const reset = () => {
    setSelected(0);
    setStage(0);
  };

  return (
    <div className="demo-page">
      <Header dark />
      <main className="container demo-wrap">
        <div className="demo-heading">
          <p className="eyebrow">Try the companion</p>
          <h1>Start with<br /><em>a spark.</em></h1>
          <p>A tiny guided moment for the big questions. Choose what catches, then take one small step at a time.</p>
        </div>
        <div className="demo-board">
          <section className="prompt-picker" aria-labelledby="prompt-title">
            <span className="eyebrow">01 / Pick a question</span>
            <h2 id="prompt-title">What has your attention?</h2>
            <div className="prompt-options">
              {prompts.map((prompt, index) => (
                <button
                  type="button"
                  className={`prompt-option ${selected === index ? 'selected' : ''}`}
                  key={prompt.title}
                  onClick={() => { setSelected(index); setStage(0); }}
                >
                  <span>{prompt.title}</span><span>{prompt.kind}</span>
                </button>
              ))}
            </div>
            <p className="demo-footer-note"><CircleDot size={14} /> Follow your attention, not a lesson plan.</p>
          </section>
          <section className="response-panel" aria-live="polite">
            <div>
              <span className="prompt-label">Spark / {selected + 1} · Step {stage + 1} of {promptStages.length}</span>
              <h2>{stage === 0 ? selectedPrompt.title : promptStages[stage][0]}</h2>
              <p>{stage === 0 ? selectedPrompt.lens : promptStages[stage][1]}</p>
            </div>
            <div>
              <div className="response-actions">
                <button type="button" className="button-ink" onClick={() => setStage((current) => isFinished ? current : current + 1)}>
                  {isFinished ? <><Check size={15} /> Spark complete</> : <>Take the next step <MoveRight size={15} /></>}
                </button>
                <button type="button" className="reset-button" onClick={reset}><RotateCcw size={14} /> Start again</button>
              </div>
              {isFinished && <p className="demo-footer-note" style={{ color: '#4d4a59' }}><Sparkles size={14} /> Keep the trace. Bring it to someone you trust.</p>}
            </div>
          </section>
        </div>
        <Link href="/" className="text-link" style={{ color: 'var(--paper)', borderColor: 'rgba(244,236,218,.4)', marginTop: '34px' }}>Back to Luniko <ArrowRight size={14} /></Link>
      </main>
    </div>
  );
}

function About() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="container subpage-hero">
          <p className="eyebrow">The studio behind Luniko</p>
          <h1>A little more<br /><em>room</em> to grow.</h1>
          <p>We are making tools that treat wondering as valuable in its own right — not just the fastest route to a correct answer.</p>
        </section>
        <section className="container subpage-body">
          <div className="story-grid">
            <article className="story-card"><BookOpen size={20} /><h2>For the middle.</h2><p>The sketchy, half-formed, not-quite-sure place where original thinking actually happens.</p></article>
            <article className="story-card"><Users size={20} /><h2>Close by, never over.</h2><p>Luniko gives adults a warm way to be present without taking the question away.</p></article>
            <article className="story-card"><Compass size={20} /><h2>Made for real curiosity.</h2><p>Gentle structure, open edges, and a visual language that leaves room for each mind to make it theirs.</p></article>
            <article className="story-card"><Sparkles size={20} /><h2>Still becoming.</h2><p>Luniko is a living studio. We listen, test, rethink, and keep the door open.</p></article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function HowTo() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="container subpage-hero">
          <p className="eyebrow">How it works</p>
          <h1>Follow the<br /><em>good question.</em></h1>
          <p>Luniko is a gentle rhythm, not a curriculum. It gives curiosity just enough shape to keep moving.</p>
        </section>
        <section className="container subpage-body">
          <div className="how-grid">
            <article className="how-step"><h2>Notice</h2><p>Begin with a spark: a question, an image, a moment that does not quite let go. The companion helps you name what has your attention.</p></article>
            <article className="how-step"><h2>Wander</h2><p>Try a lens. Look closer, turn it around, make an unlikely connection. The point is not to arrive quickly, but to see more.</p></article>
            <article className="how-step"><h2>Make</h2><p>Leave a trace of the thinking. A few words, a sketch, a voice note, or the question you want to carry into dinner.</p></article>
          </div>
          <div className="section compact ink-section" style={{ marginTop: '100px', padding: '60px 52px' }}>
            <p className="eyebrow">The adult role</p>
            <h2 className="section-title">Be the<br /><em>nearby wonderer.</em></h2>
            <p className="muted" style={{ maxWidth: '440px', lineHeight: 1.6, marginTop: '25px' }}>You do not need to know the answer. Ask what they notice. Tell them what you are wondering. Make room for the thought to surprise both of you.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Roadmap() {
  const rows = [
    ['Now', 'Daily sparks', 'A growing collection of small, open-ended invitations.', 'Listening'],
    ['Next', 'Shared tables', 'A calmer way to bring a trace into conversation with someone close.', 'Making'],
    ['Soon', 'Many lenses', 'More ways to turn a question and discover an angle of your own.', 'Exploring'],
    ['Later', 'Your own space', 'A personal constellation for the questions you keep returning to.', 'Wondering'],
  ];
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="container subpage-hero">
          <p className="eyebrow">The roadmap</p>
          <h1>Built slowly.<br /><em>Built together.</em></h1>
          <p>Luniko is a work in progress by design. Here is what we are listening for, making next, and leaving space to discover.</p>
        </section>
        <section className="container subpage-body">
          <div className="roadmap-full">
            <div><h2>A direction,<br />not a promise.</h2><p className="muted" style={{ lineHeight: 1.6, maxWidth: '280px' }}>The best version of Luniko will be shaped with the families, teachers, and young thinkers who use it.</p></div>
            <div className="timeline">
              {rows.map((row) => <article className="timeline-row" key={row[1]}><span className="quarter">{row[0]}</span><div><h3>{row[1]}</h3><p>{row[2]}</p></div><span className="tag">{row[3]}</span></article>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(`Thanks${name ? `, ${name}` : ''}. We will keep a space open for ${email}.`);
  };
  return (
    <div className="login-page site-shell">
      <aside className="login-aside">
        <Logo />
        <div className="login-quote"><h1>Come in,<br /><em>there is room.</em></h1><p>Luniko spaces are opening gradually. Leave your details and we will send a thoughtful note when it is your turn.</p></div>
        <small>For growing minds and the people beside them</small>
      </aside>
      <main className="login-form-wrap">
        <div className="login-form">
          <span className="eyebrow">Enter space</span>
          <h2>Keep in touch.</h2>
          <p>No passwords to remember yet. Just a gentle signal that you would like to hear what is taking shape.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-field"><label htmlFor="name">Your name</label><input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="A name we can use" /></div>
            <div className="form-field"><label htmlFor="email">Email address</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
            <button className="login-submit" type="submit"><Mail size={15} /> Leave a note</button>
          </form>
          {message && <div className="login-message" role="status"><Check size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />{message}</div>}
          <Link href="/" className="back-home"><ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Return home</Link>
        </div>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="site-shell not-found">
      <div><span className="eyebrow">A little off course</span><h1>404</h1><p>This page wandered somewhere interesting.</p><Link href="/" className="button-lime">Return to Luniko <ArrowRight size={15} /></Link></div>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/demo" component={Demo} />
        <Route path="/about" component={About} />
        <Route path="/how-to" component={HowTo} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;