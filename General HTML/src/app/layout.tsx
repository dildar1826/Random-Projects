import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat Room",
  description: "Discord-inspired real-time chat experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--background-primary)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
