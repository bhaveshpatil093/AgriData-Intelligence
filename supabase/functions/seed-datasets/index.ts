// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive crop production data covering multiple states, districts, years, and crops
const cropProductionData = [
  // Maharashtra - 2018-2022
  { State: "Maharashtra", District: "Pune", Year: 2022, Crop: "Rice", Area: 1000, Production: 3000, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2022, Crop: "Wheat", Area: 800, Production: 2400, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2022, Crop: "Sugarcane", Area: 500, Production: 35000, Yield: 70.0 },
  { State: "Maharashtra", District: "Nashik", Year: 2022, Crop: "Rice", Area: 1200, Production: 3600, Yield: 3.0 },
  { State: "Maharashtra", District: "Nashik", Year: 2022, Crop: "Wheat", Area: 900, Production: 2700, Yield: 3.0 },
  { State: "Maharashtra", District: "Nashik", Year: 2022, Crop: "Grapes", Area: 300, Production: 4500, Yield: 15.0 },
  { State: "Maharashtra", District: "Nagpur", Year: 2022, Crop: "Cotton", Area: 1500, Production: 2250, Yield: 1.5 },
  { State: "Maharashtra", District: "Nagpur", Year: 2022, Crop: "Soybean", Area: 2000, Production: 4000, Yield: 2.0 },
  
  // Punjab - 2018-2022
  { State: "Punjab", District: "Ludhiana", Year: 2022, Crop: "Rice", Area: 2000, Production: 7000, Yield: 3.5 },
  { State: "Punjab", District: "Ludhiana", Year: 2022, Crop: "Wheat", Area: 2500, Production: 10000, Yield: 4.0 },
  { State: "Punjab", District: "Amritsar", Year: 2022, Crop: "Rice", Area: 1800, Production: 6300, Yield: 3.5 },
  { State: "Punjab", District: "Amritsar", Year: 2022, Crop: "Wheat", Area: 2200, Production: 8800, Yield: 4.0 },
  { State: "Punjab", District: "Patiala", Year: 2022, Crop: "Rice", Area: 1600, Production: 5600, Yield: 3.5 },
  { State: "Punjab", District: "Patiala", Year: 2022, Crop: "Wheat", Area: 2000, Production: 8000, Yield: 4.0 },
  
  // Uttar Pradesh - 2018-2022
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2022, Crop: "Wheat", Area: 1500, Production: 5250, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2022, Crop: "Rice", Area: 1300, Production: 3900, Yield: 3.0 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2022, Crop: "Wheat", Area: 1200, Production: 4200, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2022, Crop: "Rice", Area: 1100, Production: 3300, Yield: 3.0 },
  { State: "Uttar Pradesh", District: "Kanpur", Year: 2022, Crop: "Wheat", Area: 1400, Production: 4900, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Kanpur", Year: 2022, Crop: "Sugarcane", Area: 800, Production: 56000, Yield: 70.0 },
  
  // Bihar - 2018-2022
  { State: "Bihar", District: "Patna", Year: 2022, Crop: "Wheat", Area: 800, Production: 2400, Yield: 3.0 },
  { State: "Bihar", District: "Patna", Year: 2022, Crop: "Rice", Area: 900, Production: 2700, Yield: 3.0 },
  { State: "Bihar", District: "Gaya", Year: 2022, Crop: "Wheat", Area: 600, Production: 1500, Yield: 2.5 },
  { State: "Bihar", District: "Gaya", Year: 2022, Crop: "Rice", Area: 700, Production: 2100, Yield: 3.0 },
  { State: "Bihar", District: "Muzaffarpur", Year: 2022, Crop: "Rice", Area: 850, Production: 2550, Yield: 3.0 },
  
  // West Bengal - 2018-2022
  { State: "West Bengal", District: "Kolkata", Year: 2022, Crop: "Rice", Area: 1500, Production: 4500, Yield: 3.0 },
  { State: "West Bengal", District: "Kolkata", Year: 2022, Crop: "Potato", Area: 600, Production: 12000, Yield: 20.0 },
  { State: "West Bengal", District: "Bardhaman", Year: 2022, Crop: "Rice", Area: 2000, Production: 6000, Yield: 3.0 },
  
  // Rajasthan - 2018-2022 (drought-resistant crops)
  { State: "Rajasthan", District: "Jaipur", Year: 2022, Crop: "Bajra", Area: 1000, Production: 2000, Yield: 2.0 },
  { State: "Rajasthan", District: "Jaipur", Year: 2022, Crop: "Jowar", Area: 800, Production: 1600, Yield: 2.0 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2022, Crop: "Bajra", Area: 1200, Production: 2400, Yield: 2.0 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2022, Crop: "Guar", Area: 600, Production: 900, Yield: 1.5 },
  { State: "Rajasthan", District: "Udaipur", Year: 2022, Crop: "Cotton", Area: 500, Production: 750, Yield: 1.5 },
  { State: "Rajasthan", District: "Udaipur", Year: 2022, Crop: "Bajra", Area: 900, Production: 1800, Yield: 2.0 },
  
  // Haryana - 2018-2022
  { State: "Haryana", District: "Karnal", Year: 2022, Crop: "Wheat", Area: 1800, Production: 7200, Yield: 4.0 },
  { State: "Haryana", District: "Karnal", Year: 2022, Crop: "Rice", Area: 1400, Production: 4900, Yield: 3.5 },
  { State: "Haryana", District: "Hisar", Year: 2022, Crop: "Wheat", Area: 1600, Production: 6400, Yield: 4.0 },
  { State: "Haryana", District: "Hisar", Year: 2022, Crop: "Bajra", Area: 800, Production: 1600, Yield: 2.0 },
  
  // Historical data 2018-2021 for trend analysis
  // Maharashtra
  { State: "Maharashtra", District: "Pune", Year: 2021, Crop: "Rice", Area: 950, Production: 2850, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2021, Crop: "Wheat", Area: 780, Production: 2340, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2020, Crop: "Rice", Area: 900, Production: 2700, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2020, Crop: "Wheat", Area: 750, Production: 2250, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2019, Crop: "Rice", Area: 880, Production: 2640, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2019, Crop: "Wheat", Area: 730, Production: 2190, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2018, Crop: "Rice", Area: 850, Production: 2550, Yield: 3.0 },
  { State: "Maharashtra", District: "Pune", Year: 2018, Crop: "Wheat", Area: 700, Production: 2100, Yield: 3.0 },
  
  // Punjab
  { State: "Punjab", District: "Ludhiana", Year: 2021, Crop: "Wheat", Area: 2400, Production: 9600, Yield: 4.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2021, Crop: "Rice", Area: 1900, Production: 6650, Yield: 3.5 },
  { State: "Punjab", District: "Ludhiana", Year: 2020, Crop: "Wheat", Area: 2300, Production: 9200, Yield: 4.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2020, Crop: "Rice", Area: 1850, Production: 6475, Yield: 3.5 },
  { State: "Punjab", District: "Ludhiana", Year: 2019, Crop: "Wheat", Area: 2250, Production: 9000, Yield: 4.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2019, Crop: "Rice", Area: 1800, Production: 6300, Yield: 3.5 },
  { State: "Punjab", District: "Ludhiana", Year: 2018, Crop: "Wheat", Area: 2200, Production: 8800, Yield: 4.0 },
  { State: "Punjab", District: "Ludhiana", Year: 2018, Crop: "Rice", Area: 1750, Production: 6125, Yield: 3.5 },
  
  // Uttar Pradesh
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2021, Crop: "Wheat", Area: 1400, Production: 4900, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2021, Crop: "Wheat", Area: 1150, Production: 4025, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2020, Crop: "Wheat", Area: 1350, Production: 4725, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2020, Crop: "Wheat", Area: 1100, Production: 3850, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2019, Crop: "Wheat", Area: 1300, Production: 4550, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2019, Crop: "Wheat", Area: 1050, Production: 3675, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2018, Crop: "Wheat", Area: 1250, Production: 4375, Yield: 3.5 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2018, Crop: "Wheat", Area: 1000, Production: 3500, Yield: 3.5 },
];

