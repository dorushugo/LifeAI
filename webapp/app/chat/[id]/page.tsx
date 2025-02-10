"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Chat from "@/app/components/chat";
import type { Message } from "ai";

export default function ChatPage() {
  const { id } = useParams();
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/message/getAll`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });
        const data: Message[] = await response.json();
        console.log("data dans ChatPage.tsx", data);

        // Transformation du contenu de chaque message pour être sûr d'avoir une chaîne de caractères

        const sortedData = data.sort(
          (a, b) =>
            new Date(a.createdAt || "").getTime() -
            new Date(b.createdAt || "").getTime()
        );

        const existingMessages: Message[] = sortedData.map((msg) => ({
          ...msg,
          content: Array.isArray(msg.content)
            ? msg.content
                .map((item: any) =>
                  typeof item === "string"
                    ? item
                    : item?.text ?? JSON.stringify(item)
                )
                .join("\n")
            : msg.content,
        }));

        setInitialMessages(existingMessages);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMessages();
    }
  }, [id]);

  return (
    <Chat
      chatIdFromProps={id as string}
      initialMessages={initialMessages}
      isMessagesLoading={isLoading}
    />
  );
}
