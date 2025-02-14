import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/ChatContext";

import ReactQueryProvider from "../providers/ReactQueryProvider";

// je veux utiliser la police Pixelify Sans venant de google font
const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeAI",
  description: "LifeAI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pixelifySans.variable} antialiased` + "flex flex-row"}
      >
        <ChatProvider>
          <ReactQueryProvider>
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
              <div className="flex-1 ">{children}</div>
            </div>
          </ReactQueryProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
