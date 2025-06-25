import { FieldLog, LoanApplication } from "../types";
import { formatDate } from "../utils/helpers";

const SYSTEM_INSTRUCTION = `You are an expert agricultural advisor specializing in Nigerian farming conditions. 
Your goal is to provide brief, actionable, and easy-to-understand advice to farmers based on their field log entries. 
Keep advice to 2-4 concise sentences. Address the farmer directly (e.g., 'You should consider...').
Focus on practical next steps or important observations related to the logged activity and notes.
If the advice is generic due to lack of specific details, state that more specific information could lead to better advice.`;

export const getAdviceForFieldLog = async (log: FieldLog, associatedLoan?: LoanApplication): Promise<string> => {
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
    // Call Netlify Function instead of Gemini API directly
    const response = await fetch('/.netlify/functions/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        promptContent, 
        systemInstruction: SYSTEM_INSTRUCTION
      })
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.advice.trim();
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    
    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('API key')) {
        return "AI Advisor: Configuration issue. Please contact support.";
      }
      if (error.message.includes('Network error')) {
        return "AI Advisor: Connection problem. Please check your network.";
      }
      return `AI Advisor: ${error.message}`;
    }
    
    return "AI Advisor: An unexpected error occurred. Please try again later.";
  }
};