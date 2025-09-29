import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { question, answer } = await req.json();
    if (!question || !answer) {
      return new Response(JSON.stringify({ error: 'Question and answer are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert AI assistant evaluating an interview answer for a Full Stack Engineer role.
      Question: "${question}"
      Candidate's Answer: "${answer}"

      Evaluate the answer based on technical accuracy, clarity, and completeness.
      Provide a score from 1 to 10 and a brief, one-sentence justification for the score.
      Respond ONLY with a valid JSON object in the format: {"score": number, "justification": "..."}.
      Do not include any other text, explanations, or markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const evaluationText = response.text();

    return new Response(evaluationText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error evaluating answer with Gemini:', error);
    return new Response(JSON.stringify({ error: 'Failed to evaluate answer' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
