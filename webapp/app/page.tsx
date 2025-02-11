"use client";
import { useState } from "react";
import GenderChoice from "@/app/components/GenderChoice";
import Chat from "@/app/components/chat";
import QuestionReponse from "@/app/components/QuestionReponse";

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
