"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import cx from "classnames";

type Chat = {
  id: string;
  name: string;
  createdAt: string;
};

type SidebarProps = {
  className?: string;
};

const Sidebar = ({ className }: SidebarProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch("/api/chat/getAll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session?.user?.id }),
        });
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des chats");
        }
        const data = await response.json();
        setChats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <aside
      className={`w-64 flex flex-col border-r border-[#e6d5c3] bg-[#faf6f1] ${className} h-screen overflow-y-auto`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 bg-[#faf6f1]/90 backdrop-blur-sm border-b border-[#e6d5c3]">
        <h2 className="text-xl font-medium text-[#4a3427]">
          Historique des chats
        </h2>
      </div>

      {/* Content */}
      <div className="min-h-full flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#e6d5c3] scrollbar-track-transparent">
        {isLoading && (
          <div className="p-4 text-center text-[#665147]">
            <div className="animate-pulse">Chargement...</div>
          </div>
        )}

        {error && (
          <div className="p-4 text-red-600 bg-red-50 border border-red-100 rounded-lg mx-2 my-2">
            {error}
          </div>
        )}

        {chats.length > 0 && (
          <div className="space-y-1 p-2">
            {chats.map((chat) => (
              <Link
                href={`/chat/${chat.id}`}
                key={chat.id}
                className={cx(
                  "group flex items-center px-4 py-3 rounded-xl",
                  "transition-all duration-200",
                  "hover:bg-white hover:shadow-sm",
                  "border border-transparent hover:border-[#e6d5c3]",
                  "text-[#4a3427] hover:text-[#2d1810]"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">
                    {chat.name}
                  </div>
                  <div className="truncate text-xs text-[#a39183] mt-0.5">
                    Créé le {new Date(chat.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky max-w-7xl bottom-0 mt-auto p-4 bg-[#faf6f1]/90 backdrop-blur-sm border-t border-[#e6d5c3]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-[#4a3427] truncate">
            {session?.user?.email}
          </div>
          <button
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/";
                  },
                },
              });
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#b85c38] 
                     hover:bg-[#f0e6d9] rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">Déconnexion</span>
            <span>🚪</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
