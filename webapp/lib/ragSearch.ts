import supabase from "./connexion";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { PostgrestError } from "@supabase/supabase-js";

interface War {
  id: number;
  nom: string;
  résumé: string;
  similarity: number;
  url?: string;
  contenu_complet?: string;
}

export const semanticSearch = async (query: string) => {
  console.log("🎯 [Search] Query:", query);
  const embedding = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });
  console.log("🎯 [Search] Embedding:", embedding.embedding[0]);
  const { data: wars, error } = (await supabase.rpc("match_documents_v2", {
    query_embedding: embedding.embedding,
    match_threshold: 0.78,
    match_count: 2,
  })) as { data: War[]; error: PostgrestError | null };

  if (error) {
    console.error("❌ [Search] Erreur:", error);
    throw error;
  }

  console.log("🎯 [Search] Wars:", wars);

  // Récupération des URLs des fichiers associés
  const warIds = wars.map((war) => war.id);
  const { data: fileData, error: fileError } = await supabase
    .from("wars_test")
    .select("id, url")
    .in("id", warIds);

  if (fileError) throw fileError;

  // Enrichissement des résultats avec les URLs des fichiers
  return wars.map((war) => {
    const fileInfo = fileData?.find((f) => f.id === war.id);
    return {
      ...war,
      url: fileInfo?.url,
    };
  });
};
