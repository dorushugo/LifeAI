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
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1>Gender choice</h1>
      <div className="flex flex-row items-center justify-center">
        <Image
          onClick={() => setUser({ ...user, gender: "male" })}
          src="Homme.svg"
          alt="man"
          width={100}
          height={100}
          className="cursor-pointer"
        />
        <Image
          onClick={() => setUser({ ...user, gender: "female" })}
          src="Femme.svg"
          alt="woman"
          width={100}
          height={100}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
