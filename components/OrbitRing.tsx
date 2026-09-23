export function OrbitRing() {
  return (
    <div className="orbit-wrap" aria-hidden>
      <svg className="orbit-svg" viewBox="0 0 640 360" fill="none">
        <ellipse
          className="orbit-path"
          cx="320"
          cy="180"
          rx="280"
          ry="92"
        />
        <ellipse
          className="orbit-path orbit-path-inner"
          cx="320"
          cy="180"
          rx="170"
          ry="48"
        />
        <circle className="orbit-body" cx="320" cy="180" r="7" />
        <circle className="orbit-sat" r="3.5" />
      </svg>
    </div>
  );
}
