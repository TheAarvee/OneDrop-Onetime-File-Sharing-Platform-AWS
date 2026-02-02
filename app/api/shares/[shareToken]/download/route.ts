import { NextRequest, NextResponse } from "next/server";
import { PassThrough } from "stream";
import { getBoxShare, deleteBox, deleteBoxShare } from "@/backend/services/dynamodb.service";
import { listFiles } from "@/backend/services/s3.service";
import { S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "@/backend/config/env";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { now } from "@/backend/utils/time";
import archiver from "archiver";

const s3 = new S3Client({
    region: S3_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
});

// Helper function to validate share token
interface ShareValidation {
    valid: boolean;
    error?: string;
    statusCode?: number;
    share?: {
        shareToken: string;
        boxId: string;
        ownerId: string;
        expiresAt: number;
        downloadCount: number;
    };
}

async function validateShare(shareToken: string): Promise<ShareValidation> {
    const boxShare = await getBoxShare(shareToken);

    // Check if share exists
    if (!boxShare || boxShare.length === 0) {
        return { valid: false, error: "Share not found", statusCode: 404 };
    }

    const share = boxShare[0] as ShareValidation['share'];

    // Check if share is expired
    if (share!.expiresAt < now()) {
        // Delete expired share token (box remains intact)
        await deleteBoxShare(shareToken);
        return { valid: false, error: "Share link has expired", statusCode: 410 };
    }

    return { valid: true, share };
}

// GET /api/shares/[shareToken]/download - Download files as zip
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shareToken: string }> }
) {
    const { shareToken } = await params;
    const validation = await validateShare(shareToken);

    if (!validation.valid) {
        return NextResponse.json(
            { error: validation.error },
            { status: validation.statusCode }
        );
    }

    const { boxId, ownerId } = validation.share!;
    const files = await listFiles(ownerId, boxId);

    const archive = archiver("zip", { zlib: { level: 9 } });
    const zipStream = new PassThrough();
    archive.pipe(zipStream);

    for (const file of files) {
        const key = file.Key!;
        const fileName = key.split("/").pop();
        const s3Obj = await s3.send(new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
        }));

        archive.append(s3Obj.Body as any, { name: fileName! });
    }

    await archive.finalize();

    const chunks: Buffer[] = [];
    for await (const chunk of zipStream) {
        chunks.push(chunk as Buffer);
    }
    const zipBuffer = Buffer.concat(chunks);

    // After successful download, delete the box (with files) and share token
    await deleteBox(ownerId, boxId);
    await deleteBoxShare(shareToken);

    return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="box-${boxId}.zip"`,
            "Cache-Control": "no-store",
        },
    });
}
