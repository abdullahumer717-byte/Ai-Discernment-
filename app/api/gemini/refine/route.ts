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
    const { domain, aspect, chosenExplanationText, critique } = await req.json();

    if (!domain || !aspect || !chosenExplanationText || !critique) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const prompt = `You are a professional educational editor collaborating with a domain expert in "${domain}".

We are refining an AI-generated explanation about "${aspect}" based on the expert's critical feedback.

Here is the original draft explanation:
\"\"\"
${chosenExplanationText}
\"\"\"

Here is the expert's detailed critique and corrections (Product, Process, and Performance Discernment):
\"\"\"
${critique}
\"\"\"

Your task is to generate:
1. A fully refined, pristine, professional-grade explanation that is conceptually perfect, has perfect logical flow (process), incorporates all necessary advanced nuance without being over-simplified (product), and has a tone that is engaging, clear, and perfectly uses correct terminology (performance).
2. A change summary outlining exactly what was added, what was corrected, and what stylistic edits were made.

Provide the response in the requested JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class technical editor and instructional designer. Your job is to co-create highly accurate, beautiful educational material by synthesizing raw drafts with expert human corrections.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedExplanation: {
              type: Type.STRING,
              description: "The complete, pristine, finalized explanation. Beautifully written, accurate, structured, with markdown formatting."
            },
            changeSummary: {
              type: Type.ARRAY,
              description: "A bulleted list of changes made to address the expert's critique.",
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: "Product (Accuracy/Detail), Process (Reasoning/Logic), or Performance (Style/Tone)"
                  },
                  description: {
                    type: Type.STRING,
                    description: "A description of what was changed and why."
                  }
                },
                required: ["category", "description"]
              }
            }
          },
          required: ["refinedExplanation", "changeSummary"]
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
    console.error("Error refining explanation:", error);
    return NextResponse.json({ error: error.message || "Failed to refine explanation." }, { status: 500 });
  }
}
