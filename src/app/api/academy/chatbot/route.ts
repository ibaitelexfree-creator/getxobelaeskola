import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    // Fallback if API key is not configured
    if (!apiKey) {
      console.warn('GOOGLE_AI_API_KEY is missing.');
      // Return a mock response for development
      return NextResponse.json({
        response: "⚠️ **Modo Demo (Sin API Key)**\n\nHola, soy El Piloto. Parece que mi radio no tiene la clave de cifrado (API Key) configurada en el servidor.\n\nPara funcionar correctamente, necesito la variable `GOOGLE_AI_API_KEY`.",
        sources: []
      });
    }

    const supabase = createClient();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Retrieve relevant content from database
    let dbContext = "";
    interface Source {
      title: string;
      id: string;
      module: string | null;
    }
    let sources: Source[] = [];

    // Try a text search or fallback to simple ilike on title
    // Since we don't know if FTS is set up, we'll try a simple ilike on name for now
    // and fetch a bit of content.

    // Sanitize input to avoid breaking PostgREST syntax (commas)
    const sanitizedQuery = message.replace(/[^\w\s\u00C0-\u00FF]/g, ' ').trim();

    interface DBUnit {
      id: string;
      nombre_es: string;
      contenido_teoria_es: string | null;
      modulo_id: string;
      modulos: {
        nombre_es: string;
      } | null;
    }

    const { data: units } = await supabase
      .from('unidades_didacticas')
      .select(`
        id,
        nombre_es,
        contenido_teoria_es,
        modulo_id,
        modulos (
          nombre_es
        )
      `)
      .or(`nombre_es.ilike.%${sanitizedQuery}%,contenido_teoria_es.ilike.%${sanitizedQuery}%`)
      .limit(3);

    if (units && units.length > 0) {
      const typedUnits = units as unknown as DBUnit[];
      sources = typedUnits.map((u) => ({
        title: u.nombre_es,
        id: u.id,
        module: u.modulos?.nombre_es ?? null
      }));

      dbContext = typedUnits.map((u) => `
Module: ${u.modulos?.nombre_es}
Unit: ${u.nombre_es} (ID: ${u.id})
Content: ${u.contenido_teoria_es?.substring(0, 1500)}...
`).join('\n---\n');
    }

    // 2. Construct prompt
    const systemPrompt = `
You are 'El Piloto', an expert nautical instructor at Getxo Bela Eskola.
Your goal is to help students with their sailing course, regulations, and navigation questions.
You are helpful, patient, and use nautical terminology correctly but explain it clearly.
Answer in the same language as the user (Spanish or Basque/Euskera).

Use the following course content to answer the student's question.
If the content is relevant, cite the unit title.
If the answer is not in the content, use your general nautical knowledge but mention it's general knowledge.
Format your response in Markdown. You can use bold, lists, etc.

Course Content:
${dbContext}

Student Question: ${message}
`;

    // 3. Generate content
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    return NextResponse.json({
      response: responseText,
      sources: sources
    });

  } catch (error) {
    console.error('Error in chatbot API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
