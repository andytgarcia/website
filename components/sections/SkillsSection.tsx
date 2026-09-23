import { Reveal } from "@/components/Reveal";

const skillGroups = [
  {
    category: "Languages",
    skills: ["Python", "Java", "C#", "C++","TypeScript", "JavaScript"],
  },
  {
    category: "Frontend",
    skills: ["React", "Next.js", "HTML/CSS", "Tailwind", "Three.js", "Satellite.js"],
  },
  {
    category: "Backend",
    skills: ["Node.js", "FastAPI", "REST", "MySQL", "MongoDB"],
  },
  {
    category: "Infrastructure",
    skills: ["Docker", "Kubernetes", "CI/CD", "Linux", "Kafka", "Artifactory", "Apache NiFi", "Bamboo", "Bitbucket"],
  },
  {
    category: "AI/ML",
    skills: ["PyTorch", "Pandas", "OpenCV", "Scikit-learn", "CrewAI", "LangChain", "LangGraph", "Ollama", "vLLM"],
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="section">
      <Reveal>
        <p className="section-label">{"// Skills"}</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Tech Stack
        </h2>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillGroups.map((group, i) => (
          <Reveal key={group.category} className="h-full" delay={i * 80}>
          <div className="panel h-full">
            <h3 className="font-[family-name:var(--font-mono)] text-xs tracking-[0.15em] uppercase text-[var(--color-accent-cool)] mb-4">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="font-[family-name:var(--font-mono)] text-xs tracking-wider px-3 py-1.5 rounded bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-accent-cool)] hover:border-[var(--color-accent-cool)]/30 transition-all duration-200 cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
