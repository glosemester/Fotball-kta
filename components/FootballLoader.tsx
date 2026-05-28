interface FootballLoaderProps {
  variant?: "bounce" | "dots" | "spin";
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function FootballLoader({ variant = "bounce", text, size = "md" }: FootballLoaderProps) {
  if (variant === "spin") {
    return <span className="football-spin select-none">⚽</span>;
  }

  if (variant === "dots") {
    const dotSize = size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3";
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-end gap-2">
          <span className={`${dotSize} rounded-full bg-[#22C55E] dot-1`} />
          <span className={`${dotSize} rounded-full bg-[#22C55E] dot-2`} />
          <span className={`${dotSize} rounded-full bg-[#22C55E] dot-3`} />
        </div>
        {text && <p className="text-sm text-[#94A3B8]">{text}</p>}
      </div>
    );
  }

  const emojiSize = size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl" : "text-4xl";
  const shadowW = size === "sm" ? "w-6" : size === "lg" ? "w-12" : "w-9";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`${emojiSize} football-bounce select-none`}>⚽</span>
      <span className={`${shadowW} h-1.5 rounded-full bg-[#22C55E]/30 football-shadow`} />
      {text && <p className="text-sm text-[#94A3B8] mt-2">{text}</p>}
    </div>
  );
}
