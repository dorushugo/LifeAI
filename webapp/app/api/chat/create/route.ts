import { NextResponse } from "next/server";
import { chatQueries } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { title } = await req.json();
    if (!title) {
      return NextResponse.json(
        { error: "Le titre est requis" },
        { status: 400 }
      );
    }

    const chat = await chatQueries.create(session.user.id, title);
    return NextResponse.json(chat);
  } catch (error) {
    console.error("Erreur lors de la création du chat:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
