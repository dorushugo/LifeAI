"use client";
import { useState } from "react";
import GenderChoice from "@/app/components/GenderChoice";
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
  pendingChanges: {
    health: number;
    money: number;
    karma: number;
    psychologicalProfileChanges: string[];
  };
  memory: string[];
}

// Ajouter le type PopupModal
const PopupModal = ({
  title,
  items,
  onClose,
}: {
  title: string;
  items: string[];
  onClose: () => void;
}) => (
  <div className="fixed right-0 flex max-w-xl items-center justify-center h-full bg-black bg-opacity z-[9999]">
    <div className="bg-dark p-8 h-full max-w-2xl w-[90%] max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <button
          onClick={onClose}
          className="text-white text-4xl hover:text-gray-600 transition-transform hover:scale-110"
        >
          &times;
        </button>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="text-xl text-white">
            • {item}
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-white italic">Aucun élément à afficher</p>
        )}
      </ul>
    </div>
  </div>
);

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
    pendingChanges: {
      health: 0,
      money: 0,
      karma: 0,
      psychologicalProfileChanges: [],
    },
    memory: [],
  });

  // Ajouter les états pour les popups
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isMemoryPopupOpen, setIsMemoryPopupOpen] = useState(false);

  // Ajouter un état pour la sidebar mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
          karma: Math.max(-100, Math.min(100, newUser.karma)),
          age: Math.max(0, Math.min(100, newUser.age)),
          money: Math.max(-100000000000, Math.min(10000000000, newUser.money)),
          socialSkills: Math.max(-100, Math.min(100, newUser.socialSkills)),
        };
      }
      return newUser;
    });
  };

  // Modifier les handlers pour fermer l'autre popup
  const handleOpenProfile = () => {
    setIsMemoryPopupOpen(false);
    setIsProfilePopupOpen(true);
  };

  const handleOpenMemory = () => {
    setIsProfilePopupOpen(false);
    setIsMemoryPopupOpen(true);
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
      {/* Bouton mobile pour la sidebar */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-[#191919] rounded-full shadow-lg"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar modifiée pour mobile */}
      <div
        className={`fixed md:relative z-40 h-full transform transition-transform duration-300 
        ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar
          user={user}
          className="flex-shrink-0"
          onOpenProfile={handleOpenProfile}
          onOpenMemory={handleOpenMemory}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Overlay pour mobile */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 overflow-auto">
        <QuestionReponse user={user} setUser={setUserClamped} />
      </div>

      {/* Popups au niveau racine */}
      {isProfilePopupOpen && (
        <PopupModal
          title="Profil psychologique"
          items={user?.psychologicalProfile || []}
          onClose={() => setIsProfilePopupOpen(false)}
        />
      )}

      {isMemoryPopupOpen && (
        <PopupModal
          title="Mémoires"
          items={user?.memory || []}
          onClose={() => setIsMemoryPopupOpen(false)}
        />
      )}
    </div>
  );
}
