import { uploadTools } from "@/lib/tools/uploads.tools"
import { deleteSingleUpload, getSingleUpload } from "@/lib/uploadsStatus"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
    try {
        let id: string | undefined
        try {
            const body = await req.json()
            id = body?.id
        } catch {
            // no body
        }

        if (!id) {
            const { searchParams } = new URL(req.url)
            id = searchParams.get("id") ?? undefined
        }

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing id" },
                { status: 400 }
            )
        }

        const rec = await getSingleUpload(id)
        if (!rec) {
            return NextResponse.json(
                { success: false, error: "Upload not found" },
                { status: 404 }
            )
        }

        const deletedFile = await uploadTools.deleteUploadFile(rec.filePath || "")
        await deleteSingleUpload(id)
        await uploadTools.emptyCromaDb(id)

        return NextResponse.json({
            success: true,
            id,
            deletedFile,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message ?? String(error) },
            { status: 500 }
        )
    }
}
