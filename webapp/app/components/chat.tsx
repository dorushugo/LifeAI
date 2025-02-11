"use client";

import { useChat } from "ai/react";
import {
  Send,
  SparklesIcon,
  Heart,
  Star,
  MapPin,
  Clock,
  Coins,
  Scale,
  CalendarHeart,
  Brain,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Markdown } from "@/app/components/markdown";

interface GameState {
  health: number;
  time: number;
  money: number;
  karma: number;
  age: number;
  psychologicalProfile: string;
  interactionCount: number;
  QI : number;
  socialSkills : number;
}

type ExtendedMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  structuredOutput?: {
    healthChange: number;
    moneyChange: number;
    karmaChange: number;
    psychologicalProfile: string;
    QIChange: number;
    socialSkillsChange: number;
    question?: {
      text: string;
      options: {
        text: string;
        effect: string;
      }[];
    };
  };
};

interface AIResponse {
  text: string;
  structuredOutput?: {
    healthChange: number;
    moneyChange: number;
    karmaChange: number;
    psychologicalProfile: string;
    QIChange: number;
    socialSkillsChange: number;
    message: string;
    question?: {
      text: string;
      options: {
        text: string;
        effect: string;
      }[];
    };
  };
}

export default function Chat() {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    time: 0,
    money: 0,
    karma: 0,
    age: 0,
    psychologicalProfile: "Curieux",
    interactionCount: 0,
    QI: 0,
    socialSkills: 0,
  });

  console.log("État initial du jeu:", JSON.stringify(gameState, null, 2));

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat/structured",
    body: {
      gameState: {
        ...gameState,
        interactionCount: gameState.interactionCount,
      },
    },
    streamProtocol: "text",
    onResponse: async (response: Response) => {
      console.log("Réponse API reçue:", response);
      try {
        const clonedResponse = response.clone();
        const data: AIResponse = await clonedResponse.json();
        console.log("Données de réponse:", JSON.stringify(data, null, 2));

        if (data.structuredOutput) {
          setGameState((prev: GameState) => {
            const newInteractionCount = prev.interactionCount + 1;
            const newAge =
              newInteractionCount % 5 === 0 ? prev.age + 5 : prev.age;

            const newHealth = Math.max(
              0,
              Math.min(
                100,
                prev.health + (data.structuredOutput?.healthChange || 0)
              )
            );

            const newMoney = Math.max(
              -10,
              Math.min(
                10,
                prev.money + (data.structuredOutput?.moneyChange || 0)
              )
            );
            const newKarma = Math.max(
              -10,
              Math.min(
                10,
                prev.karma + (data.structuredOutput?.karmaChange || 0)
              )
            );
            const newPsychologicalProfile =
              data.structuredOutput!.psychologicalProfile;

            console.log(
              "Nouvel état du jeu:",
              JSON.stringify(
                {
                  health: newHealth,
                  money: newMoney,
                  karma: newKarma,
                  age: newAge,
                  psychologicalProfile: newPsychologicalProfile,
                },
                null,
                2
              )
            );

            return {
              ...prev,
              health: newHealth,
              money: newMoney,
              karma: newKarma,
              age: newAge,
              psychologicalProfile: newPsychologicalProfile,
              interactionCount: newInteractionCount,
            };
          });

          if (data.structuredOutput.message) {
            const newMessage: ExtendedMessage = {
              id: Date.now().toString(),
              role: "assistant",
              content: data.structuredOutput.message,
              structuredOutput: {
                healthChange: data.structuredOutput.healthChange,
                moneyChange: data.structuredOutput.moneyChange,
                karmaChange: data.structuredOutput.karmaChange,
                psychologicalProfile:
                  data.structuredOutput.psychologicalProfile,
                question: data.structuredOutput.question,
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
      try {
        const parsedJson = JSON.parse(message.content);
        console.log("Message analysé:", parsedJson);
        return (
          <div className="prose prose-sm max-w-none text-white">
            <Markdown>{parsedJson.text}</Markdown>
            {parsedJson.structuredOutput?.question && (
              <div className="mt-4 space-y-3">
                <div className="text-lg font-bold text-blue-300">
                  {parsedJson.structuredOutput.question.text}
                </div>
                <div className="grid gap-2">
                  {parsedJson.structuredOutput.question.options.map(
                    (
                      option: { text: string; effect: string },
                      index: number
                    ) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleInputChange({
                            target: { value: option.text },
                          } as any);
                          handleSubmit({ preventDefault: () => {} } as any);
                        }}
                        className="p-3 text-left rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-600"
                      >
                        <div className="font-medium">{option.text}</div>
                        <div className="text-sm text-gray-400">
                          {option.effect}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
                <Heart
                  className={`w-4 h-4 ${
                    (parsedJson.structuredOutput?.healthChange ?? 0) >= 0
                      ? "text-green-400 fill-green-400/20"
                      : "text-red-400 fill-red-400/20"
                  }`}
                />
                <span
                  className={`text-sm  font-medium ${
                    (parsedJson.structuredOutput?.healthChange ?? 0) >= 0
                      ? "text-white"
                      : "text-white"
                  }`}
                >
                  {(parsedJson.structuredOutput?.healthChange ?? 0) > 0
                    ? "+"
                    : (parsedJson.structuredOutput?.healthChange ?? 0) < 0
                    ? "-"
                    : ""}
                  {parsedJson.structuredOutput?.healthChange}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
                <Coins
                  className={`w-4 h-4 ${
                    (parsedJson.structuredOutput?.moneyChange ?? 0) >= 0
                      ? "text-green-400 fill-green-400/20"
                      : "text-red-400 fill-red-400/20"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    (parsedJson.structuredOutput?.moneyChange ?? 0) >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {(parsedJson.structuredOutput?.moneyChange ?? 0) > 0
                    ? "+"
                    : ""}
                  ${parsedJson.structuredOutput?.moneyChange}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
                <Scale
                  className={`w-4 h-4 ${
                    (parsedJson.structuredOutput?.karmaChange ?? 0) >= 0
                      ? "text-purple-400 fill-purple-400/20"
                      : "text-red-400 fill-red-400/20"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    (parsedJson.structuredOutput?.karmaChange ?? 0) >= 0
                      ? "text-purple-400"
                      : "text-red-400"
                  }`}
                >
                  {(parsedJson.structuredOutput?.karmaChange ?? 0) > 0
                    ? "+"
                    : ""}
                  {parsedJson.structuredOutput?.karmaChange}
                </span>
              </div>
            </div>
          </div>
        );
      } catch (error) {
        console.error("Erreur de parsing du message:", error);
        return <Markdown>{message.content}</Markdown>;
      }
    }
    return (
      <div className="space-y-3">
        <Markdown>{message.content}</Markdown>

        {message.structuredOutput && (
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <Heart
                className={`w-4 h-4 ${
                  (message.structuredOutput.healthChange ?? 0) >= 0
                    ? "text-green-400 fill-green-400/20"
                    : "text-red-400 fill-red-400/20"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  (message.structuredOutput.healthChange ?? 0) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message.structuredOutput.healthChange > 0 ? "+" : ""}
                {message.structuredOutput.healthChange}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <Coins
                className={`w-4 h-4 ${
                  message.structuredOutput.moneyChange >= 0
                    ? "text-green-400 fill-green-400/20"
                    : "text-red-400 fill-red-400/20"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  message.structuredOutput.moneyChange >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message.structuredOutput.moneyChange > 0 ? "+" : ""}$
                {message.structuredOutput.moneyChange}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-full">
              <Scale
                className={`w-4 h-4 ${
                  message.structuredOutput.karmaChange >= 0
                    ? "text-purple-400 fill-purple-400/20"
                    : "text-red-400 fill-red-400/20"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  message.structuredOutput.karmaChange >= 0
                    ? "text-purple-400"
                    : "text-red-400"
                }`}
              >
                {message.structuredOutput.karmaChange > 0 ? "+" : ""}
                {message.structuredOutput.karmaChange}
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
          <div className="text-white">{gameState.interactionCount}</div>
          <div className="flex items-center gap-2 text-red-400">
            <Heart className="w-5 h-5 fill-red-500/20 stroke-red-500" />
            <span className="font-bold text-lg">{gameState.health}%</span>
          </div>

          <div className="flex items-center gap-2 text-blue-400">
            <Clock className="w-5 h-5 fill-blue-500/20 stroke-blue-500" />
            <span className="font-bold text-lg">{gameState.time}h</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <Coins className="w-5 h-5 fill-green-500/20 stroke-green-500" />
            <span className="font-bold text-lg">${gameState.money}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <Scale className="w-5 h-5 fill-purple-500/20 stroke-purple-500" />
            <span className="font-bold text-lg">{gameState.karma}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-pink-400">
            <CalendarHeart className="w-5 h-5 fill-pink-500/20 stroke-pink-500" />
            <span className="font-bold text-lg">{gameState.age} ans</span>
          </div>
          <div className="flex items-center gap-2 text-orange-400">
            <Brain className="w-5 h-5 fill-orange-500/20 stroke-orange-500" />
            <span className="font-bold text-lg">
              {gameState.psychologicalProfile}
            </span>
          </div>
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
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                      timeStyle: "short",
                    })
                  : "Date inconnue"}
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
