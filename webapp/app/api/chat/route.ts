import { semanticSearch } from "@/lib/ragSearch";
import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { streamText, generateObject, Message } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { messageQueries } from "@/lib/db/queries";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_SERVICE_ROLE_KEY as string;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { messages, id } = await req.json();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const result = streamText({
    model: groq("deepseek-r1-distill-llama-70b-specdec"),
    system:
      "You are a helpful assistant that can answer questions about history. Answer only about the history of wars, nothing else. Politly decline to answer questions that are not about history of wars. You can use the searchWarsInfo tool to search into the database of HistoryAI for relevant information, to correctly use the searchWarsInfo tool, you must search by using the name of the war relevant to the question. When you have the answer, answer in the user's language in markdown format. IMPORTANT: When a quiz is generated, you must ONLY respond with 'Quiz généré !' without any additional explanation or recap. When a study card is generated, you must ONLY respond with 'Fiche de révision générée !' without any additional explanation or recap - the interface will handle the display of content. You can generate audio revision of a text with the generateAudioRevision tool. When an audio is generated, you must ONLY respond with 'Audio généré !' without any additional explanation or recap. If you think something is about war but the user didn't specify the name of the war, try to find the most relevant war and answer about it.",
    messages,
    maxSteps: 5,
    experimental_toolCallStreaming: true,
    toolChoice: "auto",
    tools: {
      searchWarsInfo: {
        description:
          "Searches wars documents in the user's documents provided into HistoryAI for relevant information. You can do multiple searches one after the other to get more results and go more in depth of a subject. The database is in french so your queries should be in french too. Search by using the name of the war.",
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          try {
            const searchResults = await semanticSearch(query);
            console.log(
              "✅ [Tool - searchWarsInfo] Résultats trouvés:",
              searchResults?.length
            );

            // Format les résultats avec une limite de contenu
            const formattedResults = searchResults?.map((result) => {
              // Limiter le contenu à environ 1000 caractères
              if (result.contenu_complet) {
                const truncatedContent =
                  result.contenu_complet.length > 10000
                    ? result.contenu_complet.substring(0, 10000) +
                      "... (contenu tronqué)"
                    : result.contenu_complet;

                return `# ${result.nom}

## Résumé
${result.résumé}

## Contenu de la page Wikipédia
${truncatedContent}

${result.url ? `[Voir le document complet](${result.url})` : ""}`;
              }
            });

            // Limiter le nombre de résultats à 3 maximum
            return formattedResults?.slice(0, 3);
          } catch (error) {
            console.error("❌ [Tool - searchWarsInfo] Erreur:", error);
            throw error;
          }
        },
      },
      generateQuiz: {
        description:
          "Génère un quiz éducatif structuré sur les guerres historiques en utilisant des informations vérifiées.",
        parameters: z.object({
          question: z
            .string()
            .describe("Question de l'utilisateur pour contextualiser le quiz"),
          lang: z
            .string()
            .default("fr")
            .describe("Langue de sortie pour le quiz"),
          shouldRespondInText: z
            .boolean()
            .default(false)
            .describe("Indique si une réponse textuelle est nécessaire"),
        }),
        execute: async ({ question, lang }) => {
          try {
            const { object: quizData } = await generateObject({
              model: openai("gpt-4o"),
              schema: z.object({
                quiz: z.object({
                  title: z.string(),
                  questions: z
                    .array(
                      z.object({
                        question: z.string(),
                        options: z.array(z.string()).length(4),
                        correctAnswer: z.string(),
                        explanation: z
                          .string()
                          .describe(
                            "Explication détaillée de la réponse correcte"
                          ),
                      })
                    )
                    .min(3)
                    .max(10),
                }),
              }),
              system: `Expert en histoire militaire. Génère un quiz cohérent basé sur l'historique de conversation et les données vérifiées. 
                      Pour chaque question, fournis une explication détaillée qui aide à comprendre pourquoi la réponse est correcte.
                      Considère le contexte suivant: ${messages
                        .map((m: Message) => m.content)
                        .join("\n")}
                      Structure les questions avec 4 options, une réponse claire et une explication pédagogique.`,
              messages: [
                ...messages,
                {
                  role: "user",
                  content: `Crée un quiz sur: ${question} (Langue: ${lang})`,
                },
              ],
            });

            return {
              quiz: {
                ...quizData.quiz,
                questions: quizData.quiz.questions.map((q) => ({
                  ...q,
                  options: shuffleArray(q.options),
                  correctIndex: q.options.indexOf(q.correctAnswer),
                  explanation: q.explanation,
                })),
              },
              message: "Quiz généré !",
            };
          } catch (error) {
            console.error("❌ [Tool - generateQuiz] Erreur:", error);
            throw error;
          }
        },
      },
      generateStudyCard: {
        description:
          "Génère une fiche de révision structurée sur un sujet historique lié aux guerres.",
        parameters: z.object({
          topic: z.string().describe("Sujet de la fiche de révision"),
          lang: z
            .string()
            .default("fr")
            .describe("Langue de sortie pour la fiche"),
        }),
        execute: async ({ topic, lang }) => {
          try {
            const { object: studyCardData } = await generateObject({
              model: openai("gpt-4o"),
              schema: z.object({
                studyCard: z.object({
                  title: z.string(),
                  introduction: z.string(),
                  keyPoints: z.array(
                    z.object({
                      title: z.string(),
                      content: z.string(),
                    })
                  ),
                  dates: z.array(
                    z.object({
                      date: z.string(),
                      event: z.string(),
                    })
                  ),
                  keyFigures: z.array(
                    z.object({
                      name: z.string(),
                      role: z.string(),
                      description: z.string(),
                    })
                  ),
                  conclusion: z.string(),
                }),
              }),
              system: `Expert en histoire militaire. Génère une fiche de révision structurée et détaillée.
                      La fiche doit inclure une introduction, des points clés, une chronologie, des personnages importants et une conclusion.
                      Sois précis et pédagogique dans tes explications.`,
              messages: [
                {
                  role: "user",
                  content: `Crée une fiche de révision sur: ${topic} (Langue: ${lang})`,
                },
              ],
            });

            return {
              studyCard: studyCardData.studyCard,
              message: "Fiche de révision générée !",
            };
          } catch (error) {
            console.error("❌ [Tool - generateStudyCard] Erreur:", error);
            throw error;
          }
        },
      },
      generateAudioRevision: {
        description:
          "Génère un audio de révision à partir d'un texte en utilisant l'API ElevenLabs Text-to-Speech et le sauvegarde dans Supabase Storage dans le bucket 'audio_files'.",
        parameters: z.object({
          text: z
            .string()
            .describe(
              "Texte à transformer en audio pour faciliter la révision"
            ),
        }),
        execute: async ({ text }) => {
          const ELEVENLABS_VOICE_ID = "gCux0vt1cPsEXPNSbchu";
          const apiKey = process.env.ELEVENLABS_API_KEY;
          if (!apiKey) {
            throw new Error("Clé API ElevenLabs non configurée");
          }
          console.log(
            "[Tool - generateAudioRevision] Appel de l'API ElevenLabs Text-to-Speech"
          );

          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": apiKey,
              },
              body: JSON.stringify({
                text: text,
                voice_settings: { stability: 0.5, similarity_boost: 0.8 },
              }),
            }
          );

          if (!res.ok) {
            const errorMessage = await res.text();
            console.error(
              "[Tool - generateAudioRevision] Erreur lors de la génération de l'audio :",
              errorMessage
            );
            throw new Error(
              `Erreur lors de la génération de l'audio: ${errorMessage}`
            );
          }

          const audioBuffer = await res.arrayBuffer();
          const audioBinary = Buffer.from(audioBuffer);
          console.log(
            "[Tool - generateAudioRevision] Audio généré, taille :",
            audioBinary.length,
            "octets"
          );

          // Sauvegarde dans Supabase Storage
          try {
            const fileName = `${session.user.id}/${id}_${Date.now()}.mp3`;
            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from("audio_files")
                .upload(fileName, audioBinary, {
                  cacheControl: "3600",
                  upsert: false,
                });
            console.log("uploadData", uploadData);
            if (uploadError) {
              console.error(
                "[Tool - generateAudioRevision] Erreur lors de l'upload vers Supabase Storage :",
                uploadError
              );
              throw new Error(
                `Erreur lors de l'upload vers Supabase Storage: ${uploadError.message}`
              );
            }

            console.log(
              "[Tool - generateAudioRevision] Upload réussi :",
              uploadData
            );

            // Construire l'URL publique à partir du chemin retourné par l'upload
            const publicURL = `${SUPABASE_URL}/storage/v1/object/public/audio_files/${uploadData.path}`;

            // Retourner l'URL avec un message
            return JSON.stringify({
              message: "Audio généré !",
              url: publicURL,
            });
          } catch (error) {
            console.error(
              "[Tool - generateAudioRevision] Exception lors de la sauvegarde sur Supabase Storage :",
              error
            );
            throw error;
          }
        },
      },
    },
    onFinish: async (result) => {
      console.log("result", result);
      const responseMessages = result.response.messages;
      console.log("raw response", result.response);

      // Sauvegarde le message utilisateur (le dernier message dans la requête)
      const userMessage = messages[messages.length - 1];
      await messageQueries.create(
        id,
        typeof userMessage.content === "string"
          ? userMessage.content
          : JSON.stringify(userMessage),
        "user"
      );

      // Sauvegarde tous les messages de la réponse dans l'ordre, avec un délai de 50ms entre chaque insertion
      for (const msg of responseMessages) {
        const contentToSave =
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content);
        // Remappage : si le rôle est "tool", on le sauvegarde comme "assistant"
        const roleToSave = msg.role === "tool" ? "assistant" : msg.role;
        await messageQueries.create(id, contentToSave, roleToSave);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    },
  });
  console.log(result);
  return result.toDataStreamResponse();
}

function shuffleArray(array: string[]) {
  return array.sort(() => Math.random() - 0.5);
}
