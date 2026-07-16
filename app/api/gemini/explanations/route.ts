import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { domain, aspect } = await req.json();

    if (!domain || !aspect) {
      return NextResponse.json({ error: "Domain and aspect are required." }, { status: 400 });
    }

    const prompt = `You are a training simulator for AI Discernment. The user is an expert in the domain of "${domain}" and wants to evaluate AI explanations on the specific aspect: "${aspect}".

Your task is to generate exactly three different explanations/analyses about "${aspect}" in the domain of "${domain}". These explanations must have specific hidden profiles to test the user's "Product, Process, and Performance Discernment".

Create the following three explanations:

1. Profile A: "Slick Over-Generalizer"
   - Style: Beautifully formatted with bullet points, highly authoritative and smooth.
   - Content: Sounds perfectly convincing to a layman, but contains a subtle conceptual leap, a critical omission, or glosses over a key constraint that only a true expert would catch. Do not make it obviously stupid; make it highly persuasive yet slightly incomplete or over-simplified.

2. Profile B: "Rigid Academic"
   - Style: Extremely dense, dry, monolithic text blocks, zero engaging analogies.
   - Content: 100% accurate, highly detailed, technically immaculate, uses perfect advanced jargon, but is pedagogical trash and exhausting to read. There are no gaps or errors here, but it performs poorly in terms of readability and style for learning.

3. Profile C: "Creative Storyteller (with a subtle error)"
   - Style: Wonderfully engaging, filled with vivid analogies, extremely clear, welcoming, and easy to read.
   - Content: Highly memorable, but contains exactly one subtle factual error, a misleading analogy that breaks down under expert scrutiny, or a minor fabricated detail (hallucination) wrapped in beautiful prose.

Make sure all three explanations are comprehensive (at least 150-250 words each) so the user has enough substance to apply their domain knowledge.
Provide the output strictly in the requested JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert educational designer specializing in prompt engineering and AI discernment training. Generate three highly customized explanations with distinct pedagogical characteristics to help a professional practice spotting AI flaws.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanations: {
              type: Type.ARRAY,
              description: "A list of exactly three explanations with different profiles.",
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { 
                    type: Type.STRING,
                    description: "A, B, or C"
                  },
                  title: { 
                    type: Type.STRING, 
                    description: "A short, fitting title for this explanation" 
                  },
                  text: { 
                    type: Type.STRING, 
                    description: "The full body of the explanation" 
                  },
                  profile: { 
                    type: Type.STRING, 
                    description: "One of: over_generalizer, rigid_academic, analogous_hallucinator" 
                  },
                  profileName: {
                    type: Type.STRING,
                    description: "The name of this profile (e.g. 'The Slick Over-Generalizer')"
                  },
                  profileDescription: { 
                    type: Type.STRING, 
                    description: "A detailed explanation of why this profile behaves this way, what was deliberately omitted or wrong, and what the expert should have spotted." 
                  }
                },
                required: ["key", "title", "text", "profile", "profileName", "profileDescription"]
              }
            }
          },
          required: ["explanations"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error generating explanations:", error);
    return NextResponse.json({ error: error.message || "Failed to generate explanations." }, { status: 500 });
  }
}
