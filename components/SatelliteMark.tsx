import styles from "./SatelliteMark.module.css";

type SatelliteMarkProps = {
  label?: string;
  size?: "default" | "small";
};

export function SatelliteMark({
  label,
  size = "default",
}: SatelliteMarkProps) {
  return (
    <span
      className={`${styles.mark} ${size === "small" ? styles.small : ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className={styles.orbit} />
      <span className={styles.craft}>
        <span className={`${styles.panel} ${styles.panelLeft}`} />
        <span className={styles.body} />
        <span className={`${styles.panel} ${styles.panelRight}`} />
        <span className={styles.mast} />
        <span className={styles.dish} />
      </span>
    </span>
  );
}
