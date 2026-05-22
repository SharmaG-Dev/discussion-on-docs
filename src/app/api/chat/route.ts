import { retrievalResponseTools } from "@/lib/tools/retrievalResponse.tools";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { question, collectionId } = body;

        if (!question || !collectionId) {
            return NextResponse.json(
                { success: false, error: "Missing question or collectionId" },
                { status: 400 }
            );
        }

        const result = await retrievalResponseTools.askQuestion(question, collectionId);

        let answerText = "";
        if (typeof result.answer === "string") {
            answerText = result.answer;
        } else if (result.answer && typeof result.answer === "object" && "content" in result.answer) {
            answerText = String(result.answer.content);
        } else {
            answerText = JSON.stringify(result.answer);
        }

        return NextResponse.json({
            success: true,
            answer: answerText,
            docs: result.docs
        });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { success: false, error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
