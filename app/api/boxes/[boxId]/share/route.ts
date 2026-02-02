import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/backend/auth/verifyFirebaseToken";
import { insertBoxShare } from "@/backend/services/dynamodb.service";
import { now } from "@/backend/utils/time";
import { generateShareToken } from "@/backend/utils/uuid";

// POST /api/boxes/[boxId]/share - Create share link
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
    const shareToken = generateShareToken();
    const boxShare = {
        shareToken,
        ownerId,
        boxId,
        expiresAt: now() + 10 * 60,  // 10 minutes in seconds (now() returns seconds)
        downloadCount: 0,
    };
    await insertBoxShare(boxShare);
    return NextResponse.json({ shareToken });
}
