import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge',
};
export default async function handler(req: Request) {
  // 1. We only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    
    const { resumeText } = await req.json();
    if (!resumeText) {
      return new Response(JSON.stringify({ error: 'resumeText is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    
    const prompt = `
      You are an expert recruitment assistant. Parse the following resume text and extract the candidate's full name, email address, and phone number.
      Respond ONLY with a valid JSON object in the format: {"name": "...", "email": "...", "phone": "..."}.
      If a field is not found, its value should be null. Do not include any other text, explanations, or markdown formatting like \`\`\`json.

      Resume Text:
      ---
      ${resumeText}
      ---
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const extractedText = response.text();

    
    return new Response(extractedText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error parsing resume with Gemini:', error);
    return new Response(JSON.stringify({ error: 'Failed to parse resume' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

