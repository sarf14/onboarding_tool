import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import FloatingChatIcon from "./components/FloatingChatIcon";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ 
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron"
});

export const metadata: Metadata = {
  title: "Onboarding Platform - Autonex",
    description: "5-Day Onboarding Platform for Autonex Annotation & QC Training",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} ${orbitron.variable} h-full`}>
        {children}
        <FloatingChatIcon />
      </body>
    </html>
  );
}
