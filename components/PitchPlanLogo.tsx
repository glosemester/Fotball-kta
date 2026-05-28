export default function PitchPlanLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pitch background */}
      <rect x="1" y="7" width="38" height="26" rx="4" fill="#141D26" />

      {/* Pitch outline */}
      <rect x="1" y="7" width="38" height="26" rx="4" stroke="#22C55E" strokeWidth="2.2" />

      {/* Center line */}
      <line x1="20" y1="7" x2="20" y2="33" stroke="#22C55E" strokeWidth="1.6" />

      {/* Center circle */}
      <circle cx="20" cy="20" r="5.5" stroke="#22C55E" strokeWidth="1.6" />

      {/* Center dot */}
      <circle cx="20" cy="20" r="1.8" fill="#22C55E" />

      {/* Left penalty area */}
      <rect x="1" y="14" width="9" height="12" rx="1.5" stroke="#22C55E" strokeWidth="1.4" />

      {/* Right penalty area */}
      <rect x="30" y="14" width="9" height="12" rx="1.5" stroke="#22C55E" strokeWidth="1.4" />

      {/* Left goal */}
      <rect x="0" y="17" width="3" height="6" rx="1" fill="#22C55E" />

      {/* Right goal */}
      <rect x="37" y="17" width="3" height="6" rx="1" fill="#22C55E" />
    </svg>
  );
}
