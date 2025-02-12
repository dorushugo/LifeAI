"use client";
import { useState } from "react";
import GenderChoice from "@/app/components/GenderChoice";
import Chat from "@/app/components/chat";
import QuestionReponse from "@/app/components/QuestionReponse";
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";
import Image from "next/image";

export interface User {
  gender: string;
  name: string;
  age: number;
  money: number;
  health: number;
  karma: number;
  time: number;
  interactionCount: number;
  psychologicalProfile: string[];
  socialSkills: number;
  QI: number;
}

export default function Home() {
  const [asStarted, setAsStarted] = useState(false);
  const [user, setUser] = useState<User | null>({
    gender: "",
    name: "",
    age: 0,
    money: 0,
    health: 100,
    karma: 0,
    time: 0,
    interactionCount: 0,
    psychologicalProfile: [],
    socialSkills: 0,
    QI: Math.floor(Math.random() * (120 - 85 + 1)) + 80,
  });

  // Create the clamped setter
  const setUserClamped: React.Dispatch<React.SetStateAction<User | null>> = (
    update
  ) => {
    setUser((prev) => {
      const newUser = typeof update === "function" ? update(prev) : update;
      if (newUser) {
        return {
          ...newUser,
          health: Math.max(0, Math.min(100, newUser.health)),
          karma: Math.max(0, Math.min(100, newUser.karma)),
          age: Math.max(0, Math.min(100, newUser.age)),
          money: Math.max(0, Math.min(10000000000, newUser.money)),
          socialSkills: Math.max(0, Math.min(100, newUser.socialSkills)),
        };
      }
      return newUser;
    });
  };

  // Start Game
  if (!asStarted) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen bg-[#191919] bg-cover bg-center"
        style={{ backgroundImage: "url('/Background.svg')" }}
      >
        <h1 className="text-[#F1F1F1] text-[100px] font-regular">Life.AI</h1>
        <motion.div
          onClick={() => setAsStarted(true)}
          className="cursor-pointer mt-20 relative pb-2 border-t-0 text-2xl text-white rounded-[20px] shadow-[inset_0_0_0_4px_white] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0"
          variants={{
            initial: { paddingBottom: "15px" },
            hover: {
              scale: 1.05,
              transition: { type: "spring", stiffness: 300 },
            },
          }}
          initial="initial"
          whileHover="hover"
        >
          <motion.button
            className="relative px-16 py-2 text-2xl text-white rounded-[20px] border-4 border-white transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 bg-[#191919] before:rounded-[20px]"
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
            Commencer
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (
    user?.gender === null ||
    user?.gender === undefined ||
    user?.gender === ""
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <GenderChoice user={user} setUser={setUserClamped} />
      </div>
    );
  }

  // Game Over
  if (user?.health <= 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen bg-[#191919]"
        style={{ backgroundImage: "url('/Background.svg')" }}
      >
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-white text-[100px] pb-[61px]">Game Over</h1>
          <Image src="/GameOver.svg" alt="Game Over" width={144} height={144} />

          <motion.div
            onClick={() => (window.location.href = "/")}
            className="cursor-pointer mt-20 relative pb-2 border-t-0 text-2xl text-white rounded-[20px] shadow-[inset_0_0_0_4px_white] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0"
            variants={{
              initial: { paddingBottom: "15px" },
              hover: {
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 },
              },
            }}
            initial="initial"
            whileHover="hover"
          >
            <motion.button
              className="relative px-16 py-2 text-2xl text-white rounded-[20px] border-4 border-white transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 bg-[#191919] before:rounded-[20px]"
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
              Recommencer
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Victory
  if (user?.age >= 100) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F1F1F1]">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-[#191919] text-[100px] pb-[61px] font-regular text-center max-w-[70%]">
            Bien joué, t&apos;as réussis le jeu de la vie ! Mais...
          </h1>
          <Image
            src="/Victory.svg"
            alt="Victoire"
            width={300}
            height={186.49}
          />

          <motion.div
            onClick={() => (window.location.href = "Error.html")}
            className="cursor-pointer mt-20 relative pb-2 border-t-0 text-2xl text-[#191919] rounded-[20px] shadow-[inset_0_0_0_4px_#191919] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0"
            variants={{
              initial: { paddingBottom: "15px" },
              hover: {
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 },
              },
            }}
            initial="initial"
            whileHover="hover"
          >
            <motion.button
              className="relative px-16 py-2 text-2xl text-[#191919] rounded-[20px] border-4 border-[#191919] transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] bg-[#F1F1F1]"
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
              Continuer avec le jeu de la mort ?
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={user} className="flex-shrink-0" />
      <div className="flex-1 overflow-auto">
        <QuestionReponse user={user} setUser={setUserClamped} />
      </div>
    </div>
  );
}
