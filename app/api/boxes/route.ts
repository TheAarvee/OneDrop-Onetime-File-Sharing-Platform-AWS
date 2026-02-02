import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/backend/auth/verifyFirebaseToken";
import { getBoxes, insertBox } from "@/backend/services/dynamodb.service";
import { now } from "@/backend/utils/time";
import { generateBoxId } from "@/backend/utils/uuid";

// POST /api/boxes - Create a new box
export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const ownerId = await verifyFirebaseToken(authHeader || "");
    if (!ownerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boxId = generateBoxId();
    const body = await request.json();
    const boxName = body.boxName;
    const boxImage = body.boxImage;
    const box = {
        boxId,
        ownerId,
        boxName,
        boxImage,
        status: true,
        createdAt: now()
    };

    await insertBox(box);
    return NextResponse.json(box);
}

// GET /api/boxes - List all boxes for user
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const ownerId = await verifyFirebaseToken(authHeader || "");
    if (!ownerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boxes = await getBoxes(ownerId);
    return NextResponse.json(boxes);
}
