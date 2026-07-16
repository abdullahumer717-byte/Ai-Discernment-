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
    const { taskGoal, productDesc, processDesc, performanceDesc, previousOutput, feedback, iterationCount } = await req.json();

    if (!taskGoal || !previousOutput || !feedback) {
      return NextResponse.json({ error: "Task goal, previous output, and feedback are required." }, { status: 400 });
    }

    const prompt = `You are an AI assistant in a "Description-Discernment Training Simulator" iterating on a draft.
The user is practicing "Description-Discernment loops" where they write initial constraints, evaluate your output, and provide corrective feedback.

Original Task Goal:
\"\"\"
${taskGoal}
\"\"\"

The original description instructions were:
Product: ${productDesc || "Not specified"}
Process: ${processDesc || "Not specified"}
Performance: ${performanceDesc || "Not specified"}

Here is the previous draft output:
\"\"\"
${previousOutput}
\"\"\"

The user has evaluated your previous draft and provided this corrective feedback/critique (using Product, Process, and Performance Discernment):
\"\"\"
${feedback}
\"\"\"

Your task:
1. Revise and refine the draft to fully address the user's feedback. Keep all previously correct parts intact, but correct the gaps, errors, style mismatches, or reasoning leaps pointed out by the user.
2. Provide a breakdown of how the feedback influenced the updated version in terms of:
   - Product (Accuracy, structure, detail)
   - Process (Reasoning, methodology)
   - Performance (Tone, style, collaboration)

Current Iteration: ${iterationCount || 2}

Provide the response strictly in the requested JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a highly adaptable, collaborative assistant that synthesizes constructive feedback to produce a perfect next-iteration draft.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedOutput: {
              type: Type.STRING,
              description: "The complete, pristine updated output incorporating all modifications."
            },
            refinementNotes: {
              type: Type.OBJECT,
              properties: {
                productChanges: {
                  type: Type.STRING,
                  description: "Specific improvements made to the accuracy, format, or detail."
                },
                processChanges: {
                  type: Type.STRING,
                  description: "Changes in your thinking flow, structure, or methodology."
                },
                performanceChanges: {
                  type: Type.STRING,
                  description: "How the voice, tone, or collaborative posture was adjusted."
                }
              },
              required: ["productChanges", "processChanges", "performanceChanges"]
            }
          },
          required: ["refinedOutput", "refinementNotes"]
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
    console.error("Error in describe-loop-refine endpoint:", error);
    return NextResponse.json({ error: error.message || "Failed to refine description-discernment loop." }, { status: 500 });
  }
}
