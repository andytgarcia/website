interface TimelineEntryProps {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
}

export function TimelineEntry({
  role,
  company,
  dates,
  bullets,
}: TimelineEntryProps) {
  return (
    <div className="relative pl-10 md:pl-12">
      {/* Timeline dot */}
      <div className="timeline-node absolute left-1.5 md:left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-[var(--color-accent-cool)] bg-[#050814]" />

      {/* Date label */}
      <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.15em] uppercase text-[var(--color-accent-cool)] mb-1 block">
        {dates}
      </span>

      {/* Role & Company */}
      <h3 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] mb-0.5">
        {role}
      </h3>
      <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-secondary)] mb-3">
        {company}
      </p>

      {/* Bullets */}
      <ul className="list-none m-0 p-0 space-y-2">
        {bullets.map((bullet, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)] leading-relaxed"
          >
            <span className="text-[var(--color-accent-cool)] mt-0.5 shrink-0 text-xs">
              ▹
            </span>
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
