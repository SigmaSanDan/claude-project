import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Dashboard",
  description: "Översikt över ärenden per utvecklare",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f5f5f5" }}>
        {children}
      </body>
    </html>
  );
}
