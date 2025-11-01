// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueryRequest {
  question: string;
  sessionId: string;
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  fields: any;
  data: any[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, sessionId }: QueryRequest = await req.json();

    if (!question) {
      throw new Error("Question is required");
    }

    console.log("Processing question:", question);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all datasets
    const { data: datasets, error: datasetsError } = await supabase
      .from("datasets")
      .select("*");

    if (datasetsError) throw datasetsError;

    if (!datasets || datasets.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "I don't have any datasets loaded yet. Please wait while the system initializes with sample agricultural and climate data.",
          citations: [],
          visualizations: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare context for the AI
    const datasetContext = datasets.map((ds: Dataset) => ({
      name: ds.name,
      description: ds.description,
      fields: Object.keys(ds.fields),
      sampleRows: ds.data.slice(0, 3),
    }));

    // Call Google Gemini API
    const geminiApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert data analyst specializing in Indian agricultural and climate data. 
Your task is to answer questions based on the available datasets with precise, data-backed answers.

Available datasets:
${JSON.stringify(datasetContext, null, 2)}

Instructions:
1. Analyze the user's question carefully
2. Identify which datasets are relevant
3. Extract and process the data to answer the question
4. ALWAYS cite specific sources (dataset name and relevant data points)
5. When applicable, suggest visualizations (bar chart, line chart, or table)
6. Be precise with numbers and comparisons
7. If data is insufficient, state what's missing

Response format:
{
  "answer": "Your detailed answer with specific numbers and insights",
  "citations": [{"dataset": "dataset_name", "source": "specific data reference"}],
  "visualizations": {
    "type": "bar|line|table",
    "title": "Chart title",
    "data": [...],
    "xKey": "field name",
    "yKey": "field name",
    "series": ["series1", "series2"]
  }
}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}\n\nUser question: ${question}\n\nFull datasets:\n${JSON.stringify(datasets, null, 2)}\n\nProvide your response as valid JSON only, no markdown formatting.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini response:", JSON.stringify(geminiData, null, 2));

    let responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", responseText);
      // Fallback: return the raw text as answer
      parsedResponse = {
        answer: responseText,
        citations: [],
        visualizations: null,
      };
    }

    // Store the message
    await supabase.from("chat_messages").insert([
      {
        session_id: sessionId,
        role: "user",
        content: question,
      },
      {
        session_id: sessionId,
        role: "assistant",
        content: parsedResponse.answer,
        citations: parsedResponse.citations || [],
        visualizations: parsedResponse.visualizations || null,
      },
    ]);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in query-data function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
