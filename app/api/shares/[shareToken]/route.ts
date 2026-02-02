import { NextRequest, NextResponse } from "next/server";
import { getBoxShare, deleteBoxShare } from "@/backend/services/dynamodb.service";
import { listFiles } from "@/backend/services/s3.service";
import { now } from "@/backend/utils/time";

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
        return { valid: false, error: "Share link not found or already used", statusCode: 404 };
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

// GET /api/shares/[shareToken] - Open share and list files
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
    return NextResponse.json(files);
}
