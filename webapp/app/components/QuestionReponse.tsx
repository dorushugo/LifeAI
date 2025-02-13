import { User } from "@/app/page";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  structuredOutput?: {
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
  const [hasError, setHasError] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: currentQuestion,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["initialQuestion", user?.interactionCount],
    queryFn: async () => {
      setIsNextQuestionLoading(true);
      try {
        const response = await fetch("/api/chat/structured", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameState: user }),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (e) {
        setHasError(true);
        throw e;
      } finally {
        setIsNextQuestionLoading(false);
      }
    },
    onError: (error) => {
      console.error("Erreur API:", error);
      setTimeout(() => setHasError(true), 0); // Décalage pour éviter les conflits d'état
    },
    retry: 0,
    enabled: !!user,
  });

  useEffect(() => {
    if (isQueryLoading) {
      setCurrentTip(
        GAMEPLAY_TIPS[Math.floor(Math.random() * GAMEPLAY_TIPS.length)]
      );
    }
  }, [isQueryLoading]);

  const handleRetry = async () => {
    setHasError(false);
    setIsNextQuestionLoading(true);

    await queryClient.cancelQueries({
      queryKey: ["initialQuestion", user?.interactionCount],
    });

    try {
      await queryClient.refetchQueries({
        queryKey: ["initialQuestion", user?.interactionCount],
        type: "active",
      });
    } catch (e) {
      console.error("Erreur lors du retry:", e);
    } finally {
      setTimeout(() => setIsNextQuestionLoading(false), 1000); // Reset après délai
    }
  };

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
        message: currentQuestion?.structuredOutput?.message,
        context: currentQuestion?.structuredOutput?.question?.text,
        responses: currentQuestion?.structuredOutput?.question?.options,
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
      {hasError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white p-8 rounded-xl text-center space-y-6"
          >
            <h2 className="text-3xl font-bold text-red-600">
              Erreur de connexion
            </h2>

            <motion.button
              onClick={handleRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto"
              disabled={isNextQuestionLoading}
            >
              {isNextQuestionLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🔄
                  </motion.span>
                  Tentative de reconnexion...
                </>
              ) : (
                "Réessayer maintenant"
              )}
            </motion.button>

            <p className="text-sm text-gray-600">
              Code d'erreur: {(error as any)?.code || "UNKNOWN"}
            </p>
          </motion.div>
        </div>
      )}

      {!hasError && (
        <>
          {isNextQuestionLoading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl text-center space-y-4">
                <div className="loading-track">
                  <motion.div
                    className="loading-indicator"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    ⚡ Chargement en cours...
                  </motion.div>
                </div>
                <button
                  onClick={() => {
                    setHasError(true);
                    setIsNextQuestionLoading(false);
                  }}
                  className="text-red-500 underline text-sm"
                >
                  Annuler le chargement
                </button>
              </div>
            </div>
          )}
          <div className="flex-1 w-full flex flex-col items-center justify-center px-4 md:px-20">
            {currentQuestion ? (
              <div className="flex flex-col items-center space-y-8">
                <div className="text-3xl italic text-gray-600 max-w-3xl text-center mb-12">
                  {currentQuestion.structuredOutput?.message}
                </div>

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
                                  transition: {
                                    type: "spring",
                                    stiffness: 400,
                                  },
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

                {currentQuestion.structuredOutput?.question?.text && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0, y: 40, rotateZ: -2 }}
                      animate={{ opacity: 1, y: 0, rotateZ: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 10,
                      }}
                      className="text-5xl font-regular text-center leading-tight"
                    >
                      {currentQuestion.structuredOutput.question.text}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            ) : (
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

          {currentQuestion?.structuredOutput?.question?.options && (
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
        </>
      )}
    </div>
  );
}
