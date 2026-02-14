import "./globals.css";

export const metadata = {
  title: "Daisy — Accelerate Your Product Productivity",
  description:
    "AI made engineering 10x faster. Product management is still stuck. Daisy closes the gap — turning customer feedback into shipped features, automatically.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
