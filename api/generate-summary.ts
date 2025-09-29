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
    // The transcript will be an array of questions, answers, and scores
    const { transcript } = await req.json();
    if (!transcript || !Array.isArray(transcript)) {
      return new Response(JSON.stringify({ error: 'Transcript is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format the transcript for the AI
    const formattedTranscript = transcript.map(q => 
      `Question: ${q.text}\nAnswer: ${q.answer}\nScore: ${q.score}/10\nJustification: ${q.justification}`
    ).join('\n\n');

    const prompt = `
      You are an expert hiring manager for a Full Stack Engineer role.
      Based on the following interview transcript, please provide a concise, 3-4 sentence professional summary of the candidate's performance.
      Highlight their potential strengths and weaknesses regarding React and Node.js.
      Do not use markdown. Respond ONLY with the summary text.

      Transcript:
      ---
      ${formattedTranscript}
      ---
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summaryText = response.text();

    return new Response(JSON.stringify({ summary: summaryText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
