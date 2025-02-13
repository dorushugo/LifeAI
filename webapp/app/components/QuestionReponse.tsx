import { User } from "@/app/page";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// Définition du type pour une question
type Question = {
  structuredOutput: {
    healthChange: number;
    moneyChange: number;
    karmaChange: number;
    psychologicalProfile: string;
    message: string;
  };
};

// Props du composant
type QuestionReponseProps = {
  user: User;
  setUser: (user: User) => void;
};

// Mise à jour du type Option
type OptionType = {
  text: string;
  healthChange: number;
  moneyChange: number;
  karmaChange: number;
  socialChange: number;
  psychologicalProfileChange: string;
  memoryChange: string; // Ajout de la propriété mémoire
};

// Mise à jour du type ApiResponse
type ApiResponse = {
  structuredOutput: {
    healthChange: number;
    moneyChange: number;
    karmaChange: number;
    psychologicalProfile: string;
    message: string;
    question: {
      text: string;
      options: OptionType[]; // Utilisation du nouveau type OptionType
    };
  };
};

// Mettre à jour le style global
<style jsx global>{`
  @keyframes loading-wave {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .loading-text::after {
    content: "→";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    animation: loading-wave 1.5s infinite ease-in-out;
  }

  @keyframes loading-slide {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .loading-track {
    position: relative;
    overflow: hidden;
    height: 2em;
    width: 200px;
  }

  .loading-indicator {
    position: absolute;
    white-space: nowrap;
    animation: loading-slide 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }
`}</style>;

const GAMEPLAY_TIPS = [
  "Les options extrêmes peuvent avoir des conséquences irréversibles",
  "Chaque partie à une histoire et des choix uniques",
  "Vos traits psychologiques se renforcent avec les choix répétés",
  "Chaque interaction vieillit votre personnage d'un an - planifiez à long terme !",
  "Les souvenirs accumulés débloquent des situations spéciales plus tard",
  "Les changements de karma influencent les réactions des personnages secondaires",
  "Jouez avec les entre différents traits psychologiques pour plus de flexibilité",
  "Votre âge détermine les types de défis auxquels vous faites face",
  "Consultez régulièrement votre journal des souvenirs pour suivre votre progression",
  "Les événements aléatoires testent votre capacité d'adaptation",
  "Les choix d'enfance influencent vos capacités à l'âge adulte",
  "Les compétences sociales s'améliorent avec la pratique régulière",
  "Certains choix verrouillent des branches narratives permanentes",
];