// Comprehensive rainfall data covering multiple states, districts, and years (2018-2022)
const rainfallData = [
  // Maharashtra - 2018-2022
  { State: "Maharashtra", District: "Pune", Year: 2022, Annual_Rainfall_mm: 650.5, Monsoon_Rainfall_mm: 550.2 },
  { State: "Maharashtra", District: "Nashik", Year: 2022, Annual_Rainfall_mm: 680.3, Monsoon_Rainfall_mm: 575.8 },
  { State: "Maharashtra", District: "Nagpur", Year: 2022, Annual_Rainfall_mm: 1100.5, Monsoon_Rainfall_mm: 950.2 },
  { State: "Maharashtra", District: "Pune", Year: 2021, Annual_Rainfall_mm: 625.3, Monsoon_Rainfall_mm: 530.1 },
  { State: "Maharashtra", District: "Nashik", Year: 2021, Annual_Rainfall_mm: 670.8, Monsoon_Rainfall_mm: 570.5 },
  { State: "Maharashtra", District: "Pune", Year: 2020, Annual_Rainfall_mm: 640.8, Monsoon_Rainfall_mm: 545.6 },
  { State: "Maharashtra", District: "Nashik", Year: 2020, Annual_Rainfall_mm: 675.2, Monsoon_Rainfall_mm: 573.4 },
  { State: "Maharashtra", District: "Pune", Year: 2019, Annual_Rainfall_mm: 635.4, Monsoon_Rainfall_mm: 540.2 },
  { State: "Maharashtra", District: "Nashik", Year: 2019, Annual_Rainfall_mm: 665.7, Monsoon_Rainfall_mm: 565.8 },
  { State: "Maharashtra", District: "Pune", Year: 2018, Annual_Rainfall_mm: 630.2, Monsoon_Rainfall_mm: 535.8 },
  { State: "Maharashtra", District: "Nashik", Year: 2018, Annual_Rainfall_mm: 660.5, Monsoon_Rainfall_mm: 560.3 },
  
  // Punjab - 2018-2022
  { State: "Punjab", District: "Ludhiana", Year: 2022, Annual_Rainfall_mm: 720.8, Monsoon_Rainfall_mm: 600.5 },
  { State: "Punjab", District: "Amritsar", Year: 2022, Annual_Rainfall_mm: 710.2, Monsoon_Rainfall_mm: 595.3 },
  { State: "Punjab", District: "Patiala", Year: 2022, Annual_Rainfall_mm: 715.5, Monsoon_Rainfall_mm: 598.2 },
  { State: "Punjab", District: "Ludhiana", Year: 2021, Annual_Rainfall_mm: 695.4, Monsoon_Rainfall_mm: 580.2 },
  { State: "Punjab", District: "Amritsar", Year: 2021, Annual_Rainfall_mm: 685.8, Monsoon_Rainfall_mm: 572.1 },
  { State: "Punjab", District: "Ludhiana", Year: 2020, Annual_Rainfall_mm: 705.2, Monsoon_Rainfall_mm: 590.8 },
  { State: "Punjab", District: "Amritsar", Year: 2020, Annual_Rainfall_mm: 695.6, Monsoon_Rainfall_mm: 582.5 },
  { State: "Punjab", District: "Ludhiana", Year: 2019, Annual_Rainfall_mm: 700.6, Monsoon_Rainfall_mm: 585.4 },
  { State: "Punjab", District: "Amritsar", Year: 2019, Annual_Rainfall_mm: 690.2, Monsoon_Rainfall_mm: 577.8 },
  { State: "Punjab", District: "Ludhiana", Year: 2018, Annual_Rainfall_mm: 698.3, Monsoon_Rainfall_mm: 583.7 },
  { State: "Punjab", District: "Amritsar", Year: 2018, Annual_Rainfall_mm: 688.5, Monsoon_Rainfall_mm: 575.2 },
  
  // Uttar Pradesh - 2018-2022
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2022, Annual_Rainfall_mm: 980.5, Monsoon_Rainfall_mm: 820.3 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2022, Annual_Rainfall_mm: 1050.8, Monsoon_Rainfall_mm: 880.5 },
  { State: "Uttar Pradesh", District: "Kanpur", Year: 2022, Annual_Rainfall_mm: 950.2, Monsoon_Rainfall_mm: 795.8 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2021, Annual_Rainfall_mm: 965.3, Monsoon_Rainfall_mm: 810.5 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2021, Annual_Rainfall_mm: 1035.7, Monsoon_Rainfall_mm: 870.2 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2020, Annual_Rainfall_mm: 972.8, Monsoon_Rainfall_mm: 815.6 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2020, Annual_Rainfall_mm: 1042.5, Monsoon_Rainfall_mm: 875.8 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2019, Annual_Rainfall_mm: 968.2, Monsoon_Rainfall_mm: 812.4 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2019, Annual_Rainfall_mm: 1038.6, Monsoon_Rainfall_mm: 872.5 },
  { State: "Uttar Pradesh", District: "Lucknow", Year: 2018, Annual_Rainfall_mm: 963.5, Monsoon_Rainfall_mm: 808.7 },
  { State: "Uttar Pradesh", District: "Varanasi", Year: 2018, Annual_Rainfall_mm: 1033.2, Monsoon_Rainfall_mm: 868.1 },
  
  // Bihar - 2018-2022
  { State: "Bihar", District: "Patna", Year: 2022, Annual_Rainfall_mm: 1150.7, Monsoon_Rainfall_mm: 950.2 },
  { State: "Bihar", District: "Gaya", Year: 2022, Annual_Rainfall_mm: 1020.5, Monsoon_Rainfall_mm: 870.8 },
  { State: "Bihar", District: "Muzaffarpur", Year: 2022, Annual_Rainfall_mm: 1180.3, Monsoon_Rainfall_mm: 980.5 },
  { State: "Bihar", District: "Patna", Year: 2021, Annual_Rainfall_mm: 1135.8, Monsoon_Rainfall_mm: 940.5 },
  { State: "Bihar", District: "Gaya", Year: 2021, Annual_Rainfall_mm: 1008.2, Monsoon_Rainfall_mm: 860.3 },
  { State: "Bihar", District: "Patna", Year: 2020, Annual_Rainfall_mm: 1142.5, Monsoon_Rainfall_mm: 945.8 },
  { State: "Bihar", District: "Gaya", Year: 2020, Annual_Rainfall_mm: 1015.6, Monsoon_Rainfall_mm: 865.2 },
  { State: "Bihar", District: "Patna", Year: 2019, Annual_Rainfall_mm: 1128.3, Monsoon_Rainfall_mm: 932.7 },
  { State: "Bihar", District: "Gaya", Year: 2019, Annual_Rainfall_mm: 998.5, Monsoon_Rainfall_mm: 855.4 },
  { State: "Bihar", District: "Patna", Year: 2018, Annual_Rainfall_mm: 1120.6, Monsoon_Rainfall_mm: 928.2 },
  { State: "Bihar", District: "Gaya", Year: 2018, Annual_Rainfall_mm: 992.8, Monsoon_Rainfall_mm: 850.1 },
  
  // West Bengal - 2018-2022
  { State: "West Bengal", District: "Kolkata", Year: 2022, Annual_Rainfall_mm: 1620.4, Monsoon_Rainfall_mm: 1350.8 },
  { State: "West Bengal", District: "Bardhaman", Year: 2022, Annual_Rainfall_mm: 1520.8, Monsoon_Rainfall_mm: 1280.5 },
  { State: "West Bengal", District: "Kolkata", Year: 2021, Annual_Rainfall_mm: 1595.2, Monsoon_Rainfall_mm: 1330.6 },
  { State: "West Bengal", District: "Bardhaman", Year: 2021, Annual_Rainfall_mm: 1502.5, Monsoon_Rainfall_mm: 1265.8 },
  { State: "West Bengal", District: "Kolkata", Year: 2020, Annual_Rainfall_mm: 1608.7, Monsoon_Rainfall_mm: 1342.3 },
  { State: "West Bengal", District: "Bardhaman", Year: 2020, Annual_Rainfall_mm: 1515.3, Monsoon_Rainfall_mm: 1275.2 },
  { State: "West Bengal", District: "Kolkata", Year: 2019, Annual_Rainfall_mm: 1585.6, Monsoon_Rainfall_mm: 1322.4 },
  { State: "West Bengal", District: "Bardhaman", Year: 2019, Annual_Rainfall_mm: 1498.2, Monsoon_Rainfall_mm: 1260.7 },
  { State: "West Bengal", District: "Kolkata", Year: 2018, Annual_Rainfall_mm: 1578.5, Monsoon_Rainfall_mm: 1315.8 },
  { State: "West Bengal", District: "Bardhaman", Year: 2018, Annual_Rainfall_mm: 1485.7, Monsoon_Rainfall_mm: 1250.3 },
  
  // Rajasthan - 2018-2022 (low rainfall region)
  { State: "Rajasthan", District: "Jaipur", Year: 2022, Annual_Rainfall_mm: 550.2, Monsoon_Rainfall_mm: 480.5 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2022, Annual_Rainfall_mm: 380.7, Monsoon_Rainfall_mm: 320.4 },
  { State: "Rajasthan", District: "Udaipur", Year: 2022, Annual_Rainfall_mm: 620.5, Monsoon_Rainfall_mm: 540.8 },
  { State: "Rajasthan", District: "Jaipur", Year: 2021, Annual_Rainfall_mm: 535.8, Monsoon_Rainfall_mm: 470.2 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2021, Annual_Rainfall_mm: 360.5, Monsoon_Rainfall_mm: 305.2 },
  { State: "Rajasthan", District: "Udaipur", Year: 2021, Annual_Rainfall_mm: 605.3, Monsoon_Rainfall_mm: 528.5 },
  { State: "Rajasthan", District: "Jaipur", Year: 2020, Annual_Rainfall_mm: 542.6, Monsoon_Rainfall_mm: 475.8 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2020, Annual_Rainfall_mm: 375.2, Monsoon_Rainfall_mm: 318.6 },
  { State: "Rajasthan", District: "Udaipur", Year: 2020, Annual_Rainfall_mm: 615.8, Monsoon_Rainfall_mm: 538.2 },
  { State: "Rajasthan", District: "Jaipur", Year: 2019, Annual_Rainfall_mm: 538.4, Monsoon_Rainfall_mm: 472.5 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2019, Annual_Rainfall_mm: 365.8, Monsoon_Rainfall_mm: 310.5 },
  { State: "Rajasthan", District: "Udaipur", Year: 2019, Annual_Rainfall_mm: 610.2, Monsoon_Rainfall_mm: 532.8 },
  { State: "Rajasthan", District: "Jaipur", Year: 2018, Annual_Rainfall_mm: 530.5, Monsoon_Rainfall_mm: 465.2 },
  { State: "Rajasthan", District: "Jodhpur", Year: 2018, Annual_Rainfall_mm: 355.6, Monsoon_Rainfall_mm: 302.8 },
  { State: "Rajasthan", District: "Udaipur", Year: 2018, Annual_Rainfall_mm: 605.8, Monsoon_Rainfall_mm: 528.5 },
  
  // Haryana - 2018-2022
  { State: "Haryana", District: "Karnal", Year: 2022, Annual_Rainfall_mm: 680.5, Monsoon_Rainfall_mm: 575.2 },
  { State: "Haryana", District: "Hisar", Year: 2022, Annual_Rainfall_mm: 420.8, Monsoon_Rainfall_mm: 360.5 },
  { State: "Haryana", District: "Karnal", Year: 2021, Annual_Rainfall_mm: 665.3, Monsoon_Rainfall_mm: 562.8 },
  { State: "Haryana", District: "Hisar", Year: 2021, Annual_Rainfall_mm: 408.5, Monsoon_Rainfall_mm: 352.2 },
  { State: "Haryana", District: "Karnal", Year: 2020, Annual_Rainfall_mm: 672.6, Monsoon_Rainfall_mm: 568.5 },
  { State: "Haryana", District: "Hisar", Year: 2020, Annual_Rainfall_mm: 415.2, Monsoon_Rainfall_mm: 358.8 },
  { State: "Haryana", District: "Karnal", Year: 2019, Annual_Rainfall_mm: 668.4, Monsoon_Rainfall_mm: 565.2 },
  { State: "Haryana", District: "Hisar", Year: 2019, Annual_Rainfall_mm: 412.5, Monsoon_Rainfall_mm: 355.6 },
  { State: "Haryana", District: "Karnal", Year: 2018, Annual_Rainfall_mm: 662.8, Monsoon_Rainfall_mm: 560.5 },
  { State: "Haryana", District: "Hisar", Year: 2018, Annual_Rainfall_mm: 405.6, Monsoon_Rainfall_mm: 350.2 },
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
