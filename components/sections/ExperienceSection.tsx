import { TimelineEntry } from "@/components/TimelineEntry";
import { Reveal } from "@/components/Reveal";

const entries = [
  {
    role: "Software Developer Intern (Summer Games)",
    company: "Booz Allen Hamilton",
    dates: "Summer 2026",
    bullets: [
      "Designed and built the AI multi-agent pipeline at the core of a satellite mission-planning platform, using Python and CrewAI to turn natural-language requests into validated mission plans",
      "Delivered production reliability improvements by migrating the LLM backend to a remote vLLM server with automatic local (Ollama) fallback and per-agent timeout/retry limits, eliminating the context-overflow hangs and out-of-memory crashes while improving speed and accuracy by 400%",
      "Shipped full-stack features end-to-end on a 5-person team, spanning React UI, FastAPI endpoints, and MySQL persistence.",
    ],
  },
  {
    role: "Software Team Co-lead",
    company: "Yonder Deep Student Organization",
    dates: "January 2026 - Present",
    bullets: [
      "Led software development for an autonomous underwater vehicle, managing architecture decisions and coordinating contributions across 6 team members; migrated code to C++ from Python.",
      "Assisted in engineering a Dockerized Pybullet simulation environment for software-in-the-loop testing, eliminating hardware dependency during early development cycles and resulting in 50% increase in testing capabilities.",
      "Engineered a C++ motor control stack using Boost.Asio and Boost.Beast, enabling real-time WebSocket-based command dispatch to a 4-motor drive system on a Raspberry Pi 5, achieving 20% improvement in motor response time."
    ],
  },
  {
    role: "Student Build and Release Engineer",
    company: "UC San Diego Information Technology Services",
    dates: "June 2025 - Present",
    bullets: [
      "Supported the Build and Release Services team in software configuration, packaging, and deployment workflows using technologies including Apache NiFi, Kafka, Amazon EKS, and Artifactory",
      "Maintained and monitored CI/CD pipelines using Bamboo and Bitbucket, ensuring reliable build and release cycles for enterprise applications across 25+ domains",
      "Assisted in deploying Java/Maven and .NET services to cloud infrastructure, contributing to a smooth and repeatable release process",
    ],
  },
  {
    role: "Full Stack Software Developer Intern",
    company: "Vaccine Genie",
    dates: "Summer 2025",
    bullets: [
      "Developed responsive front-end user interfaces using React.js to enhance user experience and application functionality",
      "Built secure user authentication and login systems, ensuring robust access control and data protection for the platform",
      "Implemented backend database connectivity with integration from MongoDB and Google Cloud Platform for scalable cloud infrastructure",
      "Contributed to full-stack development in a fast-paced early stage startup environment, gaining experience in rapid prototyping and iterative product development",
      "Participated in agile development processes through weekly sprint planning, stand-ups, and retrospectives to deliver features on schedule",
    ],
  },
  {
    role: "Information Technology Intern",
    company: "UC Riverside College of Humanities, Arts, and Social Sciences",
    dates: "August 2024 - August 2025",
    bullets: [
      "Spearheaded troubleshooting for diverse IT infrastructure, resolving issues for 100+ laptops, PCs, printers, servers, and workstations",
      "Orchestrated seamless setup and configuration of 50+ workstations for staff and faculty, enhancing productivity and user satisfaction.",
      "Mastered a wide spectrum of modern and legacy technologies, including operating systems, networks, and computer hardware, expanding technical proficiency across 10+ platforms.",
      "Engineered custom Java scripts utilizing Apache POI for Microsoft product automation, slashing departmental task completion time by 50% and eliminating data entry errors.",
    ],
  }
];

export function ExperienceSection() {
  return (
    <section id="experience" className="section">
      <Reveal>
        <p className="section-label">{"// Experience"}</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Mission Log
        </h2>
      </Reveal>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-3 md:left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-accent-cool)]/50 via-[var(--color-border)] to-transparent" />

        <div className="space-y-12">
          {entries.map((entry, i) => (
            <Reveal key={i} delay={i * 90}>
              <TimelineEntry {...entry} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
