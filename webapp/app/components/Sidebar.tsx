"use client";
import Image from "next/image";
import { User } from "@/app/page";

export default function Sidebar({
  user,
  onOpenProfile,
  onOpenMemory,
}: {
  user: User | null;
  onOpenProfile: () => void;
  onOpenMemory: () => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "#191919",
        width: "329px",
        padding: "56px 30px", // 56px haut/bas, 47px gauche/droite
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {user?.gender === "male" ? (
        <Image
          src="/Homme-cercle.svg"
          alt="Male avatar"
          width={212}
          height={212}
        />
      ) : (
        <Image
          src="/Femme-cercle.svg"
          alt="Female avatar"
          width={212}
          height={212}
        />
      )}

      <div className="text-center">
        <h1 className="text-[50px] text-[#F1F1F1]">
          {user?.gender === "male" ? "Roberto" : "Roberta"}{" "}
          {user?.interactionCount}
        </h1>

        <p className="text-[40px] text-[#F1F1F1] -mt-[15px]">{user?.age} ans</p>

        <p className="text-[24px] text-[#F1F1F1] mt-[18px] pb-[61px]">
          {user?.gender === "male" ? "Homme" : "Femme"}
        </p>

        {/* Nouvelle section pour afficher les statistiques */}
        <div className="text-white">
          <ul className="grid grid-cols-2 gap-4">
            <li className="flex items-center space-x-2">
              <Image src="/Coeur.svg" alt="Health" width={33} height={33} />
              <span className="text-[24px]">{user?.health} %</span>
            </li>
            <li className="flex items-center space-x-2">
              <Image src="/Argent.svg" alt="Money" width={33} height={33} />
              <span className="text-[24px]">{user?.money}K</span>
            </li>
            <li className="flex items-center space-x-2">
              <Image
                src="/Social.svg"
                alt="Social Skills"
                width={33}
                height={33}
              />
              <span className="text-[24px]">{user?.socialSkills}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Image src="/Karma.svg" alt="Karma" width={33} height={33} />
              <span className="text-[24px]">{user?.karma}</span>
            </li>
          </ul>
        </div>
        {/* Nouvelle section pour afficher le profil psychologique */}

        <div className="mt-[61px] text-[24px] text-[#F1F1F1] pb-[12px] w-full">
          <div className="flex justify-between items-center mb-4">
            <p>Profil psychologique :</p>
            <button
              onClick={onOpenProfile}
              className="bg-[#F1F1F1] text-black px-4 py-2 rounded-lg text-[20px] hover:bg-gray-300 transition"
            >
              {user?.psychologicalProfile?.length || 0} traits
            </button>
          </div>

          {/* Section mémoire modifiée */}
          <div className="flex justify-between items-center mt-6">
            <p>Mémoires :</p>
            <button
              onClick={onOpenMemory}
              className="bg-[#F1F1F1] text-black px-4 py-2 rounded-lg text-[20px] hover:bg-gray-300 transition"
            >
              {user?.memory?.length || 0} souvenirs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
