import { z } from "zod";
import { generateObject } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createOllama } from "ollama-ai-provider";
import { User } from "@/app/page";

const ollama = createOllama({
  baseURL: "http://localhost:11434/api",
});


// Modifier le schema des options avec des valeurs par défaut explicites
const optionSchema = z.object({
  text: z.string().describe("Texte de l'option"),
  healthChange: z
    .number()
    .min(-100)
    .max(50)
    .default(0)
    .describe(
      "Influence sur la santé, utilise les valeurs négatives pour les effets négatifs et les valeurs positives pour les effets positifs"
    ),
  moneyChange: z
    .number()
    .min(-100000)
    .max(100000)
    .default(0)
    .describe(
      "Influence sur l'argent, utilise les valeurs négatives pour les effets négatifs et les valeurs positives pour les effets positifs"
    ),
  karmaChange: z
    .number()
    .min(-50)
    .max(50)
    .default(0)
    .describe(
      "Influence sur le karma, utilise les valeurs négatives pour les effets négatifs et les valeurs positives pour les effets positifs"
    ),
  socialChange: z
    .number()
    .min(-50)
    .max(50)
    .default(0)
    .describe(
      "Influence sur la sociabilité, utilise les valeurs négatives pour les effets négatifs et les valeurs positives pour les effets positifs"
    ),
  psychologicalProfileChange: z
    .string()
    .optional()
    .default("")
    .describe("Nouveau trait psychologique"),
  memoryChange: z
    .string()
    .optional()
    .default("")
    .describe("Ajout d'un évènement à la mémoire"),
});

// Modifier le schema principal :
const mainSchema = z.object({
  message: z.string().describe("Message contextuel"),
  question: z.object({
    text: z.string().describe("Question principale"),
    options: z.array(optionSchema).length(2),
  }),
});

// ================= GENERATEURS INDIVIDUELS =================

const generateKarmaPrompt = (user: User): string => {
  const karma = user.karma;
  let prompt = `\n\n## INFLUENCE KARMA (${karma}/100)\n`;

  if (karma < -10) {
    prompt +=
      `INFORMATION: L'utilisateur à un score de karma négatif, il est donc plus susceptible pour toi de lui proposer des choix illégaux, des pièges ou des options risquées.\n` +
      `DIRECTIVES:\n` +
      `- Proposer 1 option illégale mais rentable\n` +
      `- Rendre les conséquences morales ambiguës\n` +
      `- ¨Plus de risque de perdre sa famille ou de pedre la vie à cause d'une maladie ou d'un accident mortel\n` +
      `- Cibler les faiblesses liés à cette liste de traits: ${
        user.psychologicalProfile.join(", ") || "Aucune"
      }\n`;
  } else if (karma > 60) {
    prompt +=
      `INFORMATION: L'utilisateur à un score de karma positif, il est donc plus susceptible pour toi de lui proposer des choix légaux, des options éthiques ou des options qui lui permettent de gagner du karma.\n` +
      `DIRECTIVES:\n` +
      `- Inclure 1 option altruiste avec coût personnel\n` +
      `- Créer un dilemme éthique complexe\n`;
  } else {
    prompt += `INFORMATION: L'utilisateur à un score de karma neutre, il est donc plus susceptible pour toi de lui proposer des choix légaux et illégaux, des options éthiques ou pas éthiques, des options qui lui permettent de gagner du karma ou des options qui lui permettent de perdre du karma afin de rendre le jeu plus intéressant et faire évoluer son karma dans les deux sens.\n`;
  }

  return prompt;
};

const generateMoneyPrompt = (user: User): string => {
  const money = user.money;
  let prompt = `\n\n## INFLUENCE ARGENT (${money}€)\n`;

  if (money < 0) {
    prompt +=
      `INFORMATION: L'utilisateur est endetté\n` +
      `DIRECTIVES:\n` +
      `- Proposer 1 option à haut risque financier\n` +
      `- Inclure des pénalités de dette progressives\n`;
  } else if (money > 1000000) {
    prompt +=
      `INFORMATION: L'utilisateur a un capital important\n` +
      `DIRECTIVES:\n` +
      `- Introduire des opportunités d'investissement\n` +
      `- Ajouter des risques de fraude proportionnels\n`;
  } else {
    prompt +=
      `INFORMATION: Situation financière stable\n` +
      `DIRECTIVES:\n` +
      `- Maintenir des options équilibrées\n`;
  }

  return prompt;
};

