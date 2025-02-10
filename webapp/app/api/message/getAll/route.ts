import { NextResponse } from "next/server";
import { messageQueries } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("session", session);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Le champ chatId est requis" },
        { status: 400 }
      );
    }
    console.log("chatId", id);

    const messages = await messageQueries.getByChatId(id);
    console.log("messages", messages);
    //je veux console.log le content de chaque message
    messages.forEach((message) => {
      console.log("message content", message.content);
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
