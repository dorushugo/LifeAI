"use client";
import Image from "next/image";
import { User } from "@/app/page";

export default function Sidebar({ user }: { user: User | null }) {
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

        <div className="mt-[61px] text-[24px] text-[#F1F1F1] pb-[12px]">
          <p>Profil psychologique :</p>
          <div className="flex items-center space-x-2">
            <Image src="/Cerveau.svg" alt="QI" width={33} height={33} />
            <span className="text-[#F1F1F1] text-[24px]">{user?.QI} de QI</span>
          </div>
          {user?.psychologicalProfile?.length ? (
            <div className="space-y-2 mt-2">
              {user.psychologicalProfile.map((profile, index) => (
                <p
                  key={index}
                  className="text-[20px] italic flex items-left justify-start"
                >
                  • {profile}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[20px] italic mt-2 text-left">
              Aucun profil défini
            </p>
          )}
          {user?.memory?.length ? (
            <div className="space-y-2 mt-2">
              {user.memory.map((memory, index) => (
                <p
                  key={index}
                  className="text-[20px] italic flex items-left justify-start"
                >
                  • {memory}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[20px] italic mt-2 text-left">Aucune mémoire</p>
          )}
        </div>
      </div>
    </div>
  );
}
