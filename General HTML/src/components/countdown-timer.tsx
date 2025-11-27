import { useEffect, useState } from "react";

type CountdownTimerProps = {
  target: string;
};

const formatTime = (ms: number) => {
  if (ms <= 0) {
    return "00h 00m 00s";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}h ${minutes}m ${seconds}s`;
};

export function CountdownTimer({ target }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => {
    const diff = new Date(target).getTime() - Date.now();
    return Math.max(diff, 0);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(new Date(target).getTime() - Date.now(), 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="font-mono text-sm text-[var(--text-secondary)]">
      {formatTime(remaining)}
    </span>
  );
}

