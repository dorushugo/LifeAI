import { z } from "zod";
import { generateObject } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createOllama } from "ollama-ai-provider";

const ollama = createOllama({
  baseURL: "http://localhost:11434/api",
});

// Nouvelle fonction helper pour les phases d'âge
const getAgePhase = (age: number) => {
  if (age < 5)
    return {
      instructions: `Phase Nourrisson (0-5 ans) :
    - Décisions familiales simples
    - Apprentissage des bases (marche, langage)
    - Conséquences temporaires uniquement
    Exemple : Choix alimentaires, activités ludiques`,
      example: `{
        "healthChange": 1,
        "moneyChange": 0,
        "karmaChange": 0,
        "psychologicalProfile": "Éveillé",
        "message": "Tes parents te proposent une activité...",
        "question": {
          "text": "Que préfères-tu faire ?",
          "options": [
            {"text": "Dessiner avec maman", "effect": "+1 créativité"},
            {"text": "Jouer au ballon", "effect": "+1 coordination"}
          ]
        }
      }`,
    };

  if (age >= 6 && age < 10)
    return {
      instructions: `Phase Enfance (6-10 ans) :
    - Premières interactions sociales
    - Découverte scolaire basique
    - Conséquences limitées à 3 ans
    Exemple : Amitiés, choix de loisirs`,
      example: `{
        "healthChange": 0,
        "moneyChange": 0,
        "karmaChange": 1,
        "psychologicalProfile": "Sociable",
        "message": "Un nouveau copain te propose...",
        "question": {
          "text": "Comment réagis-tu ?",
          "options": [
            {"text": "Accepter son invitation", "effect": "+2 social"},
            {"text": "Rester lire seul", "effect": "+1 connaissances"}
          ]
        }
      }`,
    };

  if (age >= 10 && age < 15)
    return {
      instructions: `Pré-Adolescence (11-15 ans) :
    - Prise d'autonomie progressive
    - Gestion du temps scolaire/loisirs
    - Conséquences sur 5 ans max
    Exemple : Orientation scolaire, premiers conflits`,
      example: `{
      "healthChange": -1,
      "moneyChange": 2,
      "karmaChange": -1,
      "psychologicalProfile": "Indépendant",
      "message": "Tu veux gérer ton argent de poche...",
      "question": {
        "text": "Que choisis-tu ?",
        "options": [
          {"text": "Économiser", "effect": "+3 argent dans 1 an"},
          {"text": "Acheter un jeu", "effect": "+1 bonheur immédiat"}
        ]
      }
    }`,
    };

  if (age >= 15 && age < 20)
    return {
      instructions: `Phase Adolescence (16-25 ans) :
    - Introduit progressivement les conséquences à long terme
    - Questions sur les études et relations sociales
    - Permet des erreurs avec possibilité de rattrapage`,
      example: `{
      "healthChange": -2,
      "moneyChange": 0,
      "karmaChange": -1,
      "psychologicalProfile": "Rebelle",
      "message": "Tu envisages de quitter l'école...",
      "question": {
        "text": "Que décides-tu ?",
        "options": [
          {"text": "Chercher un travail", "effect": "+3 argent, -2 énergie"},
          {"text": "Continuer les études", "effect": "-2 argent, +3 compétences"}
        ]
      }
    }`,
    };

  if (age >= 20 && age < 25)
    return {
      instructions: `Phase Pré-Adulte (20-25 ans) :
    - Conséquences importantes mais pas définitives
    - Dilemmes complexes sur son avenir
    - Enjeux d'étude et de carrière `,
      example: `{
      "healthChange": -5,
      "moneyChange": 8,
      "karmaChange": -3,
      "psychologicalProfile": "Ambitieux",
      "message": "Tu hésite à quitter l'école pour te lancer dans une activité...",
      "question": {
        "text": "Que décides-tu ?",
        "options": [
          {"text": "Chercher un travail", "effect": "+3 argent, -2 énergie"},
          {"text": "Continuer les études", "effect": "-2 argent, +3 compétences"}
        ]
      }
    }`,
    };

  if (age >= 25)
    return {
      instructions: `Phase Adulte (26+ ans) :
    - Conséquences permanentes et cumulatives
    - Dilemmes complexes avec impacts multiples
    - Enjeux familiaux/professionnels équilibrés`,
      example: `{
      "healthChange": -5,
      "moneyChange": 8,
      "karmaChange": -3,
      "psychologicalProfile": "Ambitieux",
      "message": "Tu reçois une promotion exigeante...",
      "question": {
        "text": "Acceptes-tu ?",
        "options": [
          {"text": "Oui, je me donne à fond", "effect": "+5 argent, -3 santé"},
          {"text": "Non, je privilégie ma famille", "effect": "-2 argent, +4 bonheur"}
        ]
      }
    }`,
    };
};

