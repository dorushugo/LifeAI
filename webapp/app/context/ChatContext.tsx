"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  pendingMessage: string;
  setPendingMessage: (message: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [pendingMessage, setPendingMessage] = useState<string>("");

  return (
    <ChatContext.Provider value={{ pendingMessage, setPendingMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error(
      "useChatContext doit être utilisé au sein d'un ChatProvider"
    );
  }
  return context;
};
