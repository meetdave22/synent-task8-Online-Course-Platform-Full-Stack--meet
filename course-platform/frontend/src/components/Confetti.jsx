const COLORS = ['#1f6b4c', '#e0a530', '#b3432f', '#1c2b3a', '#4a90d9'];

export default function Confetti({ pieces = 40 }) {
  const items = Array.from({ length: pieces }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.3;
    const duration = 1.1 + Math.random() * 0.8;
    const color = COLORS[i % COLORS.length];
    const rotate = Math.random() * 360;
    return (
      <span
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          background: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          transform: `rotate(${rotate}deg)`
        }}
      />
    );
  });
  return <div className="confetti-burst">{items}</div>;
}