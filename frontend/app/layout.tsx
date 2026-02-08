import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import FloatingChatIcon from "./components/FloatingChatIcon";
import EmailPromptWrapper from "./components/EmailPromptWrapper";

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} ${orbitron.variable} h-full`} suppressHydrationWarning>
        <EmailPromptWrapper>
          {children}
        </EmailPromptWrapper>
        <FloatingChatIcon />
      </body>
    </html>
  );
}