// Nouvelle structure de données pour les thèmes
const AGE_THEMES: Record<string, [string, string, string, string, string]> = {
  "0-5": [
    "Découverte sensorielle",
    "Motricité globale",
    "Premiers mots",
    "Interaction familiale",
    "Routines quotidiennes",
  ],
  "6-10": [
    "Amitiés scolaires",
    "Apprentissage lecture",
    "Activités extrascolaires",
    "Responsabilités basiques",
    "Découverte nature",
  ],
  "11-15": [
    "Autonomie progressive",
    "Gestion temps libre",
    "Argent de poche",
    "Orientation scolaire",
    "Relations sociales",
  ],
  "16-25": [
    "Choix études supérieures",
    "Premier emploi",
    "Vie sentimentale",
    "Indépendance financière",
    "Gestion logement",
  ],
  "26+": [
    "Carrière professionnelle",
    "Vie familiale",
    "Santé long terme",
    "Investissements",
    "Transmission valeurs",
  ],
};

// Nouvelle logique de récupération du thème
const getCurrentTheme = (age: number, interactionIndex: number) => {
  const phase =
    age <= 5
      ? "0-5"
      : age <= 10
      ? "6-10"
      : age <= 15
      ? "11-15"
      : age <= 25
      ? "16-25"
      : "26+";

  return AGE_THEMES[phase][interactionIndex % 5];
};

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
      system: `Salut, tu es un assistant dans le jeu de la vie. 
      
      Thème OBLIGATOIRE : ${getCurrentTheme(
        body.gameState.age,
        body.gameState.interactionCount
      )}
      Interaction : ${(body.gameState.interactionCount % 5) + 1}/5
      
      Règles ABSOLUTES :
      1. Structure de réponse STRICTE :
      {
        "healthChange": number (-10 à 10),
        "moneyChange": number (-10 à 10),
        "karmaChange": number (-10 à 10),
        "psychologicalProfile": string,
        "message": string,
        "question": {
          "text": string,
          "options": EXACTEMENT 2 CHOIX [
            {"text": string, "effect": string},
            {"text": string, "effect": string}
          ]
        }
      }
      
      2. Ne JAMAIS dévier de cette structure
      3. Les valeurs numériques DOIVENT être des nombres
      4. EXACTEMENT 2 options sans exception
      
      Exemple pour le thème "${getCurrentTheme(
        body.gameState.age,
        body.gameState.interactionCount
      )}" :
      ${getAgePhase(body.gameState.age)?.example}`,
      messages: body.messages,
      temperature: 0.3,
      schema: z.object({
        healthChange: z.number().min(-10).max(10),
        moneyChange: z.number().min(-10).max(10),
        karmaChange: z.number().min(-10).max(10),
        psychologicalProfile: z.string(),
        message: z.string(),
        question: z.object({
          text: z.string(),
          options: z
            .array(
              z.object({
                text: z.string(),
                effect: z.string(),
              })
            )
            .length(2),
        }),
      }),
    });

    const structuredOutput = result.object;
    console.log("Résultat structuré:", structuredOutput);

    return NextResponse.json({
      text: structuredOutput.message,
      structuredOutput: {
        healthChange: structuredOutput.healthChange,
        moneyChange: structuredOutput.moneyChange,
        karmaChange: structuredOutput.karmaChange,
        psychologicalProfile: structuredOutput.psychologicalProfile,
        question: structuredOutput.question,
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
