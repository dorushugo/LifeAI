"use client";
import { useState } from "react";
import GenderChoice from "@/app/components/GenderChoice";
import Chat from "@/app/components/chat";
import QuestionReponse from "@/app/components/QuestionReponse";
import { motion } from "framer-motion";

export interface User {
  gender: string;
  name: string;
  age: number;
  money: number;
  health: number;
  karma: number;
  time: number;
  interactionCount: number;
  psychologicalProfile: string;
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
    psychologicalProfile: "",
  });

  if (!asStarted) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen bg-[#191919] bg-cover bg-center"
        style={{ backgroundImage: "url('/Background.svg')" }}
      >
        <h1 className="text-[#F1F1F1] text-[100px] font-regular">Life.AI</h1>
        <motion.div
          className="relative pb-2 border-t-0 text-2xl text-white  rounded-[20px] shadow-[inset_0_0_0_4px_white]  transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 before:rounded-[20px] active:translate-y-[15px] active:before:translate-y-0"
          initial={{ paddingBottom: "0.5rem" }}
          whileHover={{
            paddingBottom: "1.5rem",
            transition: { type: "spring", stiffness: 300 },
          }}
        >
          <motion.button
            onClick={() => setAsStarted(true)}
            className="relative px-16 py-2 text-2xl text-white  rounded-[20px] border-4 border-white transition-colors duration-200 before:absolute before:content-[''] before:inset-0 before:translate-y-[15px] before:-z-10 bg-[#191919] before:rounded-[20px]"
            initial={{ y: 0 }}
            whileHover={{
              scale: 1.05,
              y: -15,
              transition: { type: "spring", stiffness: 400 },
            }}
            whileTap={{
              scale: 0.95,
              y: 0,
              transition: { type: "spring", stiffness: 400 },
            }}
          >
            Débuter
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
        <GenderChoice user={user} setUser={setUser} />
      </div>
    );
  }
  return <QuestionReponse user={user} setUser={setUser} />;
}
