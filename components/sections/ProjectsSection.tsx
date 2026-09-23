import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";

const flagshipProjects = [
  {
    title: "Neptune",
    description:
      "Contributing to the development of an unmanned surface vehicle in collaboration with the Scripps Institute of Oceanography for the purpose of research",
    tags: ["C++", "ROS2", "Docker", "Raspberry Pi", "PyBullet", "Git", "Websockets"],
    githubUrl: "https://github.com/Yonder-Deep/Neptune",
  },
  {
    title: "Autonomous Urban Route Awareness",
    description:
      "Developed an autonomous “Smart Service Dog” using Raspberry Pi and computer vision to guide visually impaired users through real-time obstacle detection, PD-based navigation, and instant audio feedback, winning Best Hardware at CitrusHack 2025.",
    tags: ["Python", "Raspberry Pi", "PyTorch", "OpenCV"],
    githubUrl: "https://github.com/jnalbert/Citrus_Hack_2025",
  },
  {
    title: "PeerFund",
    description:
      "Built a blockchain-based student lending platform on the XRP Ledger with dynamic interest rates, on-chain escrow, and automated loan matching, earning 2nd place in the XRPL track at CalHacks 12.0.",
    tags: ["TypeScript", "XRPL", "Firebase", "TailwindCSS"],
    githubUrl: "https://github.com/jnalbert/CalHacks2025",
  },
];

const otherProjects = [
  { title: "Gesture Authentication System", tags: ["Python", "Google Mediapipe", "NVIDIA Jetson Nano"] },
  { title: "Network-Scanner", tags: ["Python", "Scapy"] },
  { title: "R'Hunt", tags: ["TypeScript", "Firebase"] },
];

export function ProjectsSection() {
  return (
    <section id="projects" className="section">
      <Reveal>
        <p className="section-label">{"// Projects"}</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Mission Payloads
        </h2>
      </Reveal>

      {/* Flagship projects grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {flagshipProjects.map((project, i) => (
          <Reveal key={project.title} className="h-full" delay={i * 90}>
            <ProjectCard {...project} />
          </Reveal>
        ))}
      </div>

      {/* Compact list for other projects */}
      <Reveal delay={120}>
      <div className="panel">
        <h3 className="font-[family-name:var(--font-mono)] text-xs tracking-[0.15em] uppercase text-[var(--color-accent-cool)] mb-4">
          Other Deployments
        </h3>
        <ul className="list-none m-0 p-0 divide-y divide-[var(--color-border)]">
          {otherProjects.map((project) => (
            <li
              key={project.title}
              className="flex items-center justify-between py-3 gap-4"
            >
              <span className="text-sm text-[var(--color-text-primary)]">
                {project.title}
              </span>
              <div className="flex gap-2 shrink-0">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-[family-name:var(--font-mono)] text-[0.625rem] tracking-wider uppercase px-2 py-0.5 rounded bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      </Reveal>
    </section>
  );
}
