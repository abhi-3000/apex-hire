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
    const { difficulty } = await req.json();
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return new Response(JSON.stringify({ error: 'Invalid difficulty level' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert interviewer hiring for a Full Stack Engineer role with a focus on React and Node.js.
      Generate one, and only one, interview question with a difficulty level of "${difficulty}".
      The question should be conceptual, concise, and directly related to full-stack development.
      Respond ONLY with the question text itself. Do not include any other text, explanations, or markdown formatting. Do not label the difficulty.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const questionText = response.text();

    return new Response(JSON.stringify({ question: questionText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating question with Gemini:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate question' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
