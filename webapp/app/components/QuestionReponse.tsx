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

  return (
    <div className="flex flex-col items-center justify-center h-screen text-black bg-[#F1F1F1]">
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
      <div className="w-full h-full p-20 flex flex-col items-center justify-between rounded-lg">
        <div className="w-full h-4 relative mb-6 mt-10 flex items-center justify-center">
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
        <div>
          {isLoading && (
            <div className="text-2xl animate-pulse">
              Chargement de la prochaine question...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-xl">
              Erreur : {(error as Error).message}
            </div>
          )}

          {currentQuestion && (
            <div className="flex flex-col items-center space-y-16">
              <div className="text-2xl italic text-gray-600 max-w-2xl text-center">
                {currentQuestion.structuredOutput.message}
              </div>

              <h2 className="text-4xl font-regular text-center">
                {currentQuestion.structuredOutput.question.text}
              </h2>

              <div className="flex flex-row gap-6">
                {currentQuestion.structuredOutput.question.options.map(
                  (option, index) => (
                    <motion.div
                      key={index}
                      className="cursor-pointer relative pb-2 border-t-0 text-xl text-black rounded-[20px] shadow-[inset_0_0_0_4px_black] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0 w-[280px]"
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
                        className="relative w-full py-2 px-6 text-xl text-black rounded-[20px] border-4 border-black transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 bg-[#F1F1F1] before:rounded-[20px] break-words flex items-center justify-center"
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
                        <span className="block text-center px-2">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
