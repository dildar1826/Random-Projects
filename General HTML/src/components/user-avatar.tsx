type UserAvatarProps = {
  username: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-xl",
};

export function UserAvatar({ username, size = "md" }: UserAvatarProps) {
  const initial = username?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[var(--accent-soft)] text-white font-semibold ${sizeMap[size]}`}
    >
      {initial}
    </div>
  );
}

