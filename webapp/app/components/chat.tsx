"use client";

import { useChat } from "ai/react";
import { Send, SparklesIcon } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Markdown } from "@/app/components/markdown";

interface GameState {
  health: number;
  score: number;
  currentScene: string;
}

interface ToolCallArgs {
  healthChange?: number;
  scoreChange?: number;
  nextScene?: string;
  nextChoices?: string[];
}

interface MessageContent {
  type: "text" | "tool-call";
  text?: string;
  toolName?: string;
  args?: ToolCallArgs;
  toolCallId?: string;
}

interface AIResponse {
  text: string;
  toolCalls?: Array<{
    type: string;
    toolCallId: string;
    toolName: string;
    args: ToolCallArgs;
  }>;
  gameState?: GameState;
}

type ExtendedMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | MessageContent[];
};

export default function Chat() {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    score: 0,
    currentScene: "start",
  });

  console.log("État initial du jeu:", JSON.stringify(gameState, null, 2));

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: { gameState },
    streamProtocol: "text",
    onResponse: async (response: Response) => {
      console.log("Réponse API reçue:", response);
      try {
        const clonedResponse = response.clone();
        const data: AIResponse = await clonedResponse.json();
        console.log("Données de réponse:", JSON.stringify(data, null, 2));

        if (data.gameState) {
          setGameState((prev: GameState) => {
            const newState = { ...prev, ...data.gameState };
            console.log(
              "Mise à jour de l'état du jeu:",
              JSON.stringify(newState, null, 2)
            );
            return newState;
          });
        }

        if (data.toolCalls && data.toolCalls.length > 0) {
          data.toolCalls.forEach((toolCall) => {
            if (toolCall.toolName === "updateGameState" && toolCall.args) {
              setGameState((prev: GameState) => {
                const healthChange = toolCall.args.healthChange ?? 0;
                const scoreChange = toolCall.args.scoreChange ?? 0;
                const newHealth = Math.max(
                  0,
                  Math.min(100, prev.health + healthChange)
                );
                return {
                  ...prev,
                  health: newHealth,
                  score: prev.score + scoreChange,
                  currentScene: toolCall.args.nextScene || prev.currentScene,
                };
              });
            }
          });
        }
      } catch (error) {
        console.error("Erreur lors du parsing de la réponse:", error);
      }
    },
    onError: (error: Error) => {
      console.error("Erreur de flux:", error);
    },
    onFinish: () => {
      console.log(
        "Réponse complète - Messages actuels:",
        JSON.stringify(messages, null, 2)
      );
      console.log(
        "État du jeu après la réponse complète:",
        JSON.stringify(gameState, null, 2)
      );
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Nouveau message détecté:", messages[messages.length - 1]);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Soumission du formulaire avec input:", input);
    try {
      await handleSubmit(e);
      console.log("Message envoyé avec succès");
    } catch (error) {
      console.error("Échec de l'envoi:", error);
    }
  };

  console.log("Etat des messages:", JSON.stringify(messages, null, 2));
  console.log("Entrée utilisateur:", input);

  const renderToolCall = (toolCall: MessageContent) => {
    if (!toolCall.args) return null;

    switch (toolCall.toolName) {
      case "updateGameState":
        return (
          <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200 my-4">
            <div className="flex items-center gap-2 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 8h14v10h-14V8zm7.5-5a1 1 0 0 1 1 1v1h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3V4a1 1 0 0 1 1-1h3.5z" />
              </svg>
              <h3 className="font-semibold">Mise à jour du jeu</h3>
            </div>

            {(toolCall.args.healthChange ?? 0) !== 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-24 font-medium">Santé :</span>
                <span
                  className={`px-2 py-1 rounded ${
                    toolCall.args.healthChange! > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {toolCall.args.healthChange! > 0 ? "+" : ""}
                  {toolCall.args.healthChange}%
                </span>
              </div>
            )}

            {(toolCall.args.scoreChange ?? 0) !== 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-24 font-medium">Score :</span>
                <span
                  className={`px-2 py-1 rounded ${
                    toolCall.args.scoreChange! > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {toolCall.args.scoreChange! > 0 ? "+" : ""}
                  {toolCall.args.scoreChange}
                </span>
              </div>
            )}

            {toolCall.args.nextScene && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-24 font-medium">Nouvelle scène :</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {toolCall.args.nextScene}
                </span>
              </div>
            )}

            {toolCall.args.nextChoices && (
              <div className="mt-3 pt-3 border-t border-blue-100">
                <h4 className="text-sm font-medium mb-2 text-blue-600">
                  Choix disponibles :
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {toolCall.args.nextChoices.map((choice, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {choice}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderMessage = (message: ExtendedMessage) => {
    let content: MessageContent[] = [];
    let toolCalls: Array<{
      type: string;
      toolCallId: string;
      toolName: string;
      args: ToolCallArgs;
    }> = [];

    try {
      const parsed =
        typeof message.content === "string"
          ? JSON.parse(message.content)
          : message.content;

      if (parsed.messages) {
        content = parsed.messages[0].content;
        toolCalls = parsed.toolCalls || [];
      } else if (Array.isArray(parsed)) {
        content = parsed;
      } else {
        content = parsed.content || [];
        toolCalls = parsed.toolCalls || [];
      }
    } catch {
      content = [{ type: "text", text: message.content as string }];
    }

    return (
      <div className="space-y-4">
        {content.map((part, index) => (
          <div key={`text-${index}`} className="prose prose-sm max-w-none">
            <Markdown>{part.text}</Markdown>
          </div>
        ))}

        {toolCalls.map((toolCall, index) => (
          <div key={`tool-${index}`} className="my-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-3">
                <SparklesIcon className="h-5 w-5" />
                <span className="font-semibold">Mise à jour du jeu</span>
              </div>
              {renderToolCall({
                type: "tool-call",
                toolName: toolCall.toolName,
                args: toolCall.args,
                toolCallId: toolCall.toolCallId,
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barre d'état du jeu */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span>❤️</span>
            <span
              className={`font-medium ${
                gameState.health < 30 ? "text-red-600" : ""
              }`}
            >
              {gameState.health}%
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-medium">{gameState.score}</span>
          </span>
        </div>
        <span className="flex items-center gap-1">
          <span>📍</span>
          <span className="font-medium">{gameState.currentScene}</span>
        </span>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 shadow-md"
              }`}
            >
              {renderMessage(message as ExtendedMessage)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire d'envoi */}
      <form
        onSubmit={handleFormSubmit}
        className="sticky bottom-0 bg-white border-t p-4"
      >
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Que voulez-vous faire ?"
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input}
            className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