export default function QuestionReponse({
  user,
  setUser,
}: QuestionReponseProps) {
  // État pour gérer les questions et la question courante
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [isNextQuestionLoading, setIsNextQuestionLoading] = useState(false);
  const [currentTip, setCurrentTip] = useState("");

  const {
    data: currentQuestion,
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ["initialQuestion", user?.interactionCount],
    queryFn: async () => {
      setIsNextQuestionLoading(true);
      console.log(
        "Début de la requête API pour interactionCount:",
        user?.interactionCount
      );
      const response = await fetch("/api/chat/structured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameState: user }),
      });

      const data = await response.json();
      console.log("Réponse API reçue:", {
        status: response.status,
        dataStructure: {
          text: typeof data.text,
          structuredOutput: {
            healthChange: typeof data.structuredOutput?.healthChange,
            optionsCount: data.structuredOutput?.question?.options?.length,
          },
        },
        dataSample: {
          text: data.text?.substring(0, 50) + "...",
          options: data.structuredOutput?.question?.options?.map(
            (o: any) => o.text
          ),
        },
      });

      return data;
    },
    onError: (error) => {
      console.error("Erreur lors de la requête:", {
        errorMessage: error.message,
        errorStack: error.stack?.split("\n").slice(0, 2).join(" "),
      });
    },
    enabled: !!user,
    staleTime: Infinity,
    onSettled: () => {
      setIsNextQuestionLoading(false);
      setLoading(false);
    },
  });

  useEffect(() => {
    if (isLoading) {
      setCurrentTip(
        GAMEPLAY_TIPS[Math.floor(Math.random() * GAMEPLAY_TIPS.length)]
      );
    }
  }, [isLoading]);

  const handleOptionClick = (option: OptionType) => {
    setIsNextQuestionLoading(true);
    const newUser = {
      ...user,
      health: user.health + option.healthChange,
      money: user.money + option.moneyChange,
      karma: user.karma + option.karmaChange,
      socialSkills: user.socialSkills + option.socialChange,
      psychologicalProfile: [
        ...user.psychologicalProfile.filter(
          (t) => t !== option.psychologicalProfileChange
        ),
        option.psychologicalProfileChange,
      ].slice(-6),
      memory: [
        ...user.memory,
        ...(option.memoryChange
          ? [
              option.memoryChange +
                " - Mémoire obtenu à l'age de " +
                user.age +
                " ans",
            ]
          : []),
      ].slice(-10),
      interactionCount: user.interactionCount + 1,
    };

    // Vieillissement de 1 an à chaque interaction
    newUser.age += 1;

    setUser(newUser);
  };

  const submitRating = async () => {
    if (!currentRating) return; // Ne rien faire si aucune étoile n'est sélectionnée
    try {
      const ratingData = {
        rating: currentRating,
        message: currentQuestion?.structuredOutput.message,
        context: currentQuestion?.structuredOutput.question.text,
        responses: currentQuestion?.structuredOutput.question.options,
        date: new Date().toISOString(),
      };

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de l'envoi de la notation: ${errorText}`);
      }

      const result = await response.json();
      console.log("Notation envoyée avec succès :", result);
      setCurrentRating(0);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notation :", error);
      // Ici, vous pouvez aussi mettre à jour l'IU pour informer l'utilisateur de l'erreur
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen text-black bg-[#F1F1F1]">
      {/* Section centrale modifiée pour le responsive */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 md:px-20">
        {currentQuestion ? (
          // Afficher la question si disponible
          <div className="flex flex-col items-center space-y-8">
            <div className="text-3xl italic text-gray-600 max-w-3xl text-center mb-12">
              {currentQuestion.structuredOutput.message}
            </div>

            {/* Bouton d'ouverture de la notation */}
            <motion.button
              onClick={() => setShowRatingPopup(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative mt-8 group"
            >
              <div className="absolute inset-0 bg-yellow-400 rounded-lg blur-sm group-hover:blur transition-all" />
              <div className="relative px-6 py-3 bg-yellow-300 rounded-lg border-4 border-black flex items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="filter pixelated"
                  style={{ imageRendering: "pixelated" }}
                >
                  <path
                    d="M12 0L15.09 7.59L24 8.78L18 14.47L19.18 24L12 20.09L4.82 24L6 14.47L0 8.78L8.91 7.59L12 0Z"
                    fill="black"
                  />
                </svg>
                <span className="text-xl font-bold">Noter la réponse</span>
              </div>
            </motion.button>

            {/* Popup de notation */}
            {showRatingPopup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setShowRatingPopup(false)}
              >
                <motion.div
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  className="bg-[#F1F1F1] p-8 rounded-2xl border-4 border-black relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-2xl mb-6 text-center">
                    Noter cette réponse
                  </h3>

                  <div className="flex gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <motion.div
                        key={rating}
                        className="cursor-pointer relative pb-2 border-t-0 text-2xl text-black rounded-[20px] shadow-[inset_0_0_0_4px_black] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0 w-16 h-16 flex items-center justify-center"
                        variants={{
                          initial: { paddingBottom: "15px" },
                          hover: {
                            scale: 1.05,
                            transition: { type: "spring", stiffness: 300 },
                          },
                        }}
                        initial="initial"
                        whileHover="hover"
                        onClick={() => setCurrentRating(rating)}
                      >
                        <motion.button
                          className={`relative w-full h-full flex items-center justify-center text-3xl rounded-[20px] border-4 border-black transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] ${
                            rating <= currentRating
                              ? "bg-yellow-400"
                              : "bg-[#F1F1F1]"
                          }`}
                          variants={{
                            initial: { y: 0 },
                            hover: {
                              scale: 1.05,
                              y: -5,
                              transition: { type: "spring", stiffness: 400 },
                            },
                          }}
                          whileTap={{
                            scale: 0.95,
                            y: 0,
                            transition: { type: "spring", stiffness: 400 },
                          }}
                        >
                          {rating <= currentRating ? "★" : "☆"}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    onClick={() => {
                      submitRating();
                      setShowRatingPopup(false);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-yellow-300 text-black rounded-lg border-4 border-black font-bold relative pb-2 shadow-[inset_0_0_0_4px_black] before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px]"
                    disabled={!currentRating}
                  >
                    <span className="relative">VALIDER LA NOTE</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 40, rotateZ: -2 }}
                  animate={{ opacity: 1, y: 0, rotateZ: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 120, damping: 10 }}
                  className="text-5xl font-regular text-center leading-tight"
                >
                  {currentQuestion.structuredOutput.question.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Animation de chargement intégrée
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-12 w-64 overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 flex gap-2 text-2xl font-bold"
                initial={{ x: "-100%" }}
                animate={{
                  x: "100%",
                  transition: {
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "anticipate",
                  },
                }}
              >
                <motion.span
                  className="block"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                  }}
                >
                  🏈
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                  }}
                >
                  💰
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                    delay: 0.2,
                  }}
                >
                  ⚡
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                    delay: 0.4,
                  }}
                >
                  🕹️
                </motion.span>
              </motion.div>
            </div>
            <motion.span
              className="text-xl font-medium text-gray-600 max-w-2xl text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentTip}
            </motion.span>
          </div>
        )}
      </div>

      {/* Section des options responsive */}
      {currentQuestion && (
        <div className="w-full flex items-start justify-center px-4 md:px-20 pb-8 md:pb-20">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 w-full max-w-4xl">
            {currentQuestion.structuredOutput.question.options.map(
              (option, index) => (
                <motion.div
                  key={index}
                  className="w-full md:w-[320px] h-full flex justify-center items-center"
                >
                  <motion.div
                    className="cursor-pointer h-full relative pb-2 border-t-0 text-2xl text-black rounded-[20px] shadow-[inset_0_0_0_4px_black] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0 w-[320px] flex flex-col"
                    variants={{
                      initial: { paddingBottom: "15px" },
                      hover: {
                        scale: 1.05,
                        transition: { type: "spring", stiffness: 300 },
                      },
                    }}
                    initial="initial"
                    whileHover="hover"
                    onClick={() => handleOptionClick(option)}
                  >
                    <motion.button
                      className="relative w-full h-full flex-1 py-2 px-6 text-xl text-black rounded-[20px] border-4 border-black transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 bg-[#F1F1F1] before:rounded-[20px] break-words flex items-center justify-center min-h-[150px] md:min-h-[200px]"
                      variants={{
                        initial: { y: 0 },
                        hover: {
                          scale: 1.05,
                          y: -5,
                          transition: { type: "spring", stiffness: 400 },
                        },
                      }}
                      whileTap={{
                        scale: 0.95,
                        y: 0,
                        transition: { type: "spring", stiffness: 400 },
                      }}
                    >
                      <span className="text-center px-2 h-full flex flex-col items-center justify-center">
                        {option.text}
                        <br />
                        <span className="text-sm text-gray-600">
                          (Santé: {option.healthChange}, Argent:{" "}
                          {option.moneyChange}, Karma: {option.karmaChange})
                        </span>
                      </span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
