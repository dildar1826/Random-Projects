import { CountdownTimer } from "@/components/countdown-timer";

type ChatHeaderProps = {
  sessionExpiresAt: string;
};

export function ChatHeader({ sessionExpiresAt }: ChatHeaderProps) {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-white/5 px-6 py-4 bg-[var(--background-secondary)]">
      <div />
      <div className="text-lg font-semibold text-white tracking-wide text-center">
        Chat Room
      </div>
      <div className="flex items-center gap-2 justify-end text-sm text-[var(--text-secondary)]">
        <span className="uppercase tracking-[0.3em] text-[var(--text-secondary)] text-xs">
          Reset In
        </span>
        <CountdownTimer target={sessionExpiresAt} />
      </div>
    </header>
  );
}

