import { User } from "@/app/page";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Définition du type pour une question
type Question = {
  id: number;
  text: string;
  options: string[];
};

// Props du composant
type QuestionReponseProps = {
  user: User;
  setUser: (user: User) => void;
};

export default function QuestionReponse({
  user,
  setUser,
}: QuestionReponseProps) {
  // État pour gérer les questions et la question courante
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Fonction pour générer de nouvelles questions
  const generateQuestions = () => {
    const newQuestions: Question[] = [
      {
        id: 1,
        text: "Un papillon approche, que compte tu faire ?",
        options: [
          "Regarder les autres papillons",
          "Toucher un des papillons",
          "Ne rien faire",
        ],
      },
      {
        id: 2,
        text: "Question 2 ?",
        options: ["Option 1", "Option 2", "Option 3"],
      },
      {
        id: 3,
        text: "Question 3 ?",
        options: ["Option 1", "Option 2", "Option 3"],
      },
    ];
    setQuestions(newQuestions);
  };

  // Effet pour générer les questions au chargement
  useEffect(() => {
    generateQuestions();
  }, []);

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
        {/* Nouvelle barre de progression avec SVG */}
        <div className="w-full h-4 relative mb-6 mt-10 flex items-center justify-center">
          <div className="flex items-center justify-center w-full max-w-4xl relative">
            {/* Icône tétine à gauche */}
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

            {/* Icône RIP à droite */}
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
          {questions.length > 0 && (
            <div className="flex flex-col items-center space-y-16">
              <h2 className="text-4xl font-regular">
                {questions[currentQuestionIndex].text}
              </h2>
            </div>
          )}
        </div>
        <div>
          {questions.length > 0 && (
            <div className="flex flex-col items-center space-y-16">
              <div className="flex flex-col space-y-8">
                <div className="flex flex-row gap-6">
                  {questions[currentQuestionIndex].options.map(
                    (option, index) => (
                      <motion.div
                        key={index}
                        className="cursor-pointer relative pb-2 border-t-0 text-xl text-black rounded-[20px] shadow-[inset_0_0_0_4px_black] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0 w-[280px] h-[100px]"
                        variants={{
                          initial: { paddingBottom: "15px" },
                          hover: {
                            scale: 1.05,
                            transition: { type: "spring", stiffness: 300 },
                          },
                        }}
                        initial="initial"
                        whileHover="hover"
                        onClick={() => {
                          if (currentQuestionIndex < questions.length - 1) {
                            setCurrentQuestionIndex((prev) => prev + 1);
                          }
                        }}
                      >
                        <motion.button
                          className="relative w-full h-[85px] px-6 text-xl text-black rounded-[20px] border-4 border-black transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 bg-[#F1F1F1] before:rounded-[20px] break-words flex items-center justify-center"
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
                            {option}
                          </span>
                        </motion.button>
                      </motion.div>
                    )
                  )}
                </div>

                {/* Bouton Reload aligné */}
                <motion.div
                  className="cursor-pointer relative pb-2 border-t-0 text-xl text-black rounded-full shadow-[inset_0_0_0_4px_black] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-full active:translate-y-[15px] active:before:translate-y-0 self-center"
                  variants={{
                    initial: { paddingBottom: "15px" },
                    hover: {
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 300 },
                    },
                  }}
                  initial="initial"
                  whileHover="hover"
                  onClick={generateQuestions}
                >
                  <motion.button
                    className="relative p-4 text-xl text-black rounded-full border-4 border-black transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 bg-[#F1F1F1] before:rounded-full flex items-center justify-center w-[64px] h-[64px]"
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
                    <Image
                      src="/Reload.svg"
                      alt="Reload"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
