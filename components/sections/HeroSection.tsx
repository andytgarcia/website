import { OrbitRing } from "@/components/OrbitRing";

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <OrbitRing />
      <div className="hero-horizon" aria-hidden />

      <div className="section hero-stage text-center relative z-10 pt-[var(--nav-height)]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="status-ping" />
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] uppercase text-[var(--color-text-secondary)]">
            Systems Online
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
          <span className="text-[var(--color-text-primary)]">Andrew Thomas Garcia</span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
          Software developer studying computer science at the University of California, San Diego.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#projects"
            className="hero-primary-cta inline-flex items-center gap-2 px-8 py-3 rounded bg-[var(--color-accent-cool)] font-[family-name:var(--font-mono)] text-sm tracking-widest uppercase font-semibold no-underline hover:shadow-[var(--glow-cool)] hover:-translate-y-0.5 transition-all duration-300"
          >
            View Projects
          </a>
          <a
            href="/launches"
            className="inline-flex items-center gap-2 px-8 py-3 rounded border border-[var(--color-border)] text-[var(--color-text-primary)] font-[family-name:var(--font-mono)] text-sm tracking-widest uppercase no-underline hover:border-[var(--color-accent-cool)] hover:text-[var(--color-accent-cool)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Launch Dashboard
          </a>
        </div>

        <div className="scroll-cue mt-20 flex flex-col items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] text-[0.625rem] tracking-[0.3em] uppercase text-[var(--color-text-secondary)]">
            Descend
          </span>
          <span className="scroll-cue-line" />
        </div>
      </div>
    </section>
  );
}
