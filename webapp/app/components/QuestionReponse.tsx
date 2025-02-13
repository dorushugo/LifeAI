import { User } from "@/app/page";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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

export default function QuestionReponse({
  user,
  setUser,
}: QuestionReponseProps) {
  // État pour gérer les questions et la question courante
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentRating, setCurrentRating] = useState<number>(0);

  const {
    data: currentQuestion,
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ["initialQuestion", user?.interactionCount],
    queryFn: async () => {
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
  });

  const handleOptionClick = (option: OptionType) => {
    const newUser = {
      ...user,
      health: user.health + option.healthChange,
      money: user.money + option.moneyChange,
      karma: user.karma + option.karmaChange,
      socialSkills: user.socialSkills + option.socialChange,
      psychologicalProfile: [
        ...user.psychologicalProfile.filter(
          (word) => word !== option.psychologicalProfileChange
        ),
        option.psychologicalProfileChange,
      ].slice(0, 6),
      // Ajout de la mémoire uniquement si elle n'est pas vide
      memory: [
        ...user.memory,
        ...(option.memoryChange ? [option.memoryChange] : []),
      ].slice(-20), // Garde les 20 dernières mémoires
      interactionCount: user.interactionCount + 1,
    };

    // Vieillissement tous les 5 choix
    if (newUser.interactionCount % 5 === 0) {
      newUser.age += 5;
    }

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
      <div className="absolute top-0 left-200 flex flex-row items-center justify-center">
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() => setUser({ ...user, age: user.age + 1 })}
        >
          +1 an
        </button>
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() => setUser({ ...user, age: user.age + 100 })}
        >
          +100 ans
        </button>
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() => setUser({ ...user, health: user.health + 5 })}
        >
          +5 Health
        </button>
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() => setUser({ ...user, health: user.health - 5 })}
        >
          -5 Health
        </button>
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() => setUser({ ...user, money: user.money + 5 })}
        >
          +5 Money
        </button>
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() => setUser({ ...user, money: user.money - 5 })}
        >
          -5 Money
        </button>
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() => setUser({ ...user, karma: user.karma + 5 })}
        >
          +5 Karma
        </button>
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() =>
            setUser({ ...user, socialSkills: user.socialSkills + 5 })
          }
        >
          +5 Social Skills
        </button>
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded"
          onClick={() =>
            setUser({ ...user, socialSkills: user.socialSkills - 5 })
          }
        >
          -5 Social Skills
        </button>
      </div>

      {/* Section supérieure - Barre de progression */}
      <div className="w-full h-[100px] mt-10 flex items-center justify-center">
        <div className="w-full h-4 relative flex items-center justify-center">
          <div className="flex items-center justify-center w-full max-w-4xl relative">
            <Image
              src="/Tetine.svg"
              alt="Tetine"
              width={60}
              height={41}
              className="absolute -left-8 z-10"
            />

            <div className="w-full mx-12">
              <div
                className="relative w-full"
                style={{ paddingTop: `${(37 / 1135) * 100}%` }}
              >
                <Image
                  src="/Progressbar.svg"
                  alt="Progress bar background"
                  fill
                  className="object-contain"
                  priority
                />
                <div
                  className="absolute top-1 left-[4px] bottom-1 bg-black transition-all rounded-[20px] rounded-r-none"
                  style={{
                    width: `${Math.min(
                      Math.max((user.age / 100) * 100, 0),
                      98
                    )}%`,
                  }}
                />
              </div>
            </div>

            <Image
              src="/rip.svg"
              alt="RIP"
              width={59}
              height={41}
              className="absolute -right-8 z-10"
            />
          </div>
        </div>
      </div>

      {/* Section centrale - Question et texte */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-20">
        {currentQuestion && (
          <div className="flex flex-col items-center space-y-8">
            <div className="text-3xl italic text-gray-600 max-w-3xl text-center mb-12">
              {currentQuestion.structuredOutput.message}
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-xl text-gray-600">Notez cette réponse :</p>
              <div className="flex gap-4">
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
              <button
                disabled={!currentRating}
                onClick={submitRating}
                className="mt-4 p-2 bg-green-500 text-white rounded disabled:opacity-50"
              >
                Valider la notation
              </button>
            </div>

            <h2 className="text-5xl font-regular text-center leading-tight">
              {currentQuestion.structuredOutput.question.text}
            </h2>
          </div>
        )}
      </div>

      {/* Section inférieure - Réponses */}
      <div className="w-full flex items-start justify-center px-20 pb-20">
        {currentQuestion && (
          <div className="flex flex-row gap-8">
            {currentQuestion.structuredOutput.question.options.map(
              (option, index) => (
                <motion.div
                  key={index}
                  className="cursor-pointer relative pb-2 border-t-0 text-2xl text-black rounded-[20px] shadow-[inset_0_0_0_4px_black] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0 w-[320px] flex flex-col"
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
                    className="relative w-full flex-1 py-2 px-6 text-xl text-black rounded-[20px] border-4 border-black transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 bg-[#F1F1F1] before:rounded-[20px] break-words flex items-center justify-center"
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
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
