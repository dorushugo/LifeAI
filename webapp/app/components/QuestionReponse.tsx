import { User } from "@/app/page";

export default function QuestionReponse({
  user,
  setUser,
}: {
  user: User;
  setUser: (user: User) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white bg-black">
      <p>
        {user.gender === "male" ? "Homme" : "Femme"}, vous avez {user.age} ans.
      </p>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        +1 an
      </button>
    </div>
  );
}
