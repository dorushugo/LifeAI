import { z } from "zod";
import { generateObject } from "ai";
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

    const result = await generateObject({
      model: ollama("mistral"),
      system: `Salut, tu es un assistant dans le jeu de la vie. Ton rôle est de:
      - Donner un message narratif
      - Modifier la santé en fonction de l'action de l'utilisateur (la valeur peux aller de -10 minimum à 10 maximum peut importe à quel point l'utilisateur a été mauvais ou bon)
      - Modifier le score en fonction de l'action de l'utilisateur (la valeur peux aller de -10 minimum à 10 maximum peut importe à quel point l'utilisateur a été mauvais ou bon)
      - Déterminer la prochaine scène en fonction de l'action de l'utilisateur
      Réponds UNIQUEMENT en format JSON structuré, ne dépasse pas les limites négatives ou positives.

      Voici des exemples de réponses:

      Exemple de soin : 
      {
        "healthChange": 3,
        "scoreChange": 5,
        "message": "L'utilisateur a mangé une pomme et gagné 3 points de santé et 5 points de score.",
        "nextScene": "Sieste de digestion"
      }

      Exemple de gros soin : 
      {
        "healthChange": 10,
        "scoreChange": 10,
        "message": "L'utilisateur a été soigné et a gagné 10 points de santé et 10 points de score.",
        "nextScene": "Sieste de digestion"
      }

      Exemple de blessure : 
      {
        "healthChange": -2,
        "scoreChange": -3,
        "message": "L'utilisateur c'est foulé une cheville et a perdu 2 points de santé et 3 points de score.",
        "nextScene": "Rendez-vous au médecin"
      }

      Exemple de grosse blessure : 
      {
        "healthChange": -10,
        "scoreChange": -10,
        "message": "L'utilisateur a été blessé gravement et a perdu 10 points de santé et 10 points de score.",
        "nextScene": "Hôpital"
      }


      
      
      `,
      messages: body.messages,
      schema: z.object({
        healthChange: z
          .number()
          .min(-10)
          .max(10)
          .default(0)
          .describe(
            "Modification de la santé en fonction de l'action de l'utilisateur (la valeur peux aller de -10 minimum à 10 maximum)"
          ),
        scoreChange: z
          .number()
          .min(-10)
          .max(10)
          .default(0)
          .describe(
            "Modification du score en fonction de l'action de l'utilisateur (la valeur peux aller de -10 minimum à 10 maximum)"
          ),
        message: z.string().describe("Message narratif de l'assistant"),
        nextScene: z.string().describe("Nom de la prochaine scène du jeu"),
      }),
    });

    const structuredOutput = result.object;
    console.log("Résultat structuré:", structuredOutput);

    return NextResponse.json({
      text: structuredOutput.message,
      structuredOutput: {
        healthChange: structuredOutput.healthChange,
        scoreChange: structuredOutput.scoreChange,
        nextScene: structuredOutput.nextScene,
      },
    });
  } catch (error) {
    console.error("Erreur complète:", error);
    return NextResponse.json(
      { error: "Échec de la génération: " + (error as Error).message },
      { status: 500 }
    );
  }
}
