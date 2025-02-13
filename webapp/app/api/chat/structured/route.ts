import { z } from "zod";
import { generateObject } from "ai";
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
      instructions: `Phase Nourrisson (0-4 ans) :
    - Apprentissage des bases (marche, langage)
    - La scène doit être **chaleureuse, humoristique et réaliste**.
    - Intègre des **interactions familiales naturelles** (ex: parents, frères/sœurs, amis, baby-sitter).
    - Le choix du joueur doit être un **dilemme du quotidien d'un enfant**.
    - Certains choix doivent avoir **des conséquences cachées**, qui influenceront **les futures étapes du jeu**


    Exemple : Choix alimentaires, activités ludiques, création d'un cercle sociale,`,
      example: `{
        {
        "text": "Aider maman à calmer ton petit frère",
        "healthChange": 2,
        "moneyChange": 0,
        "karmaChange": 5,
        "socialChange": 3,
        "psychologicalProfileChange": "Bienveillant",
        "memoryChange": "",
      },
      {
        "text": "Demander à papa d'aller au parc jouer au ballon",
        "healthChange": 5,
        "moneyChange": 0,
        "karmaChange": 1,
        "socialChange": 4,
        "psychologicalProfileChange": "Sportif",
        "memoryChange":"",
      }

      }`,
    };

  if (age >= 5 && age < 9)
    return {
      instructions: `Phase enfance (5-10 ans) :
- L'enfant commence à explorer son environnement social et le modèle scolaire français.
- Les décisions sont simples mais influencent son apprentissage et ses relations.
- Les conséquences sont temporaires mais peuvent affecter son profil psychologique.

**Instructions Générales :**
1. Génère une **scène immersive et engageante** qui correspond à un enfant de 6-10 ans.
2. Décris l'environnement avec des **détails sensoriels et émotionnels** (ex: "la cloche sonne, la cour est remplie d'enfants qui rient").
3. Introduis un **événement** où le joueur doit prendre une décision (ex: une invitation à un anniversaire, une dispute dans la cour, un choix d'activité après l'école).
4. Fournis **2 choix**, chacun ayant une influence sur les variables du jeu :
   - **Santé** (ex: choix qui favorisent ou diminuent l'énergie de l'enfant)
   - **Argent** (ex: conséquences sur les dépenses familiales)
   - **Karma** (ex: gentillesse, honnêteté, comportement social)
   - **Relations sociales** (ex: renforcer une amitié, se replier sur soi-même)
   - **Profil psychologique** (ex: développer une personnalité sociable, solitaire, créative, sportive)

 **Exigences Spécifiques :**
- Évite les choix évidents **(pas de "bon" ou "mauvais" choix)**.
- Assure-toi que chaque décision est réaliste et cohérente avec l'âge de l'enfant.
- Ajoute un **événement aléatoire** qui pourrait surprendre le joueur (ex: un imprévu pendant la fête).
- La sortie doit être au **format JSON**.
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
                  "psychologicalProfileChange": "Sociable",
                  "memoryChange": "Le joueur est allé à l'anniversaire de son camarade de classe à l'age de 6 ans"
                },
                {
                  "text": "Préférer rester à la maison",
                  "healthChange": 1,
                  "moneyChange": 0, 
                  "karmaChange": -1,
                  "socialChange": -2,
                  "psychologicalProfileChange": "Solitaire",
                  "memoryChange": "Le joueur à des tendances solitaires"
                }
              ]
            }
          }`,
    };

  if (age >= 10 && age < 14)
    return {
      instructions: `Pré-Adolescence (11-15 ans) :
    - Prise d'autonomie progressive
    - Gestion du temps scolaire(qui se base sur le modèle scolaire français)/loisirs
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
            "psychologicalProfileChange": "Intellectuel",
            "memoryChange": "Le joueur a choisi de rejoindre le club de sciences à l'age de 12 ans"
          },
          {
            "text": "Équipe sportive",
            "healthChange": 2,
            "moneyChange": -2,
            "karmaChange": 0,
            "socialChange": 2,
            "psychologicalProfileChange": "Compétitif",
            "memoryChange": "Le joueur a choisi de rejoindre l'équipe sportive à l'age de 12 ans"
          }
        ]
      }
    }`,
    };

  if (age >= 15 && age < 19)
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
            "psychologicalProfileChange": "Ambitieux",
            "memoryChange": "Le joueur a choisi de rejoindre une université prestigieuse au lieu d'aller à une formation professionnelle à l'age de 16 ans"
          },
          {
            "text": "Formation professionnelle",
            "healthChange": 1,
            "moneyChange": 2,
            "karmaChange": -1,
            "socialChange": 3,
            "psychologicalProfileChange": "Pragmatique",
            "memoryChange": "Le joueur a choisi de rejoindre une formation professionnelle au lieu d'aller à une université prestigieuse à l'age de 16 ans"
          }
        ]
      }
    }`,
    };

  if (age >= 20 && age < 24)
    return {
      instructions: `Phase Pré-Adulte (20-25 ans) :
    - Conséquences importantes mais pas définitives
    - Dilemmes complexes sur son avenir
    - Enjeux d'étude et de carrière `,
      example: `{
        "message": "Tu hésite à arrêter ce que tu fait pour créer ta propre entreprise...",
        "question": {
          "text": "Quelle voie suits-tu ?",
          "options": [
            {
              "text": "Créer ta propre entreprise",
              "healthChange": -3,
              "moneyChange": -5,
              "karmaChange": 2,
              "socialChange": 1,
              "psychologicalProfileChange": "Ambitieux",
              "memoryChange": "Le joueur a créé sa propre entreprise et de quitter son travail actuel à l'age de 23 ans"
            },
            {
              "text": "Continuer ton travail actuel",
              "healthChange": 1,
              "moneyChange": 2,
              "karmaChange": -1,
              "socialChange": 3,
              "psychologicalProfileChange": "Pragmatique",
              "memoryChange": "Le joueur a hésité à arrêter son travail actuel pour créer sa propre entreprise à l'age de 23 ans, mais il décide de continuer son travail actuel."
            }
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
      "message": "Tu reçois une offre de travail à l'étranger, mais ta femme ne peux pas te suivre...",
      "question": {
        "text": "Acceptes-tu ?",
        "options": [
          {
            "text": "Oui, nouvelle aventure",
            "healthChange": -2,
            "moneyChange": 4,
            "karmaChange": -1,
            "socialChange": -3,
            "psychologicalProfileChange": "Aventurier",
            "memoryChange": "Le joueur a accepté l'offre de travail à l'étranger et a quitté sa famille et ses amis à l'age de 26 ans"
          },
          {
            "text": "Non, rester près des miens",
            "healthChange": 2,
            "moneyChange": -1,
            "karmaChange": 2,
            "socialChange": 2,
            "psychologicalProfileChange": "Famille",
            "memoryChange": "Le joueur a refusé l'offre de travail à l'étranger et a resté près de sa famille et de ses amis à l'age de 26 ans"
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

// Modifier le schema des options avec des valeurs par défaut explicites
const optionSchema = z.object({
  text: z.string().describe("Texte de l'option"),
  healthChange: z.number().min(-100).max(50).default(0),
  moneyChange: z.number().min(-10000).max(10000).default(0),
  karmaChange: z.number().min(-50).max(50).default(0),
  socialChange: z.number().min(-50).max(50).default(0),
  psychologicalProfileChange: z.string().optional().default(""), // Default explicite
  memoryChange: z.string().optional().default(""), // Default vide
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
      `- Inclure des pénalités de dette progressives\n` +
      `EXEMPLE:\n{
        "text": "Emprunter à un taux usuraire",
        "moneyChange": 5,
        "healthChange": -3,
        "karmaChange": -2,
        "socialChange": -1,
        "psychologicalProfileChange": "Désespéré",
        "memoryChange": "Le joueur a emprunté à un taux usuraire et a perdu son travail actuel à l'age de 28 ans"
      }`;
  } else if (money > 1000000) {
    prompt +=
      `INFORMATION: L'utilisateur a un capital important\n` +
      `DIRECTIVES:\n` +
      `- Introduire des opportunités d'investissement\n` +
      `- Ajouter des risques de fraude proportionnels\n` +
      `EXEMPLE:\n{
        "text": "Investir dans un projet douteux",
        "moneyChange": 7,
        "healthChange": -4,
        "karmaChange": -3,
        "socialChange": 1,
        "psychologicalProfileChange": "Avaricieux",
        "memoryChange": "Le joueur a investi dans un projet douteux et a perdu son travail actuel à l'age de 30 ans"
      }`;
  } else {
    prompt +=
      `INFORMATION: Situation financière stable\n` +
      `DIRECTIVES:\n` +
      `- Maintenir des options équilibrées\n` +
      `EXEMPLE:\n{
        "text": "Accepter un CDI stable",
        "moneyChange": 2,
        "healthChange": -1,
        "karmaChange": 1,
        "socialChange": 0,
        "psychologicalProfileChange": "Stable",
        "memoryChange": "Le joueur a accepté un CDI stable et a continué son travail actuel à l'age de 35 ans"
      }`;
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
      `- Introduire des choix impactant la survie\n` +
      `EXEMPLE:\n{
        "text": "Subir une opération risquée",
        "healthChange": 5,
        "moneyChange": -4,
        "karmaChange": 2,
        "socialChange": -3,
        "psychologicalProfileChange": "Courageux",
        "memoryChange": "Le joueur a subi une opération risquée et a perdu son travail actuel à l'age de 32 ans"
      }`;
  } else if (health > 80) {
    prompt +=
      `INFORMATION: Excellente condition physique\n` +
      `DIRECTIVES:\n` +
      `- Proposer des défis sportifs extrêmes\n` +
      `EXEMPLE:\n{
        "text": "Traverser l'Amazonie à pied",
        "healthChange": -4,
        "moneyChange": -2,
        "karmaChange": 3,
        "socialChange": 1,
        "psychologicalProfileChange": "Aventurier",
        "memoryChange": "Le joueur a traversé l'Amazonie à pied et a perdu son travail actuel à l'age de 34 ans"
      }`;
  } else {
    prompt +=
      `INFORMATION: Santé moyenne\n` +
      `DIRECTIVES:\n` +
      `- Lier santé mentale et physique\n` +
      `EXEMPLE:\n{
        "text": "Faire un burn-out",
        "healthChange": -3,
        "moneyChange": 4,
        "karmaChange": -1,
        "socialChange": -2,
        "psychologicalProfileChange": "Épuisé",
        "memoryChange": "Le joueur a fait un burn-out et a perdu son travail actuel à l'age de 36 ans"
      }`;
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
      `- Faire des options qui ne changent pas grand chose à la vie du joueur et qui correspondent à son âge\n` +
      `EXEMPLE:\n{
      "text": "Choix alimentaires",
      "healthChange": 1,
      "moneyChange": 0,
      "karmaChange": 0,
      "socialChange": 0,
      "psychologicalProfileChange": "Curieux",
      "memoryChange": ""
    }`;
  } else if (age < 18) {
    prompt +=
      `INFORMATION: Le joueur est au stade de l'age adulte\n` +
      `DIRECTIVES:\n` +
      `- Limiter les conséquences permanentes\n` +
      `EXEMPLE:\n{
        "text": "Choix d'orientation scolaire",
        "healthChange": 0,
        "moneyChange": -1,
        "karmaChange": 1,
        "socialChange": 2,
        "psychologicalProfileChange": "Curieux",
        "memoryChange": "Le joueur a fait un choix d'orientation et a quitté ses études à l'age de 18 ans"
      }`;
  } else if (age > 60) {
    prompt +=
      `INFORMATION SUR L'ÂGE DU JOUEUR: Fin de carrière\n` +
      `DIRECTIVES:\n` +
      `- Introduire des enjeux de transmission\n` +
      `EXEMPLE:\n{
        "text": "Legs testamentaire",
        "moneyChange": -10,
        "karmaChange": 2,
        "healthChange": 0,
        "socialChange": 1,
        "psychologicalProfileChange": "Généreux",
        "memoryChange": "Le joueur a fait un legs testamentaire et a quitté son travail actuel à l'age de 65 ans"
      }`;
  } else {
    prompt +=
      `INFORMATION SUR L'ÂGE DU JOUEUR: Âge actif\n` +
      `DIRECTIVES:\n` +
      `- Augmenter progressivement les enjeux\n` +
      `EXEMPLE:\n{
        "text": "Crédit immobilier",
        "moneyChange": 4,
        "healthChange": -2,
        "karmaChange": -1,
        "socialChange": -1,
        "psychologicalProfileChange": "Responsable",
        "memoryChange": "Le joueur a fait un crédit immobilier risqué à l'age de 40 ans"
      }`;
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
  let prompt = `\n\n## INFLUENCE MEMOIRE (${memory.join(", ") || "Aucun"})\n`;

  if (memory.length === 0) {
    prompt +=
      `INFORMATION SUR LE PASSÉ DU JOUEUR: Aucune mémoire particulière\n` +
      `DIRECTIVES:\n` +
      `- Définir le passé du joueur\n` +
      `- Proposer des options qui changent son passé\n`;
  } else {
    prompt +=
      `INFORMATION SUR LES DERNIERS ÉVÈNEMENTS VÉCUS DU JOUEUR, garde les en mémoire mais ne les utilises pas à chaque fois : Mémoire du joueur : ${memory
        .reverse()
        .join(", ")}\n` +
      "COMMENT INTERPRETER LA MÉMOIRE DU JOUEUR: Tu dois faire attention à ne pas trop concentrer l'utilisateur sur un seul sujet. Par exemple si tu vois plusieurs fois des mémoires similaires à la suite, alors change de sujet." +
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
- Ajoute des **événements aléatoires** qui rendent le jeu imprévisible.
- Formate ta réponse en JSON.
- Quand tu introduis des personnages secondaires, introduit leur nom et prend soin de le conserver dans la mémoire du joueur.

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
    prompt += generateMemoryPrompt(user);

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
      temperature: 0.4, // Réduire encore la créativité
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