const generateHealthPrompt = (user: User): string => {
  const health = user.health;
  let prompt = `\n\n## INFLUENCE SANTÉ (${health}/100)\n`;

  if (health < 50) {
    prompt +=
      `INFORMATION: Santé critique\n` +
      `DIRECTIVES:\n` +
      `- Introduire des choix impactant la survie\n`;
      `- Développement maladie grave qui peuvent être mortel qui finira par tuer l'utilisateur\n`;
  } else if (health > 80) {
    prompt +=
      `INFORMATION: Excellente condition physique\n` +
      `DIRECTIVES:\n` +
      `- Proposer des défis sportifs extrêmes\n`;
  } else {
    prompt +=
      `INFORMATION: Santé moyenne\n` +
      `DIRECTIVES:\n` +
      `- Lier santé mentale et physique\n`;
  }

  return prompt;
};

const generateAgePrompt = (user: User): string => {
  const age = user.age;
  let prompt = `\n\n## Le joueur a ${age} ans\n`;
  if (age < 5) {
    prompt +=
      `INFORMATION: Le joueur est au stade du nourrisson\n` +
      `DIRECTIVES:\n` +
      `- Limiter les conséquences, se concentrer sur des questions et des mises en situation qui permettent de créer un profil psychologique\n` +
      `- Faire des options simples et directes\n`;
  } else if (age < 18) {
    prompt +=
      `INFORMATION: Le joueur est au stade de l'age adulte\n` +
      `DIRECTIVES:\n` +
      `- Les choix peuvent avoir des conséquences permanentes\n`;
  } else if (age > 60) {
    prompt +=
      `INFORMATION SUR L'ÂGE DU JOUEUR: Fin de carrière\n` +
      `DIRECTIVES:\n` +
      `- Introduire des enjeux de transmission\n`;
      `- Dévelopepr l'envie de faire des activitées uniques avant de mourir\n`;
  } else {
    prompt +=
      `INFORMATION SUR L'ÂGE DU JOUEUR: Âge actif\n` +
      `DIRECTIVES:\n` +
      `- Augmenter progressivement les enjeux\n`;
      `- Développer positivement ou négativement les thèmes comme la famille, l'amour, les amis\n`;
  }

  return prompt;
};

const generateSocialPrompt = (user: User): string => {
  const social = user.socialSkills;
  let prompt = `\n\n## INFLUENCE SOCIALE (${social}/100)\n`;

  if (social < 30) {
    prompt +=
      `INFORMATION SUR LES CARACTÉRISTIQUES SOCIALES DU JOUEUR: Compétences sociales faibles\n` +
      `DIRECTIVES:\n` +
      `- Proposer des options isolantes\n` +
      `- Ajouter des pénalités sociales cachées\n`;
  } else if (social > 70) {
    prompt +=
      `INFORMATION SUR LES CARACTÉRISTIQUES SOCIALES DU JOUEUR: Grand réseau social\n` +
      `DIRECTIVES:\n` +
      `- Introduire des opportunités relationnelles\n` +
      `- Utiliser le capital social comme ressource\n`;
  } else if (social < 10) {
    prompt +=
      `INFORMATION SUR LES CARACTÉRISTIQUES SOCIALES DU JOUEUR: Grand réseau social\n` +
      `DIRECTIVES:\n` +
      `- Développement de tendances psychopathes\n` +
      `- Utiliser le capital social comme ressource\n`;
  }else {
    prompt +=
      `INFORMATION SUR LES CARACTÉRISTIQUES SOCIALES DU JOUEUR: Réseau social moyen\n` +
      `DIRECTIVES:\n` +
      `- Maintenir un équilibre relations/vie privée\n`;
  }

  return prompt;
};

const generatePsychologyPrompt = (user: User): string => {
  const traits = user.psychologicalProfile;
  console.log("traits", traits);
  let prompt = `\n\n## INFLUENCE PSYCHOLOGIE (${
    traits.join(", ") || "Aucun"
  })\n`;

  if (traits.length === 0) {
    prompt +=
      `INFORMATION SUR LES TRAITS DU JOUEUR: Aucun trait dominant\n` +
      `DIRECTIVES:\n` +
      `- Définir le profil psychologique\n` +
      `- Proposer des options polarisantes\n`;
  } else {
    prompt +=
      `INFORMATION SUR LES TRAITS DU JOUEUR: Traits dominants détectés\n` +
      `DIRECTIVES:\n` +
      `- Renforcer 1 trait existant par option\n` +
      `- Créer des conflits entre traits\n`;
  }

  return prompt;
};

