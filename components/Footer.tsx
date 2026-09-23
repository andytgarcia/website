import { SatelliteMark } from "./SatelliteMark";

const footerLinks = [
  { label: "GitHub", href: "https://github.com/andytgarcia", icon: "↗" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/andrew-garcia-88b125287", icon: "↗" },
  { label: "Email", href: "mailto:andytgarcia27@gmail.com", icon: "✉" },
];

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative z-[2] border-t border-[var(--color-border)] bg-[rgba(5,8,20,0.55)] backdrop-blur-xl"
    >
      <div className="section py-12!">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left — branding */}
          <div className="text-center md:text-left">
            <div className="mb-1 flex justify-center md:justify-start">
              <SatelliteMark size="small" label="Satellite emblem" />
            </div>
            <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-secondary)] tracking-wider">
              SIGNAL_STATUS: NOMINAL
              <span className="ml-1 inline-block w-1.5 h-3 align-[-2px] bg-[var(--color-accent-cool)] animate-pulse" />
            </p>
          </div>

          {/* Center — links */}
          <ul className="flex items-center gap-6 list-none m-0 p-0">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="font-[family-name:var(--font-mono)] text-xs tracking-widest uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cool)] transition-colors duration-200 no-underline flex items-center gap-1"
                >
                  {link.label}
                  <span className="text-[0.6rem] opacity-60">{link.icon}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Right — copyright */}
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-secondary)] tracking-wider">
            © {new Date().getFullYear()} — ALL SYSTEMS GO
          </p>
        </div>
      </div>
    </footer>
  );
}
