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
   - CRITICAL: visualizations must be a SINGLE object, NOT an array
   - The data array must contain objects with the keys you want to display

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
    "data": [
      {"State": "Maharashtra", "Average_Annual_Rainfall_mm": 643.75},
      {"State": "Punjab", "Average_Annual_Rainfall_mm": 705.08}
    ],
    "xKey": "State",
    "yKey": "Average_Annual_Rainfall_mm",
    "series": [] // optional: for multiple series like ["Value1", "Value2"]
  }
}

IMPORTANT VISUALIZATION RULES:
- visualizations can be a SINGLE object OR an array of objects
- If you have multiple visualizations, use an array: [{"type": "bar", ...}, {"type": "table", ...}]
- The "data" array must contain objects where each object is a data point
- For bar charts comparing states, use: {"data": [{"State": "Name", "Value": number}, ...], "xKey": "State", "yKey": "Value"}
- For line charts over time, use: {"data": [{"Year": 2018, "Value": number}, ...], "xKey": "Year", "yKey": "Value"}
- If no visualization is needed, set visualizations to null (not an empty object or array)

CRITICAL: Your response MUST be valid JSON. Do NOT include any text before or after the JSON object. Start with { and end with }.`;

    const userPrompt = `User question: "${question}"

Analyze the datasets and provide your response as valid JSON only (no markdown, no code blocks, no explanatory text, just the JSON object starting with { and ending with }).`;

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
    console.log("Gemini response status:", geminiResponse.status);
    console.log("Gemini response keys:", Object.keys(geminiData));
    
    // Check for API errors in response
    if (geminiData.error) {
      console.error("Gemini API returned an error:", geminiData.error);
      throw new Error(`Gemini API error: ${geminiData.error.message || JSON.stringify(geminiData.error)}`);
    }
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error("No candidates in Gemini response:", JSON.stringify(geminiData, null, 2));
      throw new Error("No response candidates from Gemini API");
    }

    let responseText = geminiData.candidates[0]?.content?.parts?.[0]?.text || "";
    
    if (!responseText || responseText.trim().length === 0) {
      console.error("Empty response from Gemini API. Full response:", JSON.stringify(geminiData, null, 2));
      
      // Return a helpful error message instead of throwing
      return new Response(
        JSON.stringify({
          answer: "I apologize, but I didn't receive a valid response from the AI service. Please try rephrasing your question or ask something else.",
          citations: [],
          visualizations: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Clean up markdown code blocks and whitespace
    responseText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[\s\n]*/, "")
      .replace(/[\s\n]*$/, "")
      .trim();
    
    // Try to extract JSON if there's surrounding text
    // Look for the largest JSON object in the response
    const jsonMatches = responseText.match(/\{[\s\S]*\}/g);
    if (jsonMatches && jsonMatches.length > 0) {
      // Use the longest match (most likely to be the complete JSON)
      responseText = jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
    }
    
    // If no JSON object found, try array format
    if (!responseText.startsWith('{')) {
      const arrayMatch = responseText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        responseText = arrayMatch[0];
      }
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
      
      // Normalize visualizations - handle both array and object formats
      if (parsedResponse.visualizations) {
        // If it's an array, validate and keep all valid visualizations
        if (Array.isArray(parsedResponse.visualizations)) {
          const validVizs = parsedResponse.visualizations.filter((viz: any) => 
            viz && 
            typeof viz === 'object' && 
            viz.data && 
            Array.isArray(viz.data) && 
            viz.data.length > 0
          );
          
          // If we have valid visualizations, keep the array, otherwise set to null
          parsedResponse.visualizations = validVizs.length > 0 ? validVizs : null;
          
          // Ensure type is set for each visualization
          if (parsedResponse.visualizations) {
            parsedResponse.visualizations.forEach((viz: any) => {
              if (!viz.type) {
                viz.type = "bar";
              }
            });
          }
        }
        // If it's an object, validate it has required fields
        else if (typeof parsedResponse.visualizations === 'object') {
          if (!parsedResponse.visualizations.data || !Array.isArray(parsedResponse.visualizations.data) || parsedResponse.visualizations.data.length === 0) {
            parsedResponse.visualizations = null;
          } else {
            // Ensure type is set
            if (!parsedResponse.visualizations.type) {
              parsedResponse.visualizations.type = "bar";
            }
          }
        } else {
          parsedResponse.visualizations = null;
        }
      } else {
        parsedResponse.visualizations = null;
      }
      
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON");
      console.error("Response text:", responseText);
      console.error("Parse error:", parseError);
      console.error("Response text length:", responseText?.length);
      console.error("Response text preview:", responseText?.substring(0, 500));
      
      // Fallback: return the raw text as answer with basic structure
      parsedResponse = {
        answer: responseText || "I apologize, but I encountered an issue processing your question. Please try rephrasing it.",
        citations: datasets.map((ds: Dataset) => ({
          dataset: ds.name,
          source: "Referenced in analysis"
        })),
        visualizations: null,
      };
    }

    // Final validation - ensure answer is always present
    if (!parsedResponse || !parsedResponse.answer || typeof parsedResponse.answer !== 'string') {
      console.error("Invalid parsedResponse structure. parsedResponse:", JSON.stringify(parsedResponse, null, 2));
      console.error("Response text was:", responseText?.substring(0, 1000));
      parsedResponse = {
        answer: "I apologize, but I encountered an issue processing your question. Please try rephrasing it or ask a different question.",
        citations: [],
        visualizations: null,
      };
    }
    
    // Ensure answer is not empty
    if (!parsedResponse.answer || parsedResponse.answer.trim().length === 0) {
      console.error("Answer is empty after parsing. parsedResponse:", JSON.stringify(parsedResponse, null, 2));
      parsedResponse.answer = "I apologize, but I couldn't generate a response. The AI service may be temporarily unavailable. Please try again in a moment.";
    }

    // Ensure citations is an array
    if (!Array.isArray(parsedResponse.citations)) {
      parsedResponse.citations = [];
    }

    // Store the message (don't let DB errors break the response)
    try {
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
    } catch (dbError) {
      console.error("Error storing message in DB:", dbError);
      // Continue even if DB write fails
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in query-data function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({
        answer: `I apologize, but I encountered an error while processing your question: ${errorMessage}. Please try rephrasing your question or ask something else.`,
        citations: [],
        visualizations: null,
      }),
      {
        status: 200, // Return 200 so frontend doesn't treat it as a network error
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
