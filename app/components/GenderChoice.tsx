import { User } from "@/app/page";
import Image from "next/image";

export default function GenderChoice({
  user,
  setUser,
}: {
  user: User | null;
  setUser: (user: User) => void;
}) {
  // on va avoir un sélecteur avec deux images, une d'un homme, une d'une femme, quand on clique dessus on change le gender.
  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-[#191919] bg-cover bg-center w-full"
      style={{ backgroundImage: "url('/Background.svg')" }}
    >
      <h1 className="text-[100px] font-regular mb-[99px] text-[#F1F1F1]">
        Tu es ?
      </h1>

      <div className="flex flex-row items-center justify-center gap-x-[99px]">
        <Image
          onClick={() => setUser({ ...user, gender: "male" })}
          src="Homme.svg"
          alt="man"
          width={100}
          height={100}
          className="cursor-pointer transition-transform duration-300 hover:scale-110"
        />
        <Image
          onClick={() => setUser({ ...user, gender: "female" })}
          src="Femme.svg"
          alt="woman"
          width={100}
          height={100}
          className="cursor-pointer transition-transform duration-300 hover:scale-110"
        />
      </div>
    </div>
  );
}
