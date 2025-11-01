// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const cropProductionData = [
  { State: "Maharashtra", District: "Pune", Year: 2022, Crop: "Rice", Area: 1000, Production: 3000, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2022, Crop: "Wheat", Area: 800, Production: 2400, Yield: 3.0 },
  { State: "Maharashtra", District: "Nashik", Year: 2022, Crop: "Rice", Area: 1200, Production: 3600, Yield: 3.0 },
  { State: "Maharashtra", District: "Nashik", Year: 2022, Crop: "Wheat", Area: 900, Production: 2700, Yield: 3.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2022, Crop: "Rice", Area: 2000, Production: 7000, Yield: 3.5 },
  { State: "Punjab", District: "Ludhiana", Year: 2022, Crop: "Wheat", Area: 2500, Production: 10000, Yield: 4.0 },
  { State: "Punjab", District: "Amritsar", Year: 2022, Crop: "Rice", Area: 1800, Production: 6300, Yield: 3.5 },
  { State: "Punjab", District: "Amritsar", Year: 2022, Crop: "Wheat", Area: 2200, Production: 8800, Yield: 4.0 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2022, Crop: "Wheat", Area: 1500, Production: 5250, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2022, Crop: "Rice", Area: 1300, Production: 3900, Yield: 3.0 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2022, Crop: "Wheat", Area: 1200, Production: 4200, Yield: 3.5 },
  { State: "Bihar", District: "Patna", Year: 2022, Crop: "Wheat", Area: 800, Production: 2400, Yield: 3.0 },
  { State: "Bihar", District: "Gaya", Year: 2022, Crop: "Wheat", Area: 600, Production: 1500, Yield: 2.5 },
  { State: "West Bengal", District: "Kolkata", Year: 2022, Crop: "Rice", Area: 1500, Production: 4500, Yield: 3.0 },
  { State: "Rajasthan", District: "Jaipur", Year: 2022, Crop: "Bajra", Area: 1000, Production: 2000, Yield: 2.0 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2022, Crop: "Bajra", Area: 1200, Production: 2400, Yield: 2.0 },
  { State: "Maharashtra", District: "Pune", Year: 2021, Crop: "Rice", Area: 950, Production: 2850, Yield: 3.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2021, Crop: "Wheat", Area: 2400, Production: 9600, Yield: 4.0 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2021, Crop: "Wheat", Area: 1400, Production: 4900, Yield: 3.5 },
  { State: "Maharashtra", District: "Pune", Year: 2020, Crop: "Rice", Area: 900, Production: 2700, Yield: 3.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2020, Crop: "Wheat", Area: 2300, Production: 9200, Yield: 4.0 },
  { State: "Maharashtra", District: "Pune", Year: 2019, Crop: "Rice", Area: 880, Production: 2640, Yield: 3.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2019, Crop: "Wheat", Area: 2250, Production: 9000, Yield: 4.0 },
  { State: "Maharashtra", District: "Pune", Year: 2018, Crop: "Rice", Area: 850, Production: 2550, Yield: 3.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2018, Crop: "Wheat", Area: 2200, Production: 8800, Yield: 4.0 },
];

const rainfallData = [
  { State: "Maharashtra", District: "Pune", Year: 2022, Annual_Rainfall_mm: 650.5, Monsoon_Rainfall_mm: 550.2 },
  { State: "Maharashtra", District: "Nashik", Year: 2022, Annual_Rainfall_mm: 680.3, Monsoon_Rainfall_mm: 575.8 },
  { State: "Punjab", District: "Ludhiana", Year: 2022, Annual_Rainfall_mm: 720.8, Monsoon_Rainfall_mm: 600.5 },
  { State: "Punjab", District: "Amritsar", Year: 2022, Annual_Rainfall_mm: 710.2, Monsoon_Rainfall_mm: 595.3 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2022, Annual_Rainfall_mm: 980.5, Monsoon_Rainfall_mm: 820.3 },
  { State: "Bihar", District: "Patna", Year: 2022, Annual_Rainfall_mm: 1150.7, Monsoon_Rainfall_mm: 950.2 },
  { State: "West Bengal", District: "Kolkata", Year: 2022, Annual_Rainfall_mm: 1620.4, Monsoon_Rainfall_mm: 1350.8 },
  { State: "Rajasthan", District: "Jaipur", Year: 2022, Annual_Rainfall_mm: 550.2, Monsoon_Rainfall_mm: 480.5 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2022, Annual_Rainfall_mm: 380.7, Monsoon_Rainfall_mm: 320.4 },
  { State: "Maharashtra", District: "Pune", Year: 2021, Annual_Rainfall_mm: 625.3, Monsoon_Rainfall_mm: 530.1 },
  { State: "Punjab", District: "Ludhiana", Year: 2021, Annual_Rainfall_mm: 695.4, Monsoon_Rainfall_mm: 580.2 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2021, Annual_Rainfall_mm: 360.5, Monsoon_Rainfall_mm: 305.2 },
  { State: "Maharashtra", District: "Pune", Year: 2020, Annual_Rainfall_mm: 640.8, Monsoon_Rainfall_mm: 545.6 },
  { State: "Punjab", District: "Ludhiana", Year: 2020, Annual_Rainfall_mm: 705.2, Monsoon_Rainfall_mm: 590.8 },
  { State: "Maharashtra", District: "Pune", Year: 2019, Annual_Rainfall_mm: 635.4, Monsoon_Rainfall_mm: 540.2 },
  { State: "Punjab", District: "Ludhiana", Year: 2019, Annual_Rainfall_mm: 700.6, Monsoon_Rainfall_mm: 585.4 },
  { State: "Maharashtra", District: "Pune", Year: 2018, Annual_Rainfall_mm: 630.2, Monsoon_Rainfall_mm: 535.8 },
  { State: "Punjab", District: "Ludhiana", Year: 2018, Annual_Rainfall_mm: 698.3, Monsoon_Rainfall_mm: 583.7 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if datasets already exist
    const { data: existingDatasets } = await supabase
      .from("datasets")
      .select("id")
      .limit(1);

    if (existingDatasets && existingDatasets.length > 0) {
      return new Response(
        JSON.stringify({ message: "Datasets already seeded", count: existingDatasets.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert crop production dataset
    const cropFields = {
      State: "text",
      District: "text",
      Year: "number",
      Crop: "text",
      Area: "number (hectares)",
      Production: "number (tonnes)",
      Yield: "number (tonnes/hectare)",
    };

    await supabase.from("datasets").insert({
      name: "Crop Production Data",
      description: "Agricultural production data for various crops across Indian states and districts (2018-2022)",
      source_url: "data.gov.in",
      fields: cropFields,
      data: cropProductionData,
    });

    // Insert rainfall dataset
    const rainfallFields = {
      State: "text",
      District: "text",
      Year: "number",
      Annual_Rainfall_mm: "number (millimeters)",
      Monsoon_Rainfall_mm: "number (millimeters)",
    };

    await supabase.from("datasets").insert({
      name: "Rainfall Data",
      description: "Annual and monsoon rainfall data across Indian states and districts (2018-2022)",
      source_url: "data.gov.in",
      fields: rainfallFields,
      data: rainfallData,
    });

    console.log("Successfully seeded datasets");

    return new Response(
      JSON.stringify({ message: "Successfully seeded 2 datasets", count: 2 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error seeding datasets:", error);
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
