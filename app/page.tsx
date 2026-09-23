import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { InterestsSection } from "@/components/sections/InterestsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <hr className="section-divider" />
      <AboutSection />
      <hr className="section-divider" />
      <ExperienceSection />
      <hr className="section-divider" />
      <ProjectsSection />
      <hr className="section-divider" />
      <SkillsSection />
      <hr className="section-divider" />
      <InterestsSection />
    </>
  );
}