const generateMemoryPrompt = (user: User): string => {
  const memory = user.memory;
  let prompt = `\n\n## INFLUENCE MEMOIRE\n`;

  if (memory.length === 0) {
    prompt +=
      `INFORMATION SUR LE PASSÉ DU JOUEUR: Aucune mémoire particulière\n` +
      `DIRECTIVES:\n` +
      `- Définir le passé du joueur\n` +
      `- Proposer des options qui changent son passé\n`;
  } else {
    prompt +=
      `INFORMATION SUR LES DERNIERS ÉVÈNEMENTS VÉCUS DU JOUEUR, adapte le contexte de tes réponses à partir de cette mémoire, n'utilise pas forcément le contexte surtout si c'est des évènements pas très importants. Par contre il faut absolument se utiliser le contexte lors des choix de carrières, de familles etc : Voici les éléments de mémoire du joueur : ${memory
        .reverse()
        .join(", ")}\n` +
      "COMMENT INTERPRETER LA MÉMOIRE DU JOUEUR: Tu dois faire attention à ne pas trop concentrer l'utilisateur sur un seul sujet. Par exemple si tu vois plusieurs fois des mémoires similaires à la suite, alors change de sujet. La mémoire la plus récente est plus importante que la plus ancienne." +
      `DIRECTIVES DE GÉNÉRATION:\n` +
      `- À chaque option, tu ajoutes un événement en rapport avec le choix\n` +
      `EXEMPLE: Si le joueur crée une entreprise ou une famille, tu ajoute dans la mémoire du joueur "Création d'une entreprise" ou "Mariage" en fonction du choix`;
  }

  return prompt;
};

const generateSchemaRequirements = (): string => {
  return (
    `\n\n## RÈGLES DE GÉNÉRATION DE LA RÉPONSE\n` +
    `1. Les options doivent obéir à ce format :` +
    `{
        message: string;
        question: {
          text: string;
          options: {
            text: string;
            healthChange: number (-100 à +100);
            moneyChange: number (-100 à +100);
            karmaChange: number (-100 à +100);
            socialChange: number (-100 à +100);
            psychologicalProfileChange: string;
            memoryChange: string;
          }[];
        }
      }`
  );
};

// ================= FONCTIONS SIMILAIRES POUR =================
// generateHealthPrompt(), generateAgePrompt(), generateSocialPrompt(),
// generatePsychologyPrompt()...

// ================= COMBINAISON FINALE =================

export const buildMasterPrompt = (user: User): string => {
  let prompt = `ROLE: Tu es un assistant narratif dans un jeu de simulation de vie où le joueur prend des décisions influençant son destin.

**Règles :**
- Décris une situation immersive en fonction de l'âge du joueur.
- Propose **2 choix**, chacun ayant un impact sur les statistiques du joueur (santé, argent, karma, social, psychologie).
- Ajoute des **événements aléatoires** qui rendent le jeu imprévisible, tu peux ajouter des pièges, des opportunités, des évènements qui changent la vie du joueur.
- Formate ta réponse en JSON.
- Met en place des dilemmes moraux percutants avec des conséquences lourdes.
- Rends chaque décision émotionnellement engageante et crédible, en mettant en avant des thématiques comme l'amour, la trahison, la corruption, la survie et l'éthique.
- Les conséquences ne doivent pas être immédiates, certaines doivent se révéler plus tard dans l'histoire.
- Assure-toi que les choix ne soient pas évidents : chaque option doit comporter un risque ou une perte importante.
- Développe des descriptions immersives pour que le joueur ressente le poids de sa décision.
- Pas de retour en arrière possible après un choix.
- Quand tu introduis des personnages secondaires, introduit leur nom et prend soin de le conserver dans la mémoire du joueur.
- Le joueur meurt si il passe en dessous de 0 points de santé, son karma peut aller de -100 à +100, son argent peut aller de -10000000000 à +10000000000, son indice de sociabilité peut aller de -100 à +100.

**Exemple pour un joueur de 10 ans :**
{
  "message": "Un camarade de classe organise une grande fête ce week-end. Tout le monde en parle ! Tu hésites sur quoi faire...",
  "question": {
    "text": "Que décides-tu ?",
    "options": [
      {
        "text": "Y aller et t'amuser",
        "healthChange": -1,
        "moneyChange": -2,
        "karmaChange": 2,
        "socialChange": 3,
        "psychologicalProfileChange": "Sociable",
        "memoryChange": "Le joueur a fait une fête avec ses camarades de classe à l'age de 10 ans"
      },
      {
        "text": "Rester à la maison pour te reposer",
        "healthChange": 2,
        "moneyChange": 0,
        "karmaChange": -1,
        "socialChange": -2,
        "psychologicalProfileChange": "Introverti",
        "memoryChange": "Le joueur a resté à la maison pour se reposer à l'age de 10 ans"
      }
    ]
  }
}`;

  if (user.age < 15) {
    // Mode enfant : focus sur la personnalité
    prompt += `## NOUS SOMMES DANS LE MODE ENFANCE, le personnage du joueur à qui tu t'adresse a ${user.age} ans,n`;
    prompt += `DIRECTIVES SPÉCIALES:\n`;
    prompt += `- Ignorer toutes les stats sauf l'âge et les traits psychologiques\n`;
    prompt += `- Générer des options influençant uniquement le profil psychologique\n`;
    prompt += `- Thèmes: éducation, amitiés, découvertes\n\n`;

    prompt += generateAgePrompt(user);
    prompt += generatePsychologyPrompt(user);

    prompt += generateSchemaRequirements();

    return prompt;
  }

  // Mode normal pour 15+ ans
  prompt += generateKarmaPrompt(user);
  prompt += generateMoneyPrompt(user);
  prompt += generateHealthPrompt(user);
  prompt += generateAgePrompt(user);
  prompt += generateSocialPrompt(user);
  prompt += generatePsychologyPrompt(user);
  prompt += generateMemoryPrompt(user);
  prompt += generateSchemaRequirements();

  return prompt;
};

