interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export function ProjectCard({
  title,
  description,
  tags,
  githubUrl,
  liveUrl,
}: ProjectCardProps) {
  return (
    <div className="panel flex flex-col h-full group hover:-translate-y-1">
      {/* Title */}
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent-cool)] transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4 flex-1">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="font-[family-name:var(--font-mono)] text-[0.625rem] tracking-wider uppercase px-2 py-0.5 rounded bg-[var(--color-bg-base)] text-[var(--color-accent-cool)] border border-[var(--color-border)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-4">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-mono)] text-xs tracking-wider uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cool)] transition-colors no-underline"
          >
            GitHub ↗
          </a>
        )}
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-mono)] text-xs tracking-wider uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cool)] transition-colors no-underline"
          >
            Live Demo ↗
          </a>
        )}
      </div>
    </div>
  );
}
