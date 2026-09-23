import { BarChart3, FileText, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, text: 'AI skill-match scoring for every job' },
  { icon: FileText, text: 'ATS-friendly resume & cover letter in seconds' },
  { icon: BarChart3, text: 'Kanban board and analytics for your search' },
];

export default function AuthLayout({ children }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 top-10 size-72 animate-blob rounded-full bg-fuchsia-400/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-10 bottom-10 size-80 animate-blob rounded-full bg-sky-400/30 blur-3xl [animation-delay:-6s]" aria-hidden="true" />
        <div className="relative animate-fade-up">
          <span className="text-2xl font-bold tracking-tight">Hireflow</span>
        </div>
        <div className="relative space-y-8">
          <h2 className="animate-fade-up text-4xl font-bold leading-tight [animation-delay:100ms]">
            Land the job with
            <br />
            an AI-powered edge.
          </h2>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <li
                key={text}
                className="flex animate-fade-up items-center gap-3 text-white/90"
                style={{ animationDelay: `${250 + i * 120}ms` }}
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">Analyze · Tailor · Track</p>
      </section>

      <section className="bg-mesh flex items-center justify-center p-4">
        <div className="glass w-full max-w-sm animate-fade-up rounded-3xl border p-7 shadow-xl shadow-indigo-500/10">
          <h1 className="gradient-text mb-1 text-center text-3xl font-bold tracking-tight lg:hidden">Hireflow</h1>
          {children}
        </div>
      </section>
    </main>
  );
}
