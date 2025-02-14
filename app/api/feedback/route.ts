import { NextResponse } from "next/server";
import { env } from "process";

export async function POST(request: Request) {
  try {
    // Extrait du corps de la requête: rating, message, context, responses et date
    const { rating, message, context, responses, date } = await request.json();
    console.log(
      "Entrée dans la route api",
      rating,
      message,
      context,
      responses,
      date
    );

    if (typeof rating !== "number") {
      return NextResponse.json(
        { error: "Rating est requis et doit être un nombre" },
        { status: 400 }
      );
    }

    // Exemple de conversion de la date
    let validDate: string;
    if (!date) {
      validDate = new Date().toISOString();
    } else if (typeof date === "number" || !date.includes("T")) {
      // Si 'date' est un timestamp ou une date sans l'heure, le transformer en ISO
      validDate = new Date(date).toISOString();
    } else {
      validDate = date;
    }

    // Récupérer la configuration Airtable depuis les variables d'environnement
    const baseId = process.env.AIRTABLE_BASE_ID;
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const tableName = "rating"; // Nom de la table dans Airtable

    if (!baseId || !airtableApiKey) {
      throw new Error("Configuration Airtable manquante");
    }

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

    console.log(url);

    const airtableBody = {
      fields: {
        rating: rating,
        date: validDate, // utilisation de la date formatée
        question: context,
        contexte: message,
        reponse: JSON.stringify(responses),
        ai_model: "llama3.1",
        response_time: "N/A",
      },
    };

    console.log(airtableBody);

    const airtableResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(airtableBody),
    });
    console.log(airtableResponse);

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      console.error(errorText);
      return NextResponse.json(
        {
          error: "Erreur lors de la sauvegarde sur Airtable",
          details: errorText,
        },
        { status: 500 }
      );
    }

    const data = await airtableResponse.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erreur dans /api/feedback:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
