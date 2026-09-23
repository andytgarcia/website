import { NowPlayingWidget } from "@/components/NowPlayingWidget";
import { Reveal } from "@/components/Reveal";

export function InterestsSection() {
  const interests = [
    {
      emoji: "🏒",
      title: "Ice Hockey",
      description:
        "Lifelong Los Angeles Kings fan. Played hockey for OCHC, Damien High School, and UC San Diego.",
    },
    {
      emoji: "🍔",
      title: "Foodie",
      description:
        "I love trying new restaurants and cuisines. Some of my favorite foods include sushi, ramen, burgers, and anything Mexican.",
    },
    {
      emoji: "🎮",
      title: "Gaming",
      description:"Marvel Rivals, Cyberpunk 2077, League of Legends, Minecraft, Star Wars Battlefront II, Pokemon, Persona",
    },
    {
      emoji: "🎵",
      title: "Music",
      description:
        "Starset, Linkin Park, Bring Me The Horizon, Jon Bellion",
    },
  ];

  return (
    <section id="interests" className="section">
      <Reveal>
        <p className="section-label">{"// Interests"}</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Off-Duty
        </h2>
      </Reveal>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {interests.map((item, i) => (
          <Reveal key={item.title} delay={i * 80}>
          <div
            className="panel flex gap-4 items-start"
          >
            <span className="text-2xl shrink-0">{item.emoji}</span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed m-0">
                {item.description}
              </p>
            </div>
          </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <NowPlayingWidget />
      </Reveal>
    </section>
  );
}
