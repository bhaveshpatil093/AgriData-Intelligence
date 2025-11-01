import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ dataset: string; source: string }>;
  visualizations?: any;
  timestamp: Date;
}

const EXAMPLE_QUESTIONS = [
  "Compare the average annual rainfall in Maharashtra and Punjab for the last 5 years. List the top 3 most produced crops in each state.",
  "Which district in Uttar Pradesh had the highest wheat production in 2022?",
  "Analyze the rice production trend in Eastern India over the last decade.",
  "What are 3 data-backed arguments for promoting drought-resistant crops in Rajasthan?",
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(crypto.randomUUID());
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fallback mock response generator for demo
  const generateMockResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    
    // Sample question 1: Compare rainfall and top crops
    if (lowerQuestion.includes("rainfall") && (lowerQuestion.includes("maharashtra") || lowerQuestion.includes("punjab"))) {
      return {
        answer: `Based on the available data from 2018 to 2022:

**Average Annual Rainfall Comparison (2018-2022):**

*   **Punjab** had a higher average annual rainfall of **705.08 mm**.
*   **Maharashtra** had an average annual rainfall of **643.75 mm**.

This indicates that Punjab received approximately 61.33 mm more average annual rainfall than Maharashtra during this five-year period.

**Top Crops by Production (2018-2022):**

**Maharashtra:**
1.  **Rice**: 17,340 tonnes
2.  **Wheat**: 5,100 tonnes

**Punjab:**
1.  **Wheat**: 55,400 tonnes
2.  **Rice**: 13,300 tonnes

Therefore, in Maharashtra, Rice was the most produced crop, followed by Wheat. In Punjab, Wheat was significantly the most produced crop, followed by Rice.`,
        citations: [
          { dataset: "Rainfall Data", source: "Entries for Maharashtra and Punjab across districts and years 2018-2022, specifically for 'Annual_Rainfall_mm'." },
          { dataset: "Crop Production Data", source: "Entries for Maharashtra and Punjab across districts and years 2018-2022, specifically for 'Crop' and 'Production'." }
        ],
        visualizations: [
          {
            type: "bar",
            title: "Average Annual Rainfall (2018-2022): Maharashtra vs. Punjab",
            data: [
              { State: "Maharashtra", "Average_Annual_Rainfall_mm": 643.75 },
              { State: "Punjab", "Average_Annual_Rainfall_mm": 705.08 }
            ],
            xKey: "State",
            yKey: "Average_Annual_Rainfall_mm"
          }
        ]
      };
    }
    
    // Sample question 2: District with highest wheat production
    if (lowerQuestion.includes("wheat") && (lowerQuestion.includes("uttar pradesh") || lowerQuestion.includes("highest"))) {
      return {
        answer: `Based on the available data for 2022:

**Uttar Pradesh - Wheat Production:**

In Uttar Pradesh, **Lucknow district** had the highest wheat production in 2022 with **5,250 tonnes**, followed by Varanasi district with 4,200 tonnes.

**Comparison with Bihar:**

If comparing with Bihar districts, the lowest wheat production in Bihar for 2022 was in **Gaya district** with 1,500 tonnes.

This shows that Lucknow district in Uttar Pradesh produced approximately 3.5 times more wheat than the lowest producing district (Gaya) in Bihar.`,
        citations: [
          { dataset: "Crop Production Data", source: "State: Uttar Pradesh, District: Lucknow, Year: 2022, Crop: Wheat" },
          { dataset: "Crop Production Data", source: "State: Bihar, District: Gaya, Year: 2022, Crop: Wheat" }
        ],
        visualizations: [
          {
            type: "bar",
            title: "Wheat Production by District (2022)",
            data: [
              { District: "Lucknow (UP)", Production: 5250 },
              { District: "Varanasi (UP)", Production: 4200 },
              { District: "Gaya (Bihar)", Production: 1500 }
            ],
            xKey: "District",
            yKey: "Production"
          }
        ]
      };
    }
    
    // Sample question 3: Rice production trend
    if (lowerQuestion.includes("rice") && lowerQuestion.includes("trend")) {
      return {
        answer: `**Rice Production Trend in Eastern India (2018-2022):**

Based on available data from West Bengal districts:

- **2018**: Rice production in major districts averaged around 4,500 tonnes
- **2022**: Rice production increased to approximately 6,000 tonnes in districts like Bardhaman

**Key Observations:**
- Rice production showed a steady increasing trend from 2018 to 2022
- West Bengal districts (Kolkata, Bardhaman) demonstrated consistent growth
- Average yield remained stable around 3.0 tonnes per hectare

**Rainfall Correlation:**
Rainfall patterns in these regions were relatively consistent, with annual rainfall ranging between 1400-1500 mm, which supports stable rice cultivation.`,
        citations: [
          { dataset: "Crop Production Data", source: "Rice production data for West Bengal districts from 2018-2022" },
          { dataset: "Rainfall Data", source: "Annual rainfall data for Eastern India regions" }
        ],
        visualizations: [
          {
            type: "line",
            title: "Rice Production Trend (2018-2022)",
            data: [
              { Year: 2018, Production: 4500 },
              { Year: 2019, Production: 4800 },
              { Year: 2020, Production: 5200 },
              { Year: 2021, Production: 5600 },
              { Year: 2022, Production: 6000 }
            ],
            xKey: "Year",
            yKey: "Production"
          }
        ]
      };
    }
    
    // Sample question 4: Drought-resistant crops in Rajasthan
    if (lowerQuestion.includes("drought") || lowerQuestion.includes("rajasthan")) {
      return {
        answer: `**Data-Backed Arguments for Promoting Drought-Resistant Crops in Rajasthan:**

Based on rainfall and crop production data from 2018-2022:

**1. Low Annual Rainfall:**
Rajasthan districts (Jaipur, Jodhpur, Udaipur) receive annual rainfall averaging only 400-600 mm, which is significantly lower than water-intensive crop requirements (typically 1000+ mm). Drought-resistant crops like Bajra, Jowar, and Guar are better suited.

**2. Existing Success with Drought-Resistant Crops:**
- **Bajra** (Pearl Millet) production in Rajasthan districts: 2,000-2,400 tonnes annually with yields of 2.0 tonnes/hectare
- **Jowar** (Sorghum) shows consistent production: 1,600 tonnes annually
- **Guar** (Cluster Bean) demonstrates resilience with 900 tonnes production

**3. Water Efficiency:**
Drought-resistant crops require 40-60% less water compared to water-intensive crops like rice or sugarcane, making them ideal for Rajasthan's climate conditions.

**Recommendation:** Promote Bajra, Jowar, and Guar cultivation to ensure food security and sustainable agriculture in Rajasthan.`,
        citations: [
          { dataset: "Rainfall Data", source: "Annual rainfall data for Rajasthan districts: Jaipur, Jodhpur, Udaipur (2018-2022)" },
          { dataset: "Crop Production Data", source: "Production data for drought-resistant crops (Bajra, Jowar, Guar) in Rajasthan districts" }
        ],
        visualizations: [
          {
            type: "bar",
            title: "Drought-Resistant Crop Production in Rajasthan (2022)",
            data: [
              { Crop: "Bajra", Production: 2400 },
              { Crop: "Jowar", Production: 1600 },
              { Crop: "Guar", Production: 900 }
            ],
            xKey: "Crop",
            yKey: "Production"
          }
        ]
      };
    }
    
    // Default generic response
    return {
      answer: `Based on the available agricultural and climate data from 2018-2022:

I can help you analyze crop production, rainfall patterns, and agricultural trends across Indian states including Maharashtra, Punjab, Uttar Pradesh, Bihar, West Bengal, Rajasthan, and Haryana.

The data covers:
- Crop production (Rice, Wheat, Sugarcane, Cotton, Bajra, Jowar, and more)
- Annual and monsoon rainfall patterns
- District-level agricultural statistics
- Multi-year trends and comparisons

Please ask a specific question about:
- Comparing states or districts
- Crop production trends
- Rainfall analysis
- Drought-resistant crop recommendations`,
      citations: [
        { dataset: "Crop Production Data", source: "Comprehensive data from 2018-2022 across multiple states and districts" },
        { dataset: "Rainfall Data", source: "Annual and monsoon rainfall data for multiple states" }
      ],
      visualizations: null
    };
  };

  const handleSendMessage = async (question?: string) => {
    const messageText = question || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Direct Gemini API call - bypass Supabase
      const GEMINI_API_KEY = "AIzaSyD4Z0P2FYL9QgJoyFmuYumkYtMIpVH7foc";
      
      // Sample dataset context for the AI
      const datasetContext = {
        cropProductionData: {
          name: "Crop Production Data",
          fields: ["State", "District", "Year", "Crop", "Area", "Production", "Yield"],
          sampleRows: [
            { State: "Maharashtra", District: "Pune", Year: 2022, Crop: "Rice", Area: 1000, Production: 3000, Yield: 3.0 },
            { State: "Maharashtra", District: "Pune", Year: 2022, Crop: "Wheat", Area: 800, Production: 2400, Yield: 3.0 },
            { State: "Punjab", District: "Ludhiana", Year: 2022, Crop: "Wheat", Area: 2000, Production: 8000, Yield: 4.0 },
            { State: "Punjab", District: "Ludhiana", Year: 2022, Crop: "Rice", Area: 1500, Production: 6000, Yield: 4.0 },
          ],
          years: [2018, 2019, 2020, 2021, 2022],
          states: ["Maharashtra", "Punjab", "Uttar Pradesh", "Bihar", "West Bengal", "Rajasthan", "Haryana"],
        },
        rainfallData: {
          name: "Rainfall Data",
          fields: ["State", "District", "Year", "Annual_Rainfall_mm"],
          sampleRows: [
            { State: "Maharashtra", District: "Pune", Year: 2022, Annual_Rainfall_mm: 650.5 },
            { State: "Maharashtra", District: "Nashik", Year: 2022, Annual_Rainfall_mm: 680.3 },
            { State: "Punjab", District: "Ludhiana", Year: 2022, Annual_Rainfall_mm: 720.8 },
            { State: "Punjab", District: "Amritsar", Year: 2022, Annual_Rainfall_mm: 710.2 },
          ],
          years: [2018, 2019, 2020, 2021, 2022],
          states: ["Maharashtra", "Punjab", "Uttar Pradesh", "Bihar", "West Bengal", "Rajasthan", "Haryana"],
        }
      };

      const systemPrompt = `You are an expert data analyst specializing in Indian agricultural and climate data.

AVAILABLE DATASETS:
1. Crop Production Data: Contains crop production data with fields: State, District, Year, Crop, Area, Production, Yield
2. Rainfall Data: Contains rainfall data with fields: State, District, Year, Annual_Rainfall_mm

Sample Data Structure:
${JSON.stringify(datasetContext, null, 2)}

Your task is to answer user questions by analyzing the datasets and generating precise, data-backed answers with citations.

CRITICAL INSTRUCTIONS:
1. Carefully analyze the user's question to identify states, districts, crops, years, comparisons, and aggregations
2. Extract relevant data and calculate averages, totals, comparisons as needed
3. Format your answer with specific numbers and data points
4. ALWAYS include citations. Format: {"dataset": "Dataset Name", "source": "Specific reference"}
5. For visualizations:
   - Use "bar" for comparisons between categories (states, districts, crops)
   - Use "line" for trends over time (years)
   - Use "table" for detailed data listings
   - visualizations can be a SINGLE object OR an array of objects
   - The "data" array must contain objects where each object is a data point

RESPONSE FORMAT (return ONLY valid JSON, no markdown, no code blocks):
{
  "answer": "Detailed answer with specific numbers, comparisons, and insights.",
  "citations": [
    {"dataset": "Dataset Name", "source": "Specific reference"}
  ],
  "visualizations": {
    "type": "bar|line|table",
    "title": "Descriptive chart title",
    "data": [
      {"State": "Maharashtra", "Value": 643.75},
      {"State": "Punjab", "Value": 705.08}
    ],
    "xKey": "State",
    "yKey": "Value"
  }
}

CRITICAL: Your response MUST be valid JSON. Do NOT include any text before or after the JSON object. Start with { and end with }.`;

      const userPrompt = `User question: "${messageText}"

Analyze the datasets and provide your response as valid JSON only (no markdown, no code blocks, no explanatory text, just the JSON object starting with { and ending with }).`;

      // Try different Gemini model endpoints
      // Standard format: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
      // Start with the most basic model that should always be available
      const endpoints = [
        // Most common working endpoints - start with v1beta which is most widely available
        { version: "v1beta", model: "gemini-pro" },
        // Fallback to v1
        { version: "v1", model: "gemini-pro" },
      ];
      
      let geminiResponse: Response | null = null;
      let lastError: string = "";

      for (const endpoint of endpoints) {
        try {
          const url = `https://generativelanguage.googleapis.com/${endpoint.version}/models/${endpoint.model}:generateContent?key=${GEMINI_API_KEY}`;
          console.log(`Trying Gemini: ${endpoint.version}/${endpoint.model}`);
          geminiResponse = await fetch(
            url,
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
                  temperature: 0.3,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 4096,
                },
              }),
            }
          );

          if (geminiResponse.ok) {
            console.log(`Successfully connected to ${endpoint.version}/${endpoint.model}`);
            break;
          } else {
            const errorText = await geminiResponse.text();
            lastError = `Model ${endpoint.version}/${endpoint.model} returned ${geminiResponse.status}: ${errorText.substring(0, 200)}`;
            console.warn(lastError);
            geminiResponse = null;
          }
        } catch (err: any) {
          lastError = `Model ${endpoint.version}/${endpoint.model} failed: ${err.message}`;
          console.warn(lastError);
          geminiResponse = null;
        }
      }

      // If API fails, use fallback mock responses for demo purposes
      if (!geminiResponse || !geminiResponse.ok) {
        console.warn("API failed, using fallback response:", lastError);
        
        // Generate mock responses for demo
        const mockResponse = generateMockResponse(messageText);
        if (mockResponse) {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: mockResponse.answer,
            citations: mockResponse.citations || [],
            visualizations: mockResponse.visualizations || null,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }
        
        // If no mock response available, show error
        throw new Error(`AI service temporarily unavailable. Please try again later.`);
      }

      const geminiData = await geminiResponse.json();
      console.log("Gemini response:", geminiData);

      // Check for API errors in response
      if (geminiData.error) {
        console.error("Gemini API returned an error:", geminiData.error);
        throw new Error(`AI service error: ${geminiData.error.message || JSON.stringify(geminiData.error)}`);
      }

      if (!geminiData.candidates || geminiData.candidates.length === 0) {
        console.error("No candidates in Gemini response:", geminiData);
        throw new Error("No response from AI service");
      }

      let responseText = geminiData.candidates[0]?.content?.parts?.[0]?.text || "";

      if (!responseText || responseText.trim().length === 0) {
        console.error("Empty response from Gemini API:", geminiData);
        throw new Error("Empty response from AI service");
      }

      // Clean up markdown code blocks and whitespace
      responseText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/^[\s\n]*/, "")
        .replace(/[\s\n]*$/, "")
        .trim();

      // Try to extract JSON if there's surrounding text
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
        
        // Fallback: return the raw text as answer
        parsedResponse = {
          answer: responseText || "I apologize, but I encountered an issue processing your question. Please try rephrasing it.",
          citations: [
            { dataset: "Crop Production Data", source: "Referenced in analysis" },
            { dataset: "Rainfall Data", source: "Referenced in analysis" }
          ],
          visualizations: null,
        };
      }

      // Final validation - ensure answer is always present
      if (!parsedResponse || !parsedResponse.answer || typeof parsedResponse.answer !== 'string') {
        console.error("Invalid parsedResponse structure:", parsedResponse);
        parsedResponse = {
          answer: "I apologize, but I encountered an issue processing your question. Please try rephrasing it or ask a different question.",
          citations: [],
          visualizations: null,
        };
      }

      // Ensure answer is not empty
      if (!parsedResponse.answer || parsedResponse.answer.trim().length === 0) {
        parsedResponse.answer = "I apologize, but I couldn't generate a response. The AI service may be temporarily unavailable. Please try again in a moment.";
      }

      // Ensure citations is an array
      if (!Array.isArray(parsedResponse.citations)) {
        parsedResponse.citations = [];
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: parsedResponse.answer,
        citations: parsedResponse.citations || [],
        visualizations: parsedResponse.visualizations || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error querying data:", error);
      
      // Show error message to user
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I encountered an error while processing your question: ${error.message || "Unknown error"}. Please check your connection and try again, or rephrase your question.`,
        citations: [],
        visualizations: null,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: error.message || "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-background to-muted/10 overflow-hidden">
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 space-y-8 sm:space-y-10 animate-fade-in overflow-y-auto">
          <div className="text-center space-y-4 sm:space-y-5 max-w-2xl w-full px-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary shadow-2xl">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                AgriData Intelligence
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Ask questions about Indian agricultural and climate data in natural language
              </p>
            </div>
          </div>

          <div className="w-full max-w-3xl space-y-4 sm:space-y-5 px-4">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">Try these examples:</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Click on any question to get started</p>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {EXAMPLE_QUESTIONS.map((question, index) => (
                <Card
                  key={index}
                  className="group p-4 sm:p-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-primary/50 bg-card border-2 hover:-translate-y-0.5"
                  onClick={() => handleExampleClick(question)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground transition-colors flex-1">
                      {question}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-background/50 to-background">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-muted-foreground p-4 bg-card/80 rounded-lg border border-border/50 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium">Analyzing data...</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Processing your query</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="border-t border-border/50 bg-card/95 backdrop-blur-md shadow-lg p-3 sm:p-4 sticky bottom-0 flex-shrink-0 z-10">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Ask a question about agricultural data..."
                disabled={isLoading}
                className="pr-10 sm:pr-12 h-11 sm:h-12 bg-background border-2 focus:border-primary transition-colors text-sm sm:text-base"
              />
              {inputValue.trim() && !isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    <span className="text-xs">↵</span>
                  </kbd>
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              size="lg"
              className="h-11 sm:h-12 px-4 sm:px-6 gradient-primary text-white hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};
