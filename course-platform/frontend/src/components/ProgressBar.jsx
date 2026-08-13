export default function ProgressBar({ percent }) {
  return (
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      <span className="progress-bar-label">{percent}%</span>
    </div>
  );
}
