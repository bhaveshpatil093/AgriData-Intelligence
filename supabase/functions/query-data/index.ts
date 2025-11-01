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

    // Prepare context for the AI - provide structure and sample data
    const datasetContext = datasets.map((ds: Dataset) => ({
      name: ds.name,
      description: ds.description,
      fields: ds.fields,
      fieldNames: Object.keys(ds.fields),
      rowCount: ds.data.length,
      sampleRows: ds.data.slice(0, 5),
      uniqueStates: [...new Set(ds.data.map((r: any) => r.State))].slice(0, 10),
      uniqueDistricts: [...new Set(ds.data.map((r: any) => r.District))].slice(0, 10),
      yearRange: ds.data.length > 0 ? {
        min: Math.min(...ds.data.map((r: any) => r.Year || 0)),
        max: Math.max(...ds.data.map((r: any) => r.Year || 0))
      } : null,
    }));

    // Call Google Gemini API
    const geminiApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    // Create a more structured prompt that guides the AI better
    const systemPrompt = `You are an expert data analyst specializing in Indian agricultural and climate data from data.gov.in.

Your task is to answer user questions by analyzing the provided datasets and generating precise, data-backed answers with citations.

AVAILABLE DATASETS STRUCTURE:
${JSON.stringify(datasetContext, null, 2)}

FULL DATASET DATA:
${JSON.stringify(datasets.map((ds: Dataset) => ({
  name: ds.name,
  data: ds.data
})), null, 2)}

CRITICAL INSTRUCTIONS:
1. Carefully analyze the user's question to identify:
   - States mentioned (e.g., Maharashtra, Punjab, Rajasthan, Bihar, Uttar Pradesh, Haryana, West Bengal)
   - Districts mentioned
   - Crops mentioned (Rice, Wheat, Bajra, Jowar, Sugarcane, Cotton, etc.)
   - Time periods (last 5 years = 2018-2022, last decade = 2013-2022 but we have 2018-2022, specific years)
   - Comparison requests (vs, compare, difference)
   - Aggregation requests (top N, average, highest, lowest)

2. Extract relevant data from the datasets:
   - Filter by state, district, crop, year as needed
   - Calculate averages, totals, comparisons
   - Identify trends over time
   - Find highest/lowest values

3. Format your answer with:
   - Specific numbers and data points
   - Clear comparisons when requested
   - Citations for EVERY data point mentioned
   - Logical structure and readability

4. For visualizations:
   - Use "bar" for comparisons between categories (states, districts, crops)
   - Use "line" for trends over time (years)
   - Use "table" for detailed data listings
   - Include proper titles and labels
   - Ensure data arrays are properly formatted

5. ALWAYS include citations. Format: {"dataset": "Dataset Name", "source": "State: X, District: Y, Year: Z, Crop: W"}

6. Response MUST be valid JSON only, no markdown code blocks, no explanatory text outside JSON.

RESPONSE FORMAT (return ONLY this JSON structure):
{
  "answer": "Detailed answer with specific numbers, comparisons, and insights. Include all key findings.",
  "citations": [
    {"dataset": "Dataset Name", "source": "Specific reference like 'State: Maharashtra, Year: 2022'"}
  ],
  "visualizations": {
    "type": "bar|line|table",
    "title": "Descriptive chart title",
    "data": [{"key": "value", ...}],
    "xKey": "field name for x-axis",
    "yKey": "field name for y-axis (for single series)",
    "series": ["series1", "series2"] // for multiple series charts
  }
}

If no visualization is needed, set visualizations to null.`;

    const userPrompt = `User question: "${question}"

Analyze the datasets and provide your response as valid JSON only (no markdown, no code blocks, just the JSON object).`;

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
                  text: `${systemPrompt}\n\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent, factual responses
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096, // Increased for longer responses
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
    
    if (!responseText) {
      throw new Error("No response received from Gemini API");
    }
    
    // Clean up markdown code blocks and whitespace
    responseText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[\s\n]*/, "")
      .replace(/[\s\n]*$/, "")
      .trim();
    
    // Try to extract JSON if there's surrounding text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
      
      // Validate response structure
      if (!parsedResponse.answer) {
        parsedResponse.answer = responseText;
      }
      if (!parsedResponse.citations || !Array.isArray(parsedResponse.citations)) {
        parsedResponse.citations = [];
      }
      if (!parsedResponse.visualizations) {
        parsedResponse.visualizations = null;
      }
      
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", responseText);
      console.error("Parse error:", parseError);
      
      // Fallback: return the raw text as answer with basic structure
      parsedResponse = {
        answer: responseText + "\n\n(Note: The response could not be parsed as structured JSON, but the analysis is provided above.)",
        citations: datasets.map((ds: Dataset) => ({
          dataset: ds.name,
          source: "Referenced in analysis"
        })),
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
