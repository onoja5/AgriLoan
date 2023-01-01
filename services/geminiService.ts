import { GoogleGenAI } from "@google/genai";
import { FieldLog, LoanApplication } from "../types";
import { formatDate } from "../utils/helpers";

// Ensure API_KEY is available in the environment.
// The build process or deployment environment must set this.
// For local development, you can use a .env file with a tool like dotenv,
// but for this project, we assume `process.env.API_KEY` is directly available.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY for Gemini is not set. AI features will not work.");
  // Potentially throw an error or have a fallback mechanism if critical
}

const ai = new GoogleGenAI({ apiKey: apiKey! }); // Use non-null assertion if you've checked or have a fallback.

const SYSTEM_INSTRUCTION = `You are an expert agricultural advisor specializing in Nigerian farming conditions. 
Your goal is to provide brief, actionable, and easy-to-understand advice to farmers based on their field log entries. 
Keep advice to 2-4 concise sentences. Address the farmer directly (e.g., 'You should consider...').
Focus on practical next steps or important observations related to the logged activity and notes.
If the advice is generic due to lack of specific details, state that more specific information could lead to better advice.`;

export const getAdviceForFieldLog = async (log: FieldLog, associatedLoan?: LoanApplication): Promise<string> => {
  if (!apiKey) {
    return "AI Advisor is currently unavailable (API key not configured).";
  }

  let promptContent = `Based on your field log entry for '${log.cropPlotId}':
Activity: ${log.activity} on ${formatDate(log.date)}.
Your Notes: "${log.notes}"
`;

  if (associatedLoan) {
    promptContent += `This plot is likely for ${associatedLoan.cropType}${associatedLoan.otherCropType ? ` (${associatedLoan.otherCropType})` : ''}.\n`;
  }
  if (log.estimatedYieldKg !== undefined) {
    promptContent += `You estimated a yield of ${log.estimatedYieldKg} kg.\n`;
  }

  promptContent += "\nWhat specific advice or next steps would you recommend for this situation?";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17", // Correct model
      contents: promptContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // temperature: 0.7, // Adjust for creativity vs. factuality if needed
        // topK: 10,
        // topP: 0.9,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
             return "AI Advisor: API key is invalid. Please contact support.";
        }
         return `AI Advisor: Error fetching advice - ${error.message}. Please try again later.`;
    }
    return "AI Advisor: An unknown error occurred while fetching advice.";
  }
};
