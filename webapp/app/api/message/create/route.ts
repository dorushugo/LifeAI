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

    const { chatId, content, role } = await req.json();

    if (!chatId || !content || !role) {
      return NextResponse.json(
        { error: "Les champs chatId, content et role sont requis" },
        { status: 400 }
      );
    }
    console.log("chatId", chatId);
    console.log("content", content);
    console.log("role", role);

    const message = await messageQueries.create(chatId, content, role);
    return NextResponse.json(message);
  } catch (error) {
    console.error("Erreur lors de la création du chat:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
