import { User } from "@/app/page";

export default function QuestionReponse({
  user,
  setUser,
}: {
  user: User;
  setUser: (user: User) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-black bg-[#F1F1F1]">
      <p>
        {user.gender === "male" ? "Homme" : "Femme"}, vous avez {user.age} ans.
      </p>
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
        onClick={() => setUser({ ...user, socialSkills: user.socialSkills + 5 })}
      >
        +5 Social Skills
      </button>
      <button
        className="m-2 p-2 bg-blue-500 text-white rounded"
        onClick={() => setUser({ ...user, socialSkills: user.socialSkills - 5 })}
      >
        -5 Social Skills
      </button>
    </div>
  );
}
