import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/backend/auth/verifyFirebaseToken";
import { listFiles, getPresignedUploadUrl } from "@/backend/services/s3.service";

// POST /api/boxes/[boxId]/files - Get presigned URL for direct S3 upload
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ boxId: string }> }
) {
    const authHeader = request.headers.get("authorization");
    const ownerId = await verifyFirebaseToken(authHeader || "");
    if (!ownerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boxId } = await params;
    const body = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
        return NextResponse.json({ error: "fileName and contentType required" }, { status: 400 });
    }

    const { presignedUrl, key } = await getPresignedUploadUrl(ownerId, boxId, fileName, contentType);
    
    return NextResponse.json({ presignedUrl, key });
}

// GET /api/boxes/[boxId]/files - List files in box
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ boxId: string }> }
) {
    const authHeader = request.headers.get("authorization");
    const ownerId = await verifyFirebaseToken(authHeader || "");
    if (!ownerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boxId } = await params;
    const files = await listFiles(ownerId, boxId);
    return NextResponse.json(files);
}
