"use client";

import { useChat } from "ai/react";
import { Send, SparklesIcon, Heart, Star, MapPin } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Markdown } from "@/app/components/markdown";

interface GameState {
  health: number;
  score: number;
  currentScene: string;
}

type ExtendedMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  structuredData?: {
    healthChange: number;
    scoreChange: number;
    nextScene: string;
  };
};

interface AIResponse {
  text: string;
  structuredOutput?: {
    healthChange: number;
    scoreChange: number;
    nextScene: string;
    message: string;
  };
}

export default function Chat() {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    score: 0,
    currentScene: "start",
  });

  console.log("État initial du jeu:", JSON.stringify(gameState, null, 2));

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat/structured",
    body: { gameState },
    streamProtocol: "text",
    onResponse: async (response: Response) => {
      console.log("Réponse API reçue:", response);
      try {
        const clonedResponse = response.clone();
        const data: AIResponse = await clonedResponse.json();
        console.log("Données de réponse:", JSON.stringify(data, null, 2));

        if (data.structuredOutput) {
          setGameState((prev: GameState) => {
            const newHealth = Math.max(
              0,
              Math.min(100, prev.health + data.structuredOutput!.healthChange)
            );
            const newScore = prev.score + data.structuredOutput!.scoreChange;
            const newScene =
              data.structuredOutput!.nextScene || prev.currentScene;

            console.log(
              "Nouvel état du jeu:",
              JSON.stringify(
                {
                  health: newHealth,
                  score: newScore,
                  currentScene: newScene,
                },
                null,
                2
              )
            );

            return {
              ...prev,
              health: newHealth,
              score: newScore,
              currentScene: newScene,
            };
          });

          if (data.structuredOutput.message) {
            const newMessage: ExtendedMessage = {
              id: Date.now().toString(),
              role: "assistant",
              content: data.structuredOutput.message,
              structuredData: {
                healthChange: data.structuredOutput.healthChange,
                scoreChange: data.structuredOutput.scoreChange,
                nextScene: data.structuredOutput.nextScene,
              },
            };
            messages.push(newMessage);
          }
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

  const renderMessage = (message: ExtendedMessage) => {
    if (message.role === "assistant") {
      const json = JSON.parse(message.content);
      console.log("JSON:", json);
      return (
        <div className="prose prose-sm max-w-none text-white">
          <Markdown>{json.text}</Markdown>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <Heart
                className={`w-4 h-4 ${
                  json.structuredOutput.healthChange >= 0
                    ? "text-green-400 fill-green-400/20"
                    : "text-red-400 fill-red-400/20"
                }`}
              />
              <span
                className={`text-sm  font-medium ${
                  json.structuredOutput.healthChange >= 0
                    ? "text-white"
                    : "text-white"
                }`}
              >
                {json.structuredOutput.healthChange > 0
                  ? "+"
                  : json.structuredOutput.healthChange < 0
                  ? "-"
                  : ""}
                {json.structuredOutput.healthChange}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <Star
                className={`w-4 h-4 ${
                  json.structuredOutput.scoreChange >= 0
                    ? "text-yellow-400 fill-yellow-400/20"
                    : "text-red-400 fill-red-400/20"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  json.structuredOutput.scoreChange >= 0
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {json.structuredOutput.scoreChange > 0 ? "+" : ""}
                {json.structuredOutput.scoreChange}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <MapPin className="w-4 h-4 text-blue-400 fill-blue-400/20" />
              <span className="text-sm font-medium text-blue-400">
                {json.structuredOutput.nextScene}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <Markdown>{message.content}</Markdown>

        {message.structuredData && (
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <Heart
                className={`w-4 h-4 ${
                  message.structuredData.healthChange >= 0
                    ? "text-green-400 fill-green-400/20"
                    : "text-red-400 fill-red-400/20"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  message.structuredData.healthChange >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message.structuredData.healthChange > 0 ? "+" : ""}
                {message.structuredData.healthChange}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <Star
                className={`w-4 h-4 ${
                  message.structuredData.scoreChange >= 0
                    ? "text-yellow-400 fill-yellow-400/20"
                    : "text-red-400 fill-red-400/20"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  message.structuredData.scoreChange >= 0
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {message.structuredData.scoreChange > 0 ? "+" : ""}
                {message.structuredData.scoreChange}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <MapPin className="w-4 h-4 text-blue-400 fill-blue-400/20" />
              <span className="text-sm font-medium text-blue-400">
                {message.structuredData.nextScene}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Barre d'état style HUD jeu vidéo */}
      <div className="bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-700 flex justify-between items-center shadow-xl">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-red-400">
            <Heart className="w-5 h-5 fill-red-500/20 stroke-red-500" />
            <span className="font-bold text-lg">{gameState.health}%</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <Star className="w-5 h-5 fill-yellow-500/20 stroke-yellow-500" />
            <span className="font-bold text-lg">{gameState.score}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          <MapPin className="w-5 h-5 fill-blue-500/20 stroke-blue-500" />
          <span className="font-bold text-lg">{gameState.currentScene}</span>
        </div>
      </div>

      {/* Zone de messages revisité */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } transition-all duration-300`}
          >
            <div
              className={`relative max-w-[75%] rounded-xl p-5 shadow-lg ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-700 to-blue-600 text-white"
                  : "bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600"
              }`}
            >
              {/* Triangle décoratif */}
              <div
                className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                  message.role === "user"
                    ? "-right-1.5 bg-blue-600"
                    : "-left-1.5 bg-gray-700"
                }`}
              />

              {renderMessage(message as ExtendedMessage)}

              {/* Timestamp style jeu */}
              <div
                className={`mt-3 text-xs ${
                  message.role === "user" ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                  timeStyle: "short",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire style terminal de jeu */}
      <form
        onSubmit={handleFormSubmit}
        className="sticky bottom-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 p-4 shadow-2xl"
      >
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Entrez votre action..."
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all resize-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50
                     transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
