import { NextResponse } from "next/server";
import { chatQueries } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("session", session);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Le champ userId est requis" },
        { status: 400 }
      );
    }
    console.log("userId", userId);

    const chats = await chatQueries.getAllByUserId(userId);
    console.log("chats", chats);
    //je veux console.log le content de chaque message
    chats.forEach((chat) => {
      console.log("chat content", chat.name);
    });
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
