import { z } from "zod";
import { generateObject } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createOllama } from "ollama-ai-provider";
import { User } from "@/app/page";

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
        "message": "Tes parents te proposent une activité...",
        "question": {
          "text": "Que préfères-tu faire ?",
          "options": [
            {
              "text": "Dessiner avec maman",
              "healthChange": 1,
              "moneyChange": 0,
              "karmaChange": 0,
              "socialChange": 2,
              "psychologicalProfileChange": "Créatif"
            },
            {
              "text": "Jouer au ballon",
              "healthChange": 2,
              "moneyChange": 0,
              "karmaChange": 1,
              "socialChange": 1,
              "psychologicalProfileChange": "Sportif"
            }
          ]
        }
      }`,
    };

  if (age >= 6 && age < 10)
    return {
      instructions: `Phase Nourrisson (0-5 ans) :
        - Décisions familiales simples
        - Apprentissage des bases (marche, langage)
        - Conséquences temporaires uniquement
        Exemple : Choix alimentaires, activités ludiques`,
      example: `{
            "message": "Un camarade de classe t'invite à son anniversaire...",
            "question": {
              "text": "Comment réagis-tu ?",
              "options": [
                {
                  "text": "Accepter avec enthousiasme",
                  "healthChange": -1,
                  "moneyChange": -2,
                  "karmaChange": 2,
                  "socialChange": 3,
                  "psychologicalProfileChange": "Sociable"
                },
                {
                  "text": "Préférer rester à la maison",
                  "healthChange": 1,
                  "moneyChange": 0,
                  "karmaChange": -1,
                  "socialChange": -2,
                  "psychologicalProfileChange": "Solitaire"
                }
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
      "message": "Tu dois choisir une activité extrascolaire...",
      "question": {
        "text": "Quelle option choisis-tu ?",
        "options": [
          {
            "text": "Club de sciences",
            "healthChange": 0,
            "moneyChange": -1,
            "karmaChange": 1,
            "socialChange": 1,
            "psychologicalProfileChange": "Intellectuel"
          },
          {
            "text": "Équipe sportive",
            "healthChange": 2,
            "moneyChange": -2,
            "karmaChange": 0,
            "socialChange": 2,
            "psychologicalProfileChange": "Compétitif"
          }
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
      "message": "Tu dois choisir ton orientation professionnelle...",
      "question": {
        "text": "Quelle voie suits-tu ?",
        "options": [
          {
            "text": "Université prestigieuse",
            "healthChange": -3,
            "moneyChange": -5,
            "karmaChange": 2,
            "socialChange": 1,
            "psychologicalProfileChange": "Ambitieux"
          },
          {
            "text": "Formation professionnelle",
            "healthChange": 1,
            "moneyChange": 2,
            "karmaChange": -1,
            "socialChange": 3,
            "psychologicalProfileChange": "Pragmatique"
          }
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
      "psychologicalProfile": "Rebelle",
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
      "message": "Tu reçois une offre de travail à l'étranger...",
      "question": {
        "text": "Acceptes-tu ?",
        "options": [
          {
            "text": "Oui, nouvelle aventure",
            "healthChange": -2,
            "moneyChange": 4,
            "karmaChange": -1,
            "socialChange": -3,
            "psychologicalProfileChange": "Aventurier"
          },
          {
            "text": "Non, rester près des miens",
            "healthChange": 2,
            "moneyChange": -1,
            "karmaChange": 2,
            "socialChange": 2,
            "psychologicalProfileChange": "Famille"
          }
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

// Modifier le schema des options :
const optionSchema = z.object({
  text: z.string().describe("Texte de l'option"),
  healthChange: z.number().min(-5).max(5),
  moneyChange: z.number().min(-5).max(5),
  karmaChange: z.number().min(-5).max(5),
  socialChange: z.number().min(-5).max(5),
  psychologicalProfileChange: z
    .string()
    .describe("Mot clé psychologique à ajouter/enlever"),
});

// Modifier le schema principal :
const mainSchema = z.object({
  message: z.string().describe("Message contextuel"),
  question: z.object({
    text: z.string().describe("Question principale"),
    options: z.array(optionSchema).min(2).max(6),
  }),
});

// ================= GENERATEURS INDIVIDUELS =================

const generateKarmaPrompt = (user: User): string => {
  const karma = user.karma;
  let prompt = `\n\n## INFLUENCE KARMA (${karma}/100)\n`;

  if (karma < -30) {
    prompt +=
      `INFORMATION: L'utilisateur à un score de karma négatif, il est donc plus susceptible pour toi de lui proposer des choix illégaux, des pièges ou des options risquées.\n` +
      `DIRECTIVES:\n` +
      `- Proposer 1 option illégale mais rentable\n` +
      `- Rendre les conséquences morales ambiguës\n` +
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

  if (health < 30) {
    prompt +=
      `INFORMATION: Santé critique\n` +
      `DIRECTIVES:\n` +
      `- Introduire des choix impactant la survie\n`;
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
      `- Faire des options simples et directes\n` +
      `- Faire des options qui ne changent pas grand chose à la vie du joueur et qui correspondent à son âge\n`;
  } else if (age < 18) {
    prompt +=
      `INFORMATION: Le joueur est au stade de l'age adulte\n` +
      `DIRECTIVES:\n` +
      `- Limiter les conséquences permanentes\n`;
  } else if (age > 60) {
    prompt +=
      `INFORMATION SUR L'ÂGE DU JOUEUR: Fin de carrière\n` +
      `DIRECTIVES:\n` +
      `- Introduire des enjeux de transmission\n`;
  } else {
    prompt +=
      `INFORMATION SUR L'ÂGE DU JOUEUR: Âge actif\n` +
      `DIRECTIVES:\n` +
      `- Augmenter progressivement les enjeux\n`;
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
  } else {
    prompt +=
      `INFORMATION SUR LES CARACTÉRISTIQUES SOCIALES DU JOUEUR: Réseau social moyen\n` +
      `DIRECTIVES:\n` +
      `- Maintenir un équilibre relations/vie privée\n`;
  }

  return prompt;
};

const generatePsychologyPrompt = (user: User): string => {
  const traits = user.psychologicalProfile;
  let prompt = `\n\n## INFLUENCE PSYCHOLOGIE (${
    traits.join(", ") || "Aucun"
  })\n`;

  if (traits.length === 0) {
    prompt +=
      `INFORMATION SUR LES TRAITS DU JOUEUR: Aucun trait dominant\n` +
      `DIRECTIVES:\n` +
      `- Définir le profil psychologique\n`;
  } else {
    prompt +=
      `INFORMATION SUR LES TRAITS DU JOUEUR: Traits dominants détectés\n` +
      `DIRECTIVES:\n` +
      `- Renforcer 1 trait existant par option\n` +
      `- Créer des conflits entre traits\n`;
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
            healthChange: number (-5 à +5);
            moneyChange: number (-5 à +5);
            karmaChange: number (-5 à +5);
            socialChange: number (-5 à +5);
            psychologicalProfileChange: string;
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
  let prompt = `ROLE: Tu est un maître de jeu pour un jeu de la vie. Tu accompagne l'utilisateur dans ses décisions tout le long de sa vie, chaque fois qu'on t'utilise tu recois des informations sur les stats de l'utilisateur et tu dois générer des questions adaptées en fonction du profil de l'utilisateur.\n\n`;

  if (user.age < 15) {
    // Mode enfant : focus sur la personnalité
    prompt += `## NOUS SOMMES DANS LE MODE ENFANCE, le personnage du joueur à qui tu t'adresse a ${user.age} ans,n`;
    prompt += `DIRECTIVES SPÉCIALES:\n`;
    prompt += `- Ignorer toutes les stats sauf l'âge et les traits psychologiques\n`;
    prompt += `- Générer des options influençant uniquement le profil psychologique\n`;
    prompt += `- Thèmes: éducation, amitiés, découvertes\n\n`;

    prompt += generateAgePrompt(user);
    prompt += generatePsychologyPrompt(user);

    return prompt;
  }

  // Mode normal pour 15+ ans
  prompt += generateKarmaPrompt(user);
  prompt += generateMoneyPrompt(user);
  prompt += generateHealthPrompt(user);
  prompt += generateAgePrompt(user);
  prompt += generateSocialPrompt(user);
  prompt += generatePsychologyPrompt(user);

  // Règles croisées
  prompt += `\n\n## INTERACTIONS COMPLEXES\n`;
  prompt +=
    `1. COMBINAISON ÂGE/KARMA:\n` +
    `- Si âge > 50 & karma < 0: Proposer des options de rédemption\n` +
    `- Si âge < 30 & karma > 50: Introduire des tentations\n`;

  prompt +=
    `2. SANTÉ/ARGENT:\n` +
    `- Santé < 30 & Argent < 0: Options extrêmes (organes, crimes)\n` +
    `- Santé > 80 & Argent > 1M: Risques calculés (sports dangereux)\n`;

  // Exemple contextuel

  return prompt;
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
    };

    const generatedPrompt =
      buildMasterPrompt(user) +
      `
    
    Règles de réponse :

    1. Respecte le format de réponse en JSON comme dans cet exemple:
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
          "psychologicalProfileChange": "Trait 1"
        },
        {
          "text": "Option 2",
          "healthChange": 0,
          "moneyChange": 0,
          "karmaChange": 0,
          "socialChange": 0,
          "psychologicalProfileChange": "Trait 2"
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
      model: ollama("deepseek-r1:14b"),
      prompt: generatedPrompt,
      temperature: 0, // Plus créatif
      schema: mainSchema,
    });

    // Log de la réponse
    console.log("\n======= RÉPONSE IA =======");
    console.log("Données:", JSON.stringify(result.object, null, 2));
    console.log("=========================\n");

    // Post-traitement des résultats
    const structuredOutput = result.object;
    structuredOutput.question.options = structuredOutput.question.options
      .slice(0, 2) // Garder seulement 2 options
      .map((option) => ({
        ...option,
        // Normalisation des valeurs
        healthChange: clamp(option.healthChange, -5, 5),
        moneyChange: clamp(option.moneyChange, -5, 5),
        karmaChange: clamp(option.karmaChange, -5, 5),
        socialChange: clamp(option.socialChange, -5, 5),
      }));

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
