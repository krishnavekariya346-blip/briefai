import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="app-mesh-bg min-h-screen">
      <nav className="glass-nav sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <Logo to="/" />
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <header className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center lg:pt-28">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-600/10 px-4 py-1.5 text-sm font-medium text-brand-300">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          AI-powered proposals in minutes
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl md:leading-[1.1]">
          Turn client briefs into{' '}
          <span className="bg-gradient-to-r from-brand-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
            winning proposals
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          BriefAI helps freelancers and agencies generate professional proposals with AI—share
          public links and collect deposits with Stripe.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register" className="btn-primary px-8 py-3 text-base">
            Start free — 3 proposals/mo
          </Link>
          <a href="#pricing" className="btn-secondary px-8 py-3 text-base">
            View pricing
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-brand-400">
          How it works
        </p>
        <h2 className="mb-14 text-center text-3xl font-bold text-white">Three steps to get paid</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Fill the brief',
              desc: 'Capture client goals, budget, timeline, and deliverables in one structured form.',
            },
            {
              step: '02',
              title: 'Generate with AI',
              desc: 'Get scope, timeline, pricing breakdown, and next steps—ready to send.',
            },
            {
              step: '03',
              title: 'Send & get paid',
              desc: 'Share a public proposal link and optional Stripe deposit link for Pro users.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="card group text-center transition hover:border-brand-500/30 hover:shadow-brand-500/5"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600/15 text-lg font-bold text-brand-400">
                {item.step}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-4xl px-4 py-20">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-brand-400">
          Pricing
        </p>
        <h2 className="mb-14 text-center text-3xl font-bold text-white">Simple, transparent plans</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-white">Free</h3>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              $0<span className="text-lg font-normal text-slate-500">/mo</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> 3 AI proposals per month
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Public proposal links
              </li>
              <li className="flex gap-2 text-slate-600">
                <span>—</span> Enhanced AI detail
              </li>
              <li className="flex gap-2 text-slate-600">
                <span>—</span> Custom branding on client links
              </li>
            </ul>
            <Link to="/register" className="btn-secondary mt-8 block w-full py-3 text-center">
              Get started
            </Link>
          </div>
          <div className="card relative border-brand-500/40 ring-1 ring-brand-500/25">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-semibold text-white">
              Popular
            </span>
            <h3 className="text-lg font-semibold text-brand-300">Pro</h3>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              $15<span className="text-lg font-normal text-slate-500">/mo</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Unlimited proposals
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Stripe payment links
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Enhanced AI proposals
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Your logo on client links
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Email alerts & client delivery
              </li>
            </ul>
            <Link to="/register" className="btn-primary mt-8 block w-full py-3 text-center">
              Start Pro
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} BriefAI · MERN · TypeScript · AI · Stripe
      </footer>
    </div>
  );
}
