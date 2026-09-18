import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeachBack AI — Học sâu bằng cách giảng lại cho AI",
  description: "Nền tảng học tập tương tác áp dụng phương pháp Feynman với sự hỗ trợ của Generative AI và Multi-Agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className="h-full bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
