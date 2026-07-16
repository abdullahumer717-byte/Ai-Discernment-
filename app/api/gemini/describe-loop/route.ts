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
    const { taskGoal, productDesc, processDesc, performanceDesc } = await req.json();

    if (!taskGoal) {
      return NextResponse.json({ error: "Task goal is required." }, { status: 400 });
    }

    const prompt = `You are a cooperative AI assistant executing a task inside a "Description-Discernment Training Simulator".
The user is learning how to write effective Description Prompts across three dimensions: Product, Process, and Performance.

Here is the task goal the user wants you to complete:
\"\"\"
${taskGoal}
\"\"\"

The user has supplied these specific description instructions for you to follow:
1. Product Description (Format, style, level of detail, length):
\"\"\"
${productDesc || "No specific instructions provided (use standard best practices)"}
\"\"\"

2. Process Description (Methods, thinking frameworks, step-by-step reasoning):
\"\"\"
${processDesc || "No specific instructions provided (think logically and step-by-step)"}
\"\"\"

3. Performance Description (Collaboration behavior, tone, posture, feedback pacing):
\"\"\"
${performanceDesc || "No specific instructions provided (be a friendly, professional collaborator)"}
\"\"\"

Your task:
1. First, generate the actual output of the task based strictly on their description constraints.
2. Second, write a brief, meta-analytical explanation of how you attempted to honor their instructions for each of the three dimensions (Product, Process, and Performance). This helps them evaluate your process and performance.

Provide the response strictly in the requested JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master assistant executing tasks under strict multi-dimensional prompts. Your primary directive is to follow the user's instructions to the letter and reflect on your adherence.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskOutput: {
              type: Type.STRING,
              description: "The complete, formatted result of executing the task goal under the given description constraints."
            },
            adherenceAnalysis: {
              type: Type.OBJECT,
              properties: {
                productAdherence: {
                  type: Type.STRING,
                  description: "How you tailored the output structure, formatting, or length to match the Product Description."
                },
                processAdherence: {
                  type: Type.STRING,
                  description: "How you structured your thinking, reasoning steps, or methodology to match the Process Description."
                },
                performanceAdherence: {
                  type: Type.STRING,
                  description: "How you calibrated your tone, engagement style, or collaboration behavior to match the Performance Description."
                }
              },
              required: ["productAdherence", "processAdherence", "performanceAdherence"]
            }
          },
          required: ["taskOutput", "adherenceAnalysis"]
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
    console.error("Error in describe-loop endpoint:", error);
    return NextResponse.json({ error: error.message || "Failed to execute description-discernment loop." }, { status: 500 });
  }
}
