
import { uploadQueue } from "@/lib/queue";
import { getAllUploads, initUploadRecord, patchUploadRecord, setUploadStatus } from "@/lib/uploadsStatus";
import { uploadTools } from "@/lib/tools/uploads.tools";
import { QueuesNames } from "@/types/queue";
import { NextResponse } from "next/server";
import { v4 as uuidV4 } from 'uuid'




export async function POST(req: Request) {
    try {
        const uploadId = uuidV4()
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const userId = formData.get('userId') as string
        if (!file) {
            return Response.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }
        await initUploadRecord({
            userId: userId || 'unkown-user',
            id: uploadId,
            originalName: file.name,
            mimeType: file.type,
        })

        await setUploadStatus(uploadId, "Uploading...")

        const uploaded = await uploadTools.uploadFile(file)
        await patchUploadRecord(uploadId, {
            filePath: uploaded.filePath,
            previewPath: uploaded.previewPath,
        })

        await uploadQueue.add(QueuesNames.UPLOAD, {
            userId: userId || 'unknown-user',
            id: uploadId,
            filePath: uploaded.filePath,
            previewPath: uploaded.previewPath,
            originalName: file.name,
            mimeType: file.type,
        })

        return Response.json({
            success: true,
            id: uploadId,
        });
    } catch (error) {
        console.error(error);

        return Response.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}



export async function GET(req: Request) {
    try {
        const uploads = await getAllUploads()

        return NextResponse.json({
            status: true,
            uploads,
        })
    } catch (error) {
        return NextResponse.json({
            status: false,
            error: error,
        })
    }
}
