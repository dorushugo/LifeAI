"use client";

import { useChat } from "ai/react";
import {
  Send,
  BookOpen,
  PenLine,
  FileText,
  Clock,
  Search,
  ArrowDown,
  Copy,
  Download,
  Play,
  Pause,
  Plus,
  Minus,
} from "lucide-react";
import { useRef, useEffect, useState, FormEvent, UIEvent } from "react";
import { Markdown } from "@/app/components/markdown";
import cx from "classnames";
import { motion } from "framer-motion";
import type { Message, ToolInvocation } from "ai";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import { authClient } from "@/lib/auth-client";
import SignUp from "@/app/components/SignUp";
import { useChatContext } from "@/app/context/ChatContext";

interface QuizData {
  title: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[];
}

interface StudyCardData {
  title: string;
  introduction: string;
  keyPoints: {
    title: string;
    content: string;
  }[];
  dates: {
    date: string;
    event: string;
  }[];
  keyFigures: {
    name: string;
    role: string;
    description: string;
  }[];
  conclusion: string;
}

const QuizComponent = ({ quiz }: { quiz: QuizData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (index === quiz.questions[currentQuestion].correctIndex) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setCurrentQuestion((prev) => prev + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const progress = (currentQuestion / quiz.questions.length) * 100;

  return (
    <motion.div
      className="mt-4 p-6 bg-[#faf6f1] rounded-xl shadow-lg border border-[#e6d5c3]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Barre de progression */}
      <div className="h-2 bg-[#f0e6d9] rounded-full mb-6">
        <div
          className="h-full bg-[#b85c38] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="text-xl font-serif font-bold text-[#4a3427] mb-2">
        {quiz.title}
      </h3>

      {currentQuestion < quiz.questions.length ? (
        <div>
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-xl font-semibold text-[#2d1810] tracking-wide mb-6">
              {quiz.questions[currentQuestion].question}
            </p>

            <div className="grid gap-3">
              {quiz.questions[currentQuestion].options.map((option, index) => {
                const isCorrect =
                  index === quiz.questions[currentQuestion].correctIndex;
                const isSelected = selectedAnswer === index;

                return (
                  <motion.button
                    key={index}
                    onClick={() => !selectedAnswer && handleAnswer(index)}
                    className={cx(
                      "p-4 text-left rounded-xl border transition-all",
                      "flex items-center gap-3",
                      selectedAnswer !== null
                        ? isCorrect
                          ? "bg-[#edf7ed] border-[#4caf50] text-[#1e4620]"
                          : isSelected
                          ? "bg-[#fdeded] border-[#ef5350] text-[#621b16]"
                          : "border-[#e6d5c3] bg-white text-[#4a3427]"
                        : "hover:bg-[#faf6f1] border-[#e6d5c3] bg-white text-[#4a3427]"
                    )}
                    disabled={selectedAnswer !== null}
                    whileHover={
                      !selectedAnswer ? { scale: 1.01, x: 4 } : undefined
                    }
                    whileTap={!selectedAnswer ? { scale: 0.98 } : undefined}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div
                      className={cx(
                        "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                        selectedAnswer !== null
                          ? isCorrect
                            ? "bg-[#4caf50] text-white"
                            : isSelected
                            ? "bg-[#ef5350] text-white"
                            : "bg-[#b85c38] text-white"
                          : "bg-[#b85c38] text-white"
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-[#fff8f1] rounded-lg border border-[#e6d5c3]"
            >
              <div className="flex items-start gap-3">
                <span className="text-[#b85c38]">💡</span>
                <div>
                  <p className="font-medium text-[#4a3427] mb-2">
                    {selectedAnswer ===
                    quiz.questions[currentQuestion].correctIndex
                      ? "Bonne réponse !"
                      : "Explication"}
                  </p>
                  <p className="text-[#665147]">
                    {quiz.questions[currentQuestion].explanation ||
                      "La réponse correcte est l'option " +
                        String.fromCharCode(
                          65 + quiz.questions[currentQuestion].correctIndex
                        )}
                  </p>
                </div>
              </div>

              <button
                onClick={nextQuestion}
                className="mt-4 bg-[#b85c38] text-white px-5 py-2.5 rounded-lg hover:bg-[#a34e2e] 
                         transition-colors flex items-center gap-2 ml-auto font-medium"
              >
                {currentQuestion < quiz.questions.length - 1
                  ? "Question suivante →"
                  : "Voir les résultats"}
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-2xl font-bold text-[#4a3427] mb-4">
            Quiz terminé !
          </p>
          <p className="text-lg text-[#665147] mb-6">
            Votre score : {score}/{quiz.questions.length}
          </p>
          <button
            onClick={() => {
              setCurrentQuestion(0);
              setScore(0);
              setSelectedAnswer(null);
              setShowExplanation(false);
            }}
            className="bg-[#b85c38] text-white px-6 py-3 rounded-lg hover:bg-[#a34e2e] 
                     transition-colors font-medium"
          >
            Recommencer le quiz
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

const TimelineComponent = ({
  dates,
}: {
  dates: { date: string; event: string }[];
}) => {
  return (
    <div className="relative py-8 overflow-x-auto">
      <div className="absolute h-1 bg-[#e6d5c3] top-1/2 left-0 right-0 -translate-y-1/2" />
      <div className="flex justify-between min-w-max px-4 gap-8">
        {dates.map((date, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex flex-col items-center"
          >
            <div className="w-4 h-4 rounded-full bg-[#b85c38] relative z-10 mb-2" />
            <div className="text-sm font-medium text-[#b85c38] mb-1">
              {date.date}
            </div>
            <div className="w-48 text-center text-sm text-[#4a3427] bg-white p-2 rounded-lg border border-[#e6d5c3] shadow-sm">
              {date.event}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StudyCardComponent = ({ studyCard }: { studyCard: StudyCardData }) => {
  const handleCopy = async () => {
    try {
      const content = `# ${studyCard.title}

## Introduction
${studyCard.introduction}

## Points clés
${studyCard.keyPoints
  .map((point) => `### ${point.title}\n${point.content}`)
  .join("\n\n")}

## Chronologie
${studyCard.dates.map((date) => `- ${date.date}: ${date.event}`).join("\n")}

## Personnages clés
${studyCard.keyFigures
  .map((figure) => `### ${figure.name} (${figure.role})\n${figure.description}`)
  .join("\n\n")}

## Conclusion
${studyCard.conclusion}`;

      await navigator.clipboard.writeText(content);
      toast.success("Fiche de révision copiée !");
    } catch (error) {
      toast.error("Erreur lors de la copie");
      console.error("Erreur lors de la copie:", error);
    }
  };

  const generatePDF = async () => {
    try {
      toast.loading("Génération du PDF en cours...", { id: "pdf-loading" });

      const doc = new jsPDF();
      let y = 20;

      // Titre
      doc.setFontSize(20);
      doc.text(studyCard.title, 105, y, { align: "center" });
      y += 20;

      // Introduction
      doc.setFontSize(12);
      doc.text("Introduction", 20, y);
      y += 10;
      const introLines = doc.splitTextToSize(studyCard.introduction, 170);
      doc.text(introLines, 20, y);
      y += introLines.length * 7;

      // Points clés
      doc.setFontSize(16);
      doc.text("Points clés", 20, y);
      y += 10;
      studyCard.keyPoints.forEach((point) => {
        doc.setFontSize(14);
        doc.text(point.title, 20, y);
        y += 7;
        doc.setFontSize(12);
        const contentLines = doc.splitTextToSize(point.content, 170);
        doc.text(contentLines, 20, y);
        y += contentLines.length * 7 + 5;

        // Ajouter une nouvelle page si nécessaire
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      // Chronologie
      doc.setFontSize(16);
      doc.text("Chronologie", 20, y);
      y += 10;
      studyCard.dates.forEach((date) => {
        // Vérifier s'il faut ajouter une nouvelle page
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(12);
        const dateText = `${date.date}: ${date.event}`;
        const dateLines = doc.splitTextToSize(dateText, 170);
        doc.text(dateLines, 20, y);
        y += dateLines.length * 7;
      });

      // Personnages clés
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      y += 10;
      doc.setFontSize(16);
      doc.text("Personnages clés", 20, y);
      y += 10;
      studyCard.keyFigures.forEach((figure) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(14);
        doc.text(`${figure.name} (${figure.role})`, 20, y);
        y += 7;
        doc.setFontSize(12);
        const descLines = doc.splitTextToSize(figure.description, 170);
        doc.text(descLines, 20, y);
        y += descLines.length * 7 + 5;
      });

      // Conclusion
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      y += 10;
      doc.setFontSize(16);
      doc.text("Conclusion", 20, y);
      y += 10;
      doc.setFontSize(12);
      const concLines = doc.splitTextToSize(studyCard.conclusion, 170);
      doc.text(concLines, 20, y);

      // Sauvegarder le PDF
      doc.save(`${studyCard.title.replace(/\s+/g, "_")}.pdf`);

      toast.success("PDF téléchargé !", { id: "pdf-loading" });
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF", { id: "pdf-loading" });
      console.error("Erreur lors de la génération du PDF:", error);
    }
  };

  return (
    <motion.div
      className="mt-4 p-6 bg-[#faf6f1] rounded-xl shadow-lg border border-[#e6d5c3]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-serif font-bold text-[#4a3427]">
          {studyCard.title}
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#4a3427] bg-white rounded-lg border border-[#e6d5c3] hover:bg-[#faf6f1] transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copier
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePDF}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#b85c38] rounded-lg hover:bg-[#a34e2e] transition-colors"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </motion.button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <div className="prose prose-stone">
          <p className="text-[#665147]">{studyCard.introduction}</p>
        </div>

        {/* Points clés */}
        <div className="space-y-4">
          <h4 className="text-xl font-medium text-[#4a3427]">Points clés</h4>
          <div className="grid gap-4">
            {studyCard.keyPoints.map((point, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border border-[#e6d5c3]"
              >
                <h5 className="font-medium text-[#b85c38] mb-2">
                  {point.title}
                </h5>
                <p className="text-[#665147]">{point.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chronologie */}
        <div className="space-y-4">
          <h4 className="text-xl font-medium text-[#4a3427]">Chronologie</h4>

          {/* Frise chronologique uniquement pour l'affichage web */}
          <div className="bg-white rounded-lg border border-[#e6d5c3] overflow-hidden print:hidden">
            <TimelineComponent dates={studyCard.dates} />
          </div>

          {/* Liste chronologique pour web et PDF */}
          <div className="space-y-3">
            {studyCard.dates.map((date, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 bg-white rounded-lg border border-[#e6d5c3]"
              >
                <div className="font-medium text-[#b85c38] whitespace-nowrap">
                  {date.date}
                </div>
                <div className="text-[#665147]">{date.event}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Personnages clés */}
        <div className="space-y-4">
          <h4 className="text-xl font-medium text-[#4a3427]">
            Personnages clés
          </h4>
          <div className="grid gap-4">
            {studyCard.keyFigures.map((figure, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border border-[#e6d5c3]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium text-[#b85c38]">{figure.name}</h5>
                  <span className="text-sm text-[#665147]">
                    • {figure.role}
                  </span>
                </div>
                <p className="text-[#665147]">{figure.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div className="prose prose-stone">
          <h4 className="text-xl font-medium text-[#4a3427]">Conclusion</h4>
          <p className="text-[#665147]">{studyCard.conclusion}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Ajouter les suggestions de prompts historiques
const suggestedPrompts = [
  {
    icon: <BookOpen className="w-5 h-5 text-[#b85c38]" />,
    title: "Créer un quiz",
    label: "pour réviser",
    action:
      "Crée un quiz de 5 questions sur le thème suivant : [SUJET]. Assure-toi d'inclure des questions variées avec différents niveaux de difficulté. Pour chaque question, fournis une explication détaillée de la réponse.",
    color: "bg-[#faf6f1] hover:bg-[#f0e6d9] text-[#4a3427] border-[#e6d5c3]",
  },
  {
    icon: <Clock className="w-5 h-5 text-[#b85c38]" />,
    title: "Chronologie",
    label: "événements clés",
    action:
      "Peux-tu me faire une chronologie détaillée des événements clés de [PÉRIODE/ÉVÉNEMENT] ? Pour chaque date, explique l'importance de l'événement.",
    color: "bg-[#faf6f1] hover:bg-[#f0e6d9] text-[#4a3427] border-[#e6d5c3]",
  },
  {
    icon: <Search className="w-5 h-5 text-[#b85c38]" />,
    title: "Analyser",
    label: "période historique",
    action:
      "Peux-tu analyser en détail [PÉRIODE HISTORIQUE] en expliquant : \n- Les causes principales\n- Les événements majeurs\n- Les conséquences\n- Les personnages clés",
    color: "bg-[#faf6f1] hover:bg-[#f0e6d9] text-[#4a3427] border-[#e6d5c3]",
  },
  {
    icon: <FileText className="w-5 h-5 text-[#b85c38]" />,
    title: "Fiche de révision",
    label: "synthèse complète",
    action:
      "Peux-tu créer une fiche de révision détaillée sur [SUJET] avec :\n- Une introduction\n- Les points clés\n- La chronologie\n- Les personnages importants\n- Une conclusion",
    color: "bg-[#faf6f1] hover:bg-[#f0e6d9] text-[#4a3427] border-[#e6d5c3]",
  },
];

// Modifier la fonction de parsing
const parseToolInvocation = (content: string) => {
  console.log("Parsing content:", content);

  // Essayer de parser les tool calls/results d'abord
  if (content.trim().startsWith("{") && content.trim().endsWith("}")) {
    try {
      const data = JSON.parse(content);
      console.log("Parsed JSON (tool):", data);

      if (data.type === "tool-call" && data.toolName && data.toolCallId) {
        return {
          toolName: data.toolName,
          toolCallId: data.toolCallId,
          args: data.args,
          state: "awaiting_input" as const,
        };
      }
      if (data.type === "tool-result" && data.toolName && data.result) {
        return {
          toolName: data.toolName,
          toolCallId: data.toolCallId,
          result: data.result,
          state: "result" as const,
        };
      }
    } catch (e) {
      console.error("Error parsing tool content:", e);
      return null;
    }
  }

  // Vérifier si c'est un message texte complet (stocké en base)
  if (content.trim().startsWith('[{"type":"text"')) {
    try {
      const messages = JSON.parse(content);
      console.log("Parsed stored message:", messages);
      if (Array.isArray(messages) && messages[0]?.type === "text") {
        return null;
      }
    } catch (e) {
      console.error("Error parsing stored message:", e);
      return null;
    }
  }

  console.log("Content is regular text");
  return null;
};

interface ChatProps {
  chatIdFromProps?: string | null;
  initialMessages?: Message[];
  isMessagesLoading?: boolean;
}

// -------------------------------------------------
// Nouveau composant AudioPlayer
// -------------------------------------------------
const AudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const decreaseSpeed = () => {
    const newRate = Math.max(0.5, playbackRate - 0.25);
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const increaseSpeed = () => {
    const newRate = Math.min(2, playbackRate + 0.25);
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* L'élément audio est géré en interne */}
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center p-2 bg-[#b85c38] text-white rounded-full hover:bg-[#a34e2e] transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={decreaseSpeed}
            className="flex items-center justify-center p-1 bg-[#faf6f1] border border-[#e6d5c3] rounded hover:bg-[#f0e6d9] transition-colors"
          >
            <Minus className="w-4 h-4 text-[#4a3427]" />
          </button>
          <span className="font-medium text-[#4a3427]">
            {playbackRate.toFixed(2)}x
          </span>
          <button
            onClick={increaseSpeed}
            className="flex items-center justify-center p-1 bg-[#faf6f1] border border-[#e6d5c3] rounded hover:bg-[#f0e6d9] transition-colors"
          >
            <Plus className="w-4 h-4 text-[#4a3427]" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full"
        />
        <span className="text-sm text-[#665147]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default function Home({
  chatIdFromProps,
  initialMessages = [],
  isMessagesLoading = false,
}: ChatProps) {
  const [chatId, setChatId] = useState<string | null | undefined>(
    chatIdFromProps
  );
  const { pendingMessage, setPendingMessage } = useChatContext();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLoading,
  } = useChat(chatId ? { id: chatId, initialMessages } : undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  useEffect(() => {
    if (messages.length > 0) {
      console.log("Liste des messsages", messages);
    }
  }, [messages]);
  useEffect(() => {
    if (chatId && pendingMessage) {
      handleChatSubmit({
        preventDefault: () => {},
      } as FormEvent<HTMLFormElement>);
      setPendingMessage("");
    }
  }, [chatId, pendingMessage, handleChatSubmit, setPendingMessage]);

  const createNewChat = async (): Promise<string> => {
    try {
      const title = input.trim().split(/\s+/).slice(0, 5).join(" ");
      const res = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création du chat");
      const data = await res.json();
      const newChatId: string = data[0].id;

      // Réinitialiser l'état local
      setChatId(newChatId);
      setPendingMessage("");
      window.history.replaceState({}, "", `/chat/${newChatId}`);

      return newChatId;
    } catch (error) {
      console.error("Erreur création chat:", error);
      toast.error("Erreur lors de la création du chat");
      throw error;
    }
  };

  const customHandleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatId && input.trim()) {
      try {
        await createNewChat();
        setPendingMessage(input);
      } catch (error) {
        console.error("Erreur lors de la création du chat:", error);
      }
    } else {
      handleChatSubmit(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const isAtBottom =
      e.currentTarget.scrollHeight -
        e.currentTarget.scrollTop -
        e.currentTarget.clientHeight <
      100;
    setShowScrollButton(!isAtBottom);
  };

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    const { toolName, toolCallId, state } = toolInvocation;

    if (state !== "result") {
      const loadingMessages = {
        searchWarsInfo: "Recherche d'informations en cours...",
        generateQuiz: "Génération du quiz en cours...",
        generateStudyCard: "Création de la fiche de révision...",
      };

      const loadingIcons = {
        searchWarsInfo: (
          <Search className="w-4 h-4 animate-pulse text-[#b85c38]" />
        ),
        generateQuiz: (
          <BookOpen className="w-4 h-4 animate-pulse text-[#b85c38]" />
        ),
        generateStudyCard: (
          <FileText className="w-4 h-4 animate-pulse text-[#b85c38]" />
        ),
      };

      return (
        <motion.div
          key={toolCallId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[#4a3427] mt-2 p-3 bg-[#faf6f1] rounded-lg border border-[#e6d5c3]"
        >
          <div className="flex items-center gap-3">
            {loadingIcons[toolName as keyof typeof loadingIcons] || (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#b85c38] border-t-transparent" />
            )}
            <span>
              {loadingMessages[toolName as keyof typeof loadingMessages] ||
                "Traitement en cours..."}
            </span>
          </div>
        </motion.div>
      );
    }

    if (state === "result" && "result" in toolInvocation) {
      if (toolName === "generateQuiz") {
        return <QuizComponent quiz={toolInvocation.result.quiz} />;
      }

      if (toolName === "generateStudyCard") {
        return (
          <StudyCardComponent studyCard={toolInvocation.result.studyCard} />
        );
      }

      if (toolName === "generateAudioRevision") {
        try {
          const audioResult = JSON.parse(toolInvocation.result);
          return (
            <motion.div
              key={toolCallId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 p-3 bg-[#faf6f1] rounded-lg border border-[#e6d5c3]"
            >
              <span>{audioResult.message}</span>
              {audioResult.url && <AudioPlayer src={audioResult.url} />}
            </motion.div>
          );
        } catch (e) {
          console.error(
            "Erreur lors du parsing du résultat de generateAudioRevision:",
            e
          );
          return (
            <motion.div
              key={toolCallId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-[#faf6f1] rounded-lg border border-[#e6d5c3]"
            >
              <span>Audio généré !</span>
            </motion.div>
          );
        }
      }

      // Rendu par défaut pour les autres outils
      const results = Array.isArray(toolInvocation.result)
        ? toolInvocation.result
        : [toolInvocation.result];

      return (
        <div key={toolCallId} className="mt-4 flex flex-wrap gap-2">
          {results.map((result, index) => {
            const match = result.match(/# (.*?)\n/);
            const title = match ? match[1] : "Article Wikipédia";
            const urlMatch = result.match(/\[.*?\]\((.*?)\)/);
            const url = urlMatch ? urlMatch[1] : "#";

            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-[#faf6f1] rounded-lg border border-[#e6d5c3] hover:bg-[#f0e6d9] transition-colors text-[#4a3427]"
              >
                <BookOpen className="w-5 h-5 text-[#b85c38]" />
                <span className="text-sm font-medium">{title}</span>
              </a>
            );
          })}
        </div>
      );
    }

    return null;
  };

  // Modifier la fonction handleNewChat
  const handleNewChat = () => {
    setChatId(null);
    setPendingMessage("");
    // Réinitialiser les messages locaux
    if (!chatIdFromProps) {
      messages.splice(0, messages.length);
    }
    window.history.replaceState({}, "", "/");
  };

  const isToolInvocationJson = (content: string): boolean => {
    const trimmed = content.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      return false;
    }
    try {
      const data = JSON.parse(trimmed);
      return (
        (data.type === "tool-call" && data.toolName && data.toolCallId) ||
        (data.type === "tool-result" && data.toolName && data.result)
      );
    } catch (e) {
      return false;
    }
  };

  const getPlainTextFromContent = (content: string): string => {
    try {
      if (content.trim().startsWith("[")) {
        const arr = JSON.parse(content);
        return Array.isArray(arr) ? arr[0].text : content;
      }
    } catch (e) {
      console.error("Erreur lors du parsing du contenu du message :", e);
    }
    return content;
  };

  return (
    <div className="flex flex-col h-screen bg-[#fdfbf7] bg-[url('/subtle-pattern.png')] bg-repeat relative">
      {/* Header modernisé */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-[#e6d5c3] transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium bg-gradient-to-r from-[#4a3427] to-[#b85c38] bg-clip-text text-transparent">
              Chronos
            </h1>
            <span className="text-sm text-[#665147] bg-[#faf6f1] px-2 py-0.5 rounded-full border border-[#e6d5c3]">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-4">
            {chatId && (
              <motion.button
                onClick={() => {
                  handleNewChat();
                  // Forcer le rechargement
                  window.location.href = "/";
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#b85c38] bg-[#faf6f1] rounded-lg border border-[#e6d5c3] hover:bg-[#f0e6d9] transition-colors"
              >
                <PenLine className="w-4 h-4" />
                Nouveau chat
              </motion.button>
            )}
          </div>
        </div>
      </header>
      {isMessagesLoading && messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
          <div className="text-center space-y-3 max-w-xl">
            <h2 className="text-3xl font-medium text-[#4a3427]">
              Chargement des messages...
            </h2>
          </div>
        </div>
      ) : messages.length > 0 ? (
        <div
          className="messages-container flex-1 overflow-y-auto p-4 pb-40 space-y-4"
          onScroll={handleScroll}
        >
          {messages.map((message: Message) => {
            const toolInvocation = parseToolInvocation(message.content);

            // Ne pas afficher les tool-calls qui attendent une saisie si besoin
            if (toolInvocation?.state === "awaiting_input") return null;

            return (
              <motion.div
                key={message.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className={cx(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cx(
                    "max-w-[80%] rounded-lg p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300",
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#b85c38] to-[#a34e2e] text-white rounded-br-none"
                      : "bg-[#faf6f1] text-[#4a3427] rounded-bl-none border border-[#e6d5c3]"
                  )}
                >
                  {message.toolInvocations?.map(renderToolInvocation)}

                  {toolInvocation &&
                    renderToolInvocation(toolInvocation as ToolInvocation)}

                  {message.content &&
                    !isToolInvocationJson(message.content) && (
                      <div className="prose prose-sm max-w-none">
                        <Markdown>
                          {getPlainTextFromContent(message.content)}
                        </Markdown>
                      </div>
                    )}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
          <div className="text-center space-y-3 max-w-xl">
            <h2 className="text-3xl font-medium text-[#4a3427]">
              Bonjour {session?.user?.name}, explorez l&apos;Histoire des
              guerres avec IA
            </h2>

            <p className="text-[#665147] text-lg">
              Créez des quiz, analysez des périodes historiques ou explorez des
              civilisations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {suggestedPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  handleInputChange({
                    target: { value: prompt.action },
                  } as React.ChangeEvent<HTMLTextAreaElement>);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${prompt.color}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div>{prompt.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{prompt.title}</div>
                  <div className="text-sm text-[#665147]">{prompt.label}</div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="w-full max-w-2xl mt-8">
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-[#e6d5c3]">
              <div className="px-6 py-4">
                <textarea
                  ref={textareaRef}
                  placeholder="Posez votre question sur l'histoire ou décrivez le quiz que vous souhaitez créer..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      customHandleSubmit(
                        e as unknown as React.FormEvent<HTMLFormElement>
                      );
                    }
                  }}
                  className="w-full resize-none bg-transparent text-base outline-none min-h-[120px] text-[#4a3427] placeholder-[#a39183]"
                  rows={3}
                />
              </div>

              <div className="absolute bottom-4 right-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    customHandleSubmit(
                      e as unknown as React.FormEvent<HTMLFormElement>
                    );
                  }}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-[#b85c38] to-[#a34e2e] text-white rounded-full p-3 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                           hover:shadow-md disabled:hover:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire flottant - uniquement affiché quand il y a des messages */}
      {messages.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <form onSubmit={customHandleSubmit} className="relative">
            <div className="flex gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-[#e6d5c3]">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Posez votre question sur l'histoire..."
                className="flex-1 px-6 py-4 rounded-full border border-[#e6d5c3] bg-white/90 text-[#4a3427] 
                         focus:outline-none focus:ring-2 focus:ring-[#b85c38] focus:border-transparent
                         placeholder-[#a39183] font-serif shadow-sm transition-all duration-300
                         hover:shadow-md text-base"
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-[52px] h-[52px] flex items-center justify-center bg-gradient-to-r from-[#b85c38] to-[#a34e2e] 
                         text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-300 hover:shadow-md disabled:hover:shadow-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </form>
        </div>
      )}

      {showScrollButton && messages.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 p-3 bg-[#b85c38] text-white rounded-full shadow-lg hover:bg-[#a34e2e] transition-colors"
        >
          <ArrowDown className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
