import { retrievalResponseTools } from "@/lib/tools/retrievalResponse.tools";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { question, userId } = await req.json();

        if (!question) {
            return NextResponse.json(
                { error: "Question is required" },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: "UserId is required" },
                { status: 400 }
            );
        }

        // Call the retrieval and question answering tool
        const result = await retrievalResponseTools.askQuestion(question, userId);

        let answer = "";
        if (result && result.answer) {
            if (typeof result.answer === "string") {
                answer = result.answer;
            } else if (typeof result.answer === "object" && "content" in result.answer) {
                answer = result.answer.content as string;
            } else {
                answer = JSON.stringify(result.answer);
            }
        }

        return NextResponse.json({
            success: true,
            answer,
            docs: result.docs,
        });
    } catch (error: any) {
        console.error("Error in /api/chat:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to retrieve answer" },
            { status: 500 }
        );
    }
}
