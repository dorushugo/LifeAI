import { z } from "zod";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createOllama } from "ollama-ai-provider";

const ollama = createOllama({
  baseURL: "http://localhost:11434/api",
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("messages", body.messages);
    console.log("Requête reçue - Corps:", JSON.stringify(body, null, 2));

    const result = await generateText({
      model: ollama("mistral"),
      system:
        "Salut, tu es un assistant dans le jeu de la vie, ton but va être de suivre l'utilisateur dans ses histoires et de l'aider à progresser dans le jeu qui représente une vie entière. Tu peux modifier l'état du jeu en fonction des actions de l'utilisateur, si il fait des actions dangereuses, tu peux lui donner un score de santé négatif, si il fait des actions positives, comme faire du sport, manger bien, investir dans des médicaments ou se reposer, tu peux lui donner un score de santé positif. Tu dois toujours répondre du texte et l'utilisation d'un outil pour modifier l'état du jeu à chaque étape.",
      messages: body.messages,
      maxSteps: 10,
      tools: {
        updateGameState: {
          description:
            "Met à jour l'état du jeu en fonction des actions du joueur",
          parameters: z.object({
            healthChange: z
              .number()
              .min(-10)
              .max(10)
              .optional()
              .describe(
                "Modification de la santé (-10 à 10) en fonction de la dernière action de l'utilisateur"
              ),
            scoreChange: z
              .number()
              .min(-10)
              .max(10)
              .optional()
              .describe(
                "Modification du score (-10 à 10) en fonction de la dernière action de l'utilisateur"
              ),
            nextScene: z
              .string()
              .optional()
              .describe("Prochaine scène du jeu en rapport avec le contexte"),
            nextChoices: z
              .array(z.string())
              .optional()
              .describe(
                "Choix possibles pour la prochaine scène du jeu en rapport avec le contexte"
              ),
          }),
        },
      },
    });

    console.log("Contenu du résultat:", JSON.stringify(result));

    const text = result.text;

    if (!text) {
      console.warn("Aucun texte généré par le modèle.");
      return NextResponse.json({
        messages: [
          {
            role: "assistant",
            content: [
              { type: "text", text: "Je n'ai pas pu générer de réponse." },
            ],
          },
        ],
        toolCalls: result.toolCalls || [],
      });
    }

    const formattedResult = {
      messages: [
        ...body.messages,
        {
          role: "assistant",
          content: [{ type: "text", text }],
        },
      ],
      toolCalls: result.toolCalls || [],
    };

    console.log("Résultat formaté:", JSON.stringify(formattedResult));
    console.log(
      {
        content: [{ type: "text", text }],
        toolCalls: result.toolCalls || [],
        gameState: result.gameState,
      },
      "result"
    );

    return NextResponse.json({
      content: [{ type: "text", text }],
      toolCalls: result.toolCalls || [],
      gameState: result.gameState,
    });
  } catch (error) {
    console.error("Erreur complète:", error);
    return NextResponse.json(
      { error: "Échec de la génération: " + (error as Error).message },
      { status: 500 }
    );
  }
}
