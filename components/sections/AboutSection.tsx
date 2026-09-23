import { Reveal } from "@/components/Reveal";

export function AboutSection() {
  return (
    <section id="about" className="section">
      <Reveal>
        <p className="section-label">{"// About"}</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          Mission Brief
        </h2>
      </Reveal>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        {/* Bio */}
        <Reveal className="space-y-4" delay={80}>
          <p className="text-[var(--color-text-secondary)] text-base md:text-lg leading-relaxed">
          I am a student studying computer science at the University of California, San Diego. 
          I have intermediate programming knowledge and areas of experience in Full Stack development, Information Technology, Cybersecurity, and Machine Learning. 
          I want to one day go into software development for space systems.


          </p>
          <p className="text-[var(--color-text-secondary)] text-base md:text-lg leading-relaxed">
          I am interested in the space industry because it is a field that is constantly evolving and growing.
          I love to tackle hard challenges and learn new things, and the space industry is a great place to do that.
          </p>
        </Reveal>

        {/* Quick-stats panel */}
        <Reveal delay={160}>
        <div className="panel">
          <h3 className="font-[family-name:var(--font-mono)] text-xs tracking-[0.15em] uppercase text-[var(--color-accent-cool)] mb-4">
            Quick Telemetry
          </h3>
          <dl className="space-y-3">
            {[
              { label: "Location", value: "Los Angeles, CA" },
              { label: "Education", value: "UC San Diego" },
              { label: "Focus", value: "Space Software" },
              { label: "Status", value: "Open to work" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-baseline gap-4">
                <dt className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {item.label}
                </dt>
                <dd className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-primary)] m-0">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
