import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/ChatContext";
import Sidebar from "./components/Sidebar";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import SignUp from "./components/SignUp";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChronosAI",
  description: "ChronosAI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return (
      <html lang="en">
        <body>
          <SignUp />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={
          `${geistSans.variable} ${geistMono.variable} antialiased` +
          "flex flex-row"
        }
      >
        <ChatProvider>
          <TooltipProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#faf6f1",
                  color: "#4a3427",
                  border: "1px solid #e6d5c3",
                },
                success: {
                  iconTheme: {
                    primary: "#b85c38",
                    secondary: "#fff",
                  },
                },
              }}
            />
            <div className="flex flex-row w-full">
              {/* Sidebar */}
              <Sidebar className="hidden md:block border-r border-[#e6d5c3] bg-[#faf6f1] min-w-7xl" />
              <div className="flex-1 max-w-[88vw]">{children}</div>
            </div>
          </TooltipProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
