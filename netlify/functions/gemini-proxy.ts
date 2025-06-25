import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
  const apiKey = process.env.API_KEY;
  const body = JSON.parse(event.body);
  const { promptContent, systemInstruction } = body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-04-17",
      systemInstruction
    });

    const result = await model.generateContent(promptContent);
    return {
      statusCode: 200,
      body: JSON.stringify({ advice: result.response.text().trim() })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API request failed" })
    };
  }
};