// Ajouter une fonction de validation renforcée
const validateResponse = (data: unknown) => {
  const result = mainSchema.safeParse(data);
  if (!result.success) {
    console.error("Validation error:", JSON.stringify(result.error, null, 2));
    throw new Error(`Invalid response structure: ${result.error.message}`);
  }
  return result.data;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gameState = body.gameState;

    // Création de l'objet user basé sur le schéma
    const user: User = {
      age: gameState.age,
      health: gameState.health,
      money: gameState.money,
      karma: gameState.karma,
      socialSkills: gameState.social,
      psychologicalProfile: gameState.traits || [],
      gender: gameState.gender,
      name: gameState.name,
      time: gameState.time,
      interactionCount: gameState.interactionCount,
      pendingChanges: gameState.pendingChanges,
      QI: gameState.QI,
      memory: gameState.memory,
    };

    const generatedPrompt =
      buildMasterPrompt(user) +
      `
    
    Règles de réponse :

    1. Respecte le format de réponse STRICTE donnée dans cet exemple:
    {
      "message": "Contexte de la décision",
      "question": {
        "text": "Question principale",
        "options": {
          "text": "Option 1",
          "healthChange": 0,
          "moneyChange": 2,
          "karmaChange": -2,
          "socialChange": 0,
          "psychologicalProfileChange": "Trait 1",
          "memoryChange": "Mémoire associée à l'option 1, tu peux la laisser vide si il n'y a pas d'événement marquent l'histoire du joueur"
        },
        {
          "text": "Option 2",
          "healthChange": 0,
          "moneyChange": 0,
          "karmaChange": 0,
          "socialChange": 0,
          "psychologicalProfileChange": "Trait 2",
          "memoryChange": "Mémoire associée à l'option 2, tu peux la laisser vide si il n'y a pas d'événement marquent l'histoire du joueur"
        }
      }
    }`;

    // Log complet en dev seulement
    if (process.env.NODE_ENV === "development") {
      console.log("\n======= PROMPT COMPLET =======\n");
      console.log(generatedPrompt);
      console.log("\n==============================\n");
    }

    const result = await generateObject({
      model: ollama("llama3.1"),
      prompt: generatedPrompt,
      schema: mainSchema,
      temperature: 0.9, // Réduire encore la créativité
    });

    // Validation stricte
    const validatedData = validateResponse(result.object);

    // Post-traitement garantissant les valeurs
    const structuredOutput = {
      message: validatedData.message,
      question: {
        text: validatedData.question.text,
        options: validatedData.question.options.map((option) => ({
          text: option.text.substring(0, 200), // Limiter la longueur
          healthChange: Math.min(Math.max(option.healthChange, -100), 100),
          moneyChange: Math.min(Math.max(option.moneyChange, -10000), 10000),
          karmaChange: Math.min(Math.max(option.karmaChange, -50), 50),
          socialChange: Math.min(Math.max(option.socialChange, -50), 50),
          psychologicalProfileChange:
            option.psychologicalProfileChange?.substring(0, 20) || "Neutre",
          memoryChange:
            option.memoryChange?.replace(
              /à l'age de \d+ ans/,
              `à ${user.age} ans`
            ) || "",
        })),
      },
    };

    return NextResponse.json({ structuredOutput });
  } catch (error) {
    console.error("\n======= ERREUR =======");
    console.error("Message:", error instanceof Error ? error.message : error);
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");
    console.error("Requête:", req.headers);
    console.error("========================\n");

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Helper pour limiter les valeurs
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value || 0));